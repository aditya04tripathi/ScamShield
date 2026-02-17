from app.models.schemas import DetectionResult
from transformers import pipeline
import torch
import logging

logger = logging.getLogger(__name__)


class EmailProcessor:
    def __init__(self):
        device = 0 if torch.cuda.is_available() else -1
        try:
            logger.info("Loading Email Detection Model (DistilBERT)...")
            self.classifier = pipeline(
                "text-classification",
                model="cybersectony/phishing-email-detection-distilbert_v2.1",
                device=device,
                top_k=None,
            )
            logger.info("Email Detection Model loaded successfully.")
        except Exception as e:
            logger.error(f"CRITICAL: Failed to load Email Model: {e}")
            raise e

    async def predict(self, content: str) -> DetectionResult:
        truncated_content = content[:512]
        results = self.classifier(truncated_content)[0]

        logger.info(f"Email Model Raw Output: {results}")

        label_map = {
            "LABEL_1": "phishing",
            "LABEL_2": "spam",
            "LABEL_0": "safe",
            "LABEL_3": "safe",
        }

        phishing_score = 0.0
        confidence = 0.0

        for res in results:
            label_upper = res["label"].upper()
            mapped_type = label_map.get(label_upper, res["label"].lower())

            if mapped_type in ["phishing", "spam", "fraud"]:
                weight = 1.0 if mapped_type == "phishing" else 0.5
                current_score = res["score"] * 100 * weight
                if current_score > phishing_score:
                    phishing_score = current_score
                    confidence = res["score"]

        signals = []
        if phishing_score > 50:
            signals.append("High probability of phishing intent")
        if "urgent" in content.lower():
            signals.append("Urgency indicators detected")
        if "password" in content.lower() or "credential" in content.lower():
            signals.append("Credential harvesting language detected")
        if "click here" in content.lower() or "verify your" in content.lower():
            signals.append("Social engineering call-to-action detected")

        return DetectionResult(
            risk_score=round(phishing_score, 1),
            confidence=round(confidence, 3),
            signals=signals,
            modality="email",
        )


email_processor = EmailProcessor()
