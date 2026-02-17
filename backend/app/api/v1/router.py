from fastapi import APIRouter, status
from app.models.schemas import (
    TextScanRequest,
    UrlScanRequest,
    FileScanRequest,
    AudioScanRequest,
    UnifiedScanRequest,
    ScanResponse,
    DetectionResult,
    ReportIngestRequest,
    BulkReportIngestRequest,
)
from app.services.detection.email_processor import email_processor
from app.services.detection.url_processor import url_processor
from app.services.detection.file_processor import file_processor
from app.services.detection.audio_processor import audio_processor
from app.services.detection.prompt_processor import prompt_processor
from app.services.risk.aggregator import RiskAggregator
from app.services.risk.report_heuristic import report_heuristic
from app.services.scan_orchestrator import scan_orchestrator
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


def _apply_report_heuristic(result: DetectionResult, content: str) -> DetectionResult:
    heuristic = report_heuristic.check(content, result.modality)
    if heuristic.matched:
        boosted_score = min(result.risk_score + heuristic.boost_score, 100)
        combined_signals = result.signals + heuristic.signals
        return DetectionResult(
            risk_score=round(boosted_score, 1),
            confidence=result.confidence,
            signals=combined_signals,
            modality=result.modality,
        )
    return result


_EXAMPLE_SAFE = {
    "risk_score": 8.2,
    "risk_tier": "safe",
    "confidence": 0.965,
    "signals": [],
    "explanation": "The email content appears safe. No significant threat indicators were found.",
    "analyst_summary": "Automated analysis detected the following signals: No specific signals. Confidence: 97%.",
    "recommended_action": "No action required. Content appears safe.",
}

_EXAMPLE_HIGH = {
    "risk_score": 78.4,
    "risk_tier": "high",
    "confidence": 0.912,
    "signals": ["Urgency language detected", "Credential harvesting keywords", "Social engineering patterns"],
    "explanation": "High-risk patterns detected in the email content. Multiple signals indicate likely phishing activity.",
    "analyst_summary": "Automated analysis detected the following signals: Urgency language detected, Credential harvesting keywords, Social engineering patterns. Confidence: 91%.",
    "recommended_action": "Do not interact with this content. Report and block the source.",
}

_EXAMPLE_URL_PHISH = {
    "risk_score": 85.0,
    "risk_tier": "critical",
    "confidence": 0.88,
    "signals": ["IP-based host", "Suspicious keywords in URL: login, verify, update, account", "Excessive URL path depth"],
    "explanation": "Critical threat level detected in the url content. Strong evidence of phishing.",
    "analyst_summary": "Automated analysis detected the following signals: IP-based host, Suspicious keywords in URL. Confidence: 88%.",
    "recommended_action": "Immediately delete and block. Report to your security team.",
}

_EXAMPLE_FILE_SPOOF = {
    "risk_score": 90.0,
    "risk_tier": "critical",
    "confidence": 0.95,
    "signals": ["Extension spoofing: claims pdf but is actually exe"],
    "explanation": "Critical threat level detected. The file uses extension spoofing to disguise its true type.",
    "analyst_summary": "File disguised as .pdf but true extension is .exe. This is a common malware delivery technique.",
    "recommended_action": "Immediately delete and block. Report to your security team.",
}

_EXAMPLE_AUDIO = {
    "risk_score": 62.0,
    "risk_tier": "high",
    "confidence": 0.72,
    "signals": ["Unusually high spectral flatness (synthetic timbre)", "Abnormal pitch stability (F0 std < 20 Hz)"],
    "explanation": "Spectral features suggest this audio may be synthetically generated.",
    "analyst_summary": "MFCC variance and spectral flatness deviate from typical human speech patterns. Confidence: 72%.",
    "recommended_action": "Proceed with caution. Verify authenticity before taking action.",
}

_EXAMPLE_INJECTION = {
    "risk_score": 92.0,
    "risk_tier": "critical",
    "confidence": 0.97,
    "signals": ["INJECTION detected", "Adversarial prompt pattern"],
    "explanation": "Critical threat level detected. The prompt contains injection patterns designed to override system instructions.",
    "analyst_summary": "DeBERTa-v3 classifier detected INJECTION with 97% confidence. Adversarial prompt pattern identified.",
    "recommended_action": "Immediately delete and block. Report to your security team.",
}


@router.post(
    "/scan/email",
    response_model=ScanResponse,
    tags=["Scans"],
    summary="Scan Email Content",
    description=(
        "Analyse raw email body text for phishing indicators.\n\n"
        "**Detection pipeline:**\n"
        "1. DistilBERT classifier (`cybersectony/phishing-email-detection-distilbert_v2.1`) "
        "maps content to *safe / phishing / spam / legitimate*\n"
        "2. Keyword analysis for urgency cues, credential harvesting, and social-engineering patterns\n"
        "3. *(Optional)* Ollama LLM enrichment for natural-language explanation, analyst summary, and recommended action\n\n"
        "Returns a standardised `ScanResponse` with risk score, risk tier, confidence, and signals."
    ),
    operation_id="scanEmail",
    responses={
        200: {
            "description": "Scan completed successfully.",
            "content": {
                "application/json": {
                    "examples": {
                        "safe_email": {"summary": "Legitimate email", "value": _EXAMPLE_SAFE},
                        "phishing_email": {"summary": "Phishing email detected", "value": _EXAMPLE_HIGH},
                    }
                }
            },
        },
        422: {"description": "Validation error — `text` field is missing or empty."},
    },
)
async def scan_email(request: TextScanRequest):
    result = await email_processor.predict(request.text)
    result = _apply_report_heuristic(result, request.text)
    return await scan_orchestrator.enrich_with_llm(result)


@router.post(
    "/scan/url",
    response_model=ScanResponse,
    tags=["Scans"],
    summary="Scan URL",
    description=(
        "Evaluate a URL for phishing and malicious intent.\n\n"
        "**Detection pipeline:**\n"
        "1. BERT classifier (`darshan8950/phishing_url_detection_BERT`) assigns phishing probability\n"
        "2. Heuristic feature engineering: IP-based host, homoglyph characters, suspicious keywords, "
        "protocol analysis, excessive sub-domains, hyphenated domain detection\n"
        "3. Final score = 65 % ML + 35 % heuristic (ML-only or heuristic-only fallback when needed)\n"
        "4. *(Optional)* Ollama LLM enrichment\n\n"
        "Returns a standardised `ScanResponse`."
    ),
    operation_id="scanUrl",
    responses={
        200: {
            "description": "Scan completed successfully.",
            "content": {
                "application/json": {
                    "examples": {
                        "phishing_url": {"summary": "Phishing URL detected", "value": _EXAMPLE_URL_PHISH},
                    }
                }
            },
        },
        422: {"description": "Validation error — `url` field is missing or empty."},
    },
)
async def scan_url(request: UrlScanRequest):
    result = await url_processor.predict(request.url)
    result = _apply_report_heuristic(result, request.url)
    return await scan_orchestrator.enrich_with_llm(result)


@router.post(
    "/scan/file",
    response_model=ScanResponse,
    tags=["Scans"],
    summary="Scan File for Vulnerabilities",
    description=(
        "Analyse a file for malware indicators and vulnerabilities.\n\n"
        "Provide a public URL to the file via `file_url`, **or** the filename / text content "
        "via the `text` fallback field.\n\n"
        "**Detection pipeline:**\n"
        "1. Magic-byte identification (PE, ELF, Mach-O, OLE2, ZIP, PDF)\n"
        "2. Extension-spoofing detection (e.g. `invoice.pdf.exe`)\n"
        "3. 27 suspicious content patterns (shell commands, obfuscated scripts, macro payloads)\n"
        "4. Shannon entropy analysis (flags packed / encrypted payloads)\n"
        "5. Size anomaly detection\n\n"
        "Returns a standardised `ScanResponse`."
    ),
    operation_id="scanFile",
    responses={
        200: {
            "description": "Scan completed successfully.",
            "content": {
                "application/json": {
                    "examples": {
                        "extension_spoofing": {"summary": "Extension spoofing detected", "value": _EXAMPLE_FILE_SPOOF},
                    }
                }
            },
        },
        422: {"description": "Validation error — both `file_url` and `text` are null/empty."},
    },
)
async def scan_file(request: FileScanRequest):
    file_input = request.file_url or request.text or ""
    result = await file_processor.predict(file_input)
    result = _apply_report_heuristic(result, file_input)
    return await scan_orchestrator.enrich_with_llm(result)


@router.post(
    "/scan/audio",
    response_model=ScanResponse,
    tags=["Scans"],
    summary="Detect Audio Deepfakes",
    description=(
        "Analyse an audio file for synthetic speech / deepfake indicators.\n\n"
        "Provide a public URL via `file_url` **or** the filename via the `text` fallback field.\n\n"
        "**Spectral features extracted (via librosa):**\n"
        "- MFCC variance\n"
        "- Spectral centroid stability\n"
        "- Spectral bandwidth consistency\n"
        "- Spectral rolloff\n"
        "- Zero-crossing rate (ZCR) smoothness\n"
        "- Spectral flatness\n"
        "- Pitch tracking via pYIN (F0 mean & std)\n"
        "- Temporal energy uniformity\n\n"
        "Supported formats: `.wav`, `.mp3`, `.ogg`, `.flac`\n\n"
        "Returns a standardised `ScanResponse`."
    ),
    operation_id="scanAudio",
    responses={
        200: {
            "description": "Scan completed successfully.",
            "content": {
                "application/json": {
                    "examples": {
                        "potential_deepfake": {"summary": "Potential deepfake detected", "value": _EXAMPLE_AUDIO},
                    }
                }
            },
        },
        422: {"description": "Validation error — both `file_url` and `text` are null/empty."},
    },
)
async def scan_audio(request: AudioScanRequest):
    audio_input = request.file_url or request.text or ""
    result = await audio_processor.predict(audio_input)
    result = _apply_report_heuristic(result, audio_input)
    return await scan_orchestrator.enrich_with_llm(result)


@router.post(
    "/scan/prompt",
    response_model=ScanResponse,
    tags=["Scans"],
    summary="Scan LLM Prompt",
    description=(
        "Detect prompt injection, jailbreaking, and adversarial LLM attacks.\n\n"
        "**Detection pipeline:**\n"
        "1. DeBERTa-v3 classifier (`protectai/deberta-v3-base-prompt-injection-v2`) "
        "labels input as *SAFE*, *INJECTION*, or *JAILBREAK*\n"
        "2. *(Optional)* Ollama LLM enrichment\n\n"
        "Returns a standardised `ScanResponse`."
    ),
    operation_id="scanPrompt",
    responses={
        200: {
            "description": "Scan completed successfully.",
            "content": {
                "application/json": {
                    "examples": {
                        "injection": {"summary": "Prompt injection detected", "value": _EXAMPLE_INJECTION},
                    }
                }
            },
        },
        422: {"description": "Validation error — `text` field is missing or empty."},
    },
)
async def scan_prompt(request: TextScanRequest):
    result = await prompt_processor.predict(request.text)
    result = _apply_report_heuristic(result, request.text)
    return await scan_orchestrator.enrich_with_llm(result)


@router.post(
    "/scan/unified",
    response_model=ScanResponse,
    tags=["Scans"],
    summary="Unified Multi-Modal Scan",
    description=(
        "Submit multiple inputs at once for a single aggregated risk assessment.\n\n"
        "Provide **any combination** of `email_content`, `url`, `file_url`, `audio_url`, "
        "and `prompt`. Each non-null field is processed by its dedicated detection pipeline "
        "and the results are combined via a weighted risk aggregator.\n\n"
        "Returns a standardised `ScanResponse`."
    ),
    operation_id="unifiedScan",
    responses={
        200: {"description": "Aggregated scan completed successfully."},
        422: {"description": "Validation error."},
    },
)
async def unified_scan(request: UnifiedScanRequest):
    results = {}
    if request.email_content:
        results["email"] = await email_processor.predict(request.email_content)
    if request.url:
        results["url"] = await url_processor.predict(request.url)
    if request.prompt:
        results["prompt"] = await prompt_processor.predict(request.prompt)
    if request.file_url:
        results["file"] = await file_processor.predict(request.file_url)
    if request.audio_url:
        results["audio"] = await audio_processor.predict(request.audio_url)

    aggregated = RiskAggregator.aggregate(results)
    return await scan_orchestrator.enrich_with_llm(aggregated)


@router.get(
    "/health",
    tags=["General"],
    summary="Health Check",
    description="Returns the current health status and API version. Use this to verify the service is running.",
    operation_id="healthCheck",
    responses={
        200: {
            "description": "Service is healthy.",
            "content": {
                "application/json": {
                    "example": {"status": "healthy", "version": "2.0.0"}
                }
            },
        }
    },
)
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}


@router.post(
    "/reports/ingest",
    tags=["Reports"],
    summary="Ingest Scam Report",
    description=(
        "Submit a community scam report to the heuristic engine.\n\n"
        "Reported URLs, contacts, and keywords are indexed and automatically "
        "checked during future scans. Matching content receives a risk score boost."
    ),
    operation_id="ingestReport",
    status_code=status.HTTP_201_CREATED,
)
async def ingest_report(request: ReportIngestRequest):
    added = report_heuristic.ingest_report(
        scam_type=request.scam_type,
        severity=request.severity,
        description=request.description,
        scammer_contact=request.scammer_contact,
        related_url=request.related_url,
        report_id=request.report_id,
    )
    return {"status": "ingested", "indicators_added": added}


@router.post(
    "/reports/ingest/bulk",
    tags=["Reports"],
    summary="Bulk Ingest Scam Reports",
    description="Submit multiple scam reports at once.",
    operation_id="bulkIngestReports",
    status_code=status.HTTP_201_CREATED,
)
async def bulk_ingest_reports(request: BulkReportIngestRequest):
    total_added = 0
    for report in request.reports:
        total_added += report_heuristic.ingest_report(
            scam_type=report.scam_type,
            severity=report.severity,
            description=report.description,
            scammer_contact=report.scammer_contact,
            related_url=report.related_url,
            report_id=report.report_id,
        )
    return {
        "status": "ingested",
        "reports_processed": len(request.reports),
        "indicators_added": total_added,
    }


@router.get(
    "/reports/stats",
    tags=["Reports"],
    summary="Report Heuristic Stats",
    description="Get current statistics of the community report heuristic index.",
    operation_id="reportStats",
)
async def report_stats():
    return report_heuristic.stats()
