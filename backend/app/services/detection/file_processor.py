from app.models.schemas import DetectionResult
import logging
import math
import os
from collections import Counter
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

# ── Known magic-byte signatures ──────────────────────────────────────────────
MAGIC_BYTES = {
    b"\x4d\x5a": "PE Executable (EXE/DLL)",
    b"\x50\x4b\x03\x04": "ZIP Archive (may contain macros)",
    b"\xd0\xcf\x11\xe0": "OLE2 Compound Document (DOC/XLS with potential macros)",
    b"\x25\x50\x44\x46": "PDF Document",
    b"\x7f\x45\x4c\x46": "ELF Executable (Linux)",
    b"\xca\xfe\xba\xbe": "Mach-O Universal Binary (macOS)",
    b"\xfe\xed\xfa\xce": "Mach-O 32-bit (macOS)",
    b"\xfe\xed\xfa\xcf": "Mach-O 64-bit (macOS)",
}

HIGH_RISK_EXTENSIONS = {
    ".exe", ".bat", ".cmd", ".com", ".vbs", ".vbe", ".js", ".jse",
    ".ws", ".wsf", ".wsc", ".wsh", ".ps1", ".psc1", ".scr", ".sct",
    ".msi", ".msp", ".hta", ".cpl", ".inf", ".reg", ".dll", ".sys",
}

MEDIUM_RISK_EXTENSIONS = {
    ".doc", ".docm", ".xls", ".xlsm", ".ppt", ".pptm", ".rtf",
    ".pdf", ".zip", ".rar", ".7z", ".tar", ".gz", ".iso", ".img",
    ".jar", ".py", ".rb", ".sh", ".php", ".asp", ".aspx", ".jsp",
}

SUSPICIOUS_PATTERNS: list[tuple[bytes, str]] = [
    (b"powershell", "PowerShell command execution"),
    (b"cmd.exe", "Command prompt invocation"),
    (b"WScript.Shell", "Windows Script Host access"),
    (b"CreateObject", "COM object instantiation"),
    (b"eval(", "Dynamic code evaluation"),
    (b"exec(", "Code execution call"),
    (b"base64_decode", "Base64 decoding (potential obfuscation)"),
    (b"<script", "Embedded script tag"),
    (b"javascript:", "JavaScript URI scheme"),
    (b"AutoOpen", "Auto-execution macro (Office)"),
    (b"Auto_Open", "Auto-execution macro (Office)"),
    (b"Document_Open", "Document open macro trigger"),
    (b"Workbook_Open", "Workbook open macro trigger"),
    (b"Shell(", "Shell execution in macro"),
    (b"/bin/sh", "Unix shell reference"),
    (b"/bin/bash", "Bash shell reference"),
    (b"wget ", "File download command"),
    (b"curl ", "File download command"),
    (b"invoke-webrequest", "PowerShell web request"),
    (b"downloadstring", "Remote code download"),
    (b"fromcharcode", "Character code obfuscation"),
    (b"ActiveXObject", "ActiveX instantiation"),
    (b"HKEY_", "Windows registry access"),
]


def _calculate_entropy(data: bytes) -> float:
    chunk = data[:8192]
    if not chunk:
        return 0.0
    counter = Counter(chunk)
    length = len(chunk)
    return -sum(
        (c / length) * math.log2(c / length) for c in counter.values()
    )


class FileProcessor:
    def __init__(self):
        logger.info("File Processor initialised with vulnerability analysis engine.")

    async def predict(self, file_url: str) -> DetectionResult:
        signals: list[str] = []
        score = 0
        confidence = 0.85
        file_content: bytes | None = None
        filename = ""


        if file_url:
            try:
                parsed = urlparse(file_url)
                if parsed.scheme in ("http", "https"):
                    import httpx

                    async with httpx.AsyncClient(timeout=30) as client:
                        resp = await client.get(file_url)
                        if resp.status_code == 200:
                            file_content = resp.content
                            filename = os.path.basename(parsed.path) or "unknown"
                        else:
                            signals.append(f"Failed to download file (HTTP {resp.status_code})")
                elif os.path.exists(file_url):
                    with open(file_url, "rb") as fh:
                        file_content = fh.read(10 * 1024 * 1024)
                    filename = os.path.basename(file_url)
                else:
                    filename = os.path.basename(file_url)
            except Exception as exc:
                logger.error(f"Error reading file: {exc}")
                filename = os.path.basename(file_url) if file_url else "unknown"


        ext = os.path.splitext(filename)[1].lower() if filename else ""
        if ext in HIGH_RISK_EXTENSIONS:
            signals.append(f"High-risk file extension: {ext}")
            score += 35
        elif ext in MEDIUM_RISK_EXTENSIONS:
            signals.append(f"Medium-risk file extension: {ext}")
            score += 15

        if file_content:
            for magic, file_type in MAGIC_BYTES.items():
                if file_content[: len(magic)] == magic:
                    signals.append(f"File type identified: {file_type}")
                    if magic == b"\x4d\x5a":
                        score += 25
                    elif magic == b"\xd0\xcf\x11\xe0":
                        score += 15
                    break


            if ext in (".pdf", ".doc", ".docx", ".jpg", ".png"):
                if file_content[:2] == b"\x4d\x5a":
                    signals.append(
                        "CRITICAL: File extension spoofing – executable disguised as document"
                    )
                    score += 50

            content_lower = file_content[:102400].lower()
            for pattern, description in SUSPICIOUS_PATTERNS:
                if pattern.lower() in content_lower:
                    signals.append(f"Suspicious pattern: {description}")
                    score += 10


            entropy = _calculate_entropy(file_content)
            if entropy > 7.5:
                signals.append(
                    f"Very high entropy ({entropy:.2f}/8.0) – possible encryption or packing"
                )
                score += 35
            elif entropy > 7.0:
                signals.append(
                    f"High entropy ({entropy:.2f}/8.0) – possible obfuscation or packing"
                )
                score += 25
            elif entropy > 6.5:
                signals.append(
                    f"Elevated entropy ({entropy:.2f}/8.0) – possible obfuscation"
                )
                score += 18

            if len(file_content) < 100 and ext in HIGH_RISK_EXTENSIONS:
                signals.append("Suspiciously small executable file")
                score += 15

            confidence = min(0.95, 0.7 + len(signals) * 0.03)
        else:
            if not signals:
                signals.append("File content unavailable – analysis limited to filename")
            confidence = 0.5

        threat_signals = [
            s for s in signals
            if not s.startswith("File content unavailable")
            and not s.startswith("File type identified")
        ]
        if len(threat_signals) >= 1 and score < 20:
            score = max(score, 20 + len(threat_signals) * 8)
        if len(threat_signals) >= 3 and score < 45:
            score = max(score, 45)
        score = min(score, 100)

        return DetectionResult(
            risk_score=min(score, 100),
            confidence=round(confidence, 3),
            signals=signals,
            modality="file",
        )


file_processor = FileProcessor()
