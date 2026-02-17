from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class TextScanRequest(BaseModel):

    text: str = Field(
        ...,
        min_length=1,
        description="The raw text content to analyse (email body, LLM prompt, etc.).",
        json_schema_extra={"examples": ["URGENT: Your account has been compromised! Click here to verify your credentials."]},
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"text": "Hi team, the project meeting has been moved to 3 pm tomorrow."},
                {"text": "URGENT: Verify your account immediately or it will be suspended. Send password to confirm."},
            ]
        }
    }


class UrlScanRequest(BaseModel):

    url: str = Field(
        ...,
        min_length=1,
        description="The full URL to evaluate (including protocol).",
        json_schema_extra={"examples": ["https://www.google.com"]},
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"url": "https://www.google.com"},
                {"url": "http://192.168.1.1/login-verify/update-account.php?id=12345"},
            ]
        }
    }


class FileScanRequest(BaseModel):

    file_url: Optional[str] = Field(
        None,
        description="Public URL or local path to the file to scan.",
        json_schema_extra={"examples": ["https://example.com/uploads/report.pdf"]},
    )
    text: Optional[str] = Field(
        None,
        description="Fallback: bare filename or inline text content when no URL is available.",
        json_schema_extra={"examples": ["invoice.pdf.exe"]},
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"file_url": "https://example.com/uploads/report.pdf"},
                {"text": "invoice.pdf.exe"},
            ]
        }
    }


class AudioScanRequest(BaseModel):

    file_url: Optional[str] = Field(
        None,
        description="Public URL or local path to the audio file (.wav, .mp3, .ogg, .flac).",
        json_schema_extra={"examples": ["https://example.com/audio/sample.wav"]},
    )
    text: Optional[str] = Field(
        None,
        description="Fallback: bare filename when no URL is available.",
        json_schema_extra={"examples": ["recording.wav"]},
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"file_url": "https://example.com/audio/sample.wav"},
                {"text": "recording.wav"},
            ]
        }
    }


class UnifiedScanRequest(BaseModel):

    email_content: Optional[str] = Field(None, description="Raw email body text.")
    url: Optional[str] = Field(None, description="URL to evaluate.")
    file_url: Optional[str] = Field(None, description="URL or path to a file.")
    audio_url: Optional[str] = Field(None, description="URL or path to an audio file.")
    prompt: Optional[str] = Field(None, description="LLM prompt to check for injection.")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "email_content": "Click here to claim your prize!",
                    "url": "http://free-prize.xyz/claim",
                    "file_url": None,
                    "audio_url": None,
                    "prompt": None,
                }
            ]
        }
    }


class ScanResponse(BaseModel):

    risk_score: float = Field(
        ...,
        ge=0,
        le=100,
        description="Numeric risk score between 0 (no risk) and 100 (maximum risk).",
        json_schema_extra={"examples": [72.5]},
    )
    risk_tier: Literal["safe", "low", "medium", "high", "critical"] = Field(
        ...,
        description=(
            "Categorical risk tier derived from the score: "
            "0-15 → safe, 16-35 → low, 36-60 → medium, 61-80 → high, 81-100 → critical."
        ),
        json_schema_extra={"examples": ["high"]},
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Model confidence in its prediction (0.0 – 1.0).",
        json_schema_extra={"examples": [0.934]},
    )
    signals: List[str] = Field(
        default_factory=list,
        description="List of threat indicators identified during analysis.",
        json_schema_extra={"examples": [["Urgency language detected", "Credential harvesting keywords"]]},
    )
    explanation: str = Field(
        "",
        description="Human-readable explanation of the risk assessment.",
        json_schema_extra={"examples": ["High-risk patterns detected in the email content. Multiple signals indicate likely phishing activity."]},
    )
    analyst_summary: str = Field(
        "",
        description="Technical summary suitable for a security analyst.",
        json_schema_extra={"examples": ["Automated analysis detected the following signals: Urgency language detected, Credential harvesting keywords. Confidence: 93%."]},
    )
    recommended_action: str = Field(
        "",
        description="Actionable recommendation for the end user.",
        json_schema_extra={"examples": ["Do not interact with this content. Report and block the source."]},
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "risk_score": 72.5,
                    "risk_tier": "high",
                    "confidence": 0.934,
                    "signals": ["Urgency language detected", "Credential harvesting keywords"],
                    "explanation": "High-risk patterns detected in the email content. Multiple signals indicate likely phishing activity.",
                    "analyst_summary": "Automated analysis detected the following signals: Urgency language detected, Credential harvesting keywords. Confidence: 93%.",
                    "recommended_action": "Do not interact with this content. Report and block the source.",
                }
            ]
        }
    }


class DetectionResult(BaseModel):

    risk_score: float = Field(..., ge=0, le=100, description="Raw risk score (0-100).")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model confidence (0-1).")
    signals: List[str] = Field(default_factory=list, description="Threat signals detected.")
    modality: str = Field("unknown", description="Source modality (email, url, file, audio, prompt).")


def score_to_risk_tier(score: float) -> str:
    if score <= 15:
        return "safe"
    elif score <= 35:
        return "low"
    elif score <= 60:
        return "medium"
    elif score <= 80:
        return "high"
    return "critical"


def build_scan_response(
    result: DetectionResult,
    explanation: str = "",
    analyst_summary: str = "",
    recommended_action: str = "",
) -> ScanResponse:
    return ScanResponse(
        risk_score=round(result.risk_score, 1),
        risk_tier=score_to_risk_tier(result.risk_score),
        confidence=round(result.confidence, 3),
        signals=result.signals,
        explanation=explanation,
        analyst_summary=analyst_summary,
        recommended_action=recommended_action,
    )

class ReportIngestRequest(BaseModel):
    scam_type: str = Field(..., description="Type: phishing, smishing, vishing, website, social, other")
    severity: str = Field(..., description="Severity: attempt, info_loss, monetary_loss, system_compromise")
    description: str = Field(..., min_length=1, description="Description of the scam")
    scammer_contact: Optional[str] = Field(None, description="Scammer email, phone, or handle")
    related_url: Optional[str] = Field(None, description="URL associated with the scam")
    report_id: Optional[str] = Field(None, description="Original report ID from the frontend")


class BulkReportIngestRequest(BaseModel):
    reports: List[ReportIngestRequest]
