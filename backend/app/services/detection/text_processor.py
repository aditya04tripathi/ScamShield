from app.models.schemas import DetectionResult
from app.services.detection.model_loader import load_cached_text_classifier
import torch
import logging

logger = logging.getLogger(__name__)


class TextProcessor:
    def __init__(self):
        device = 0 if torch.cuda.is_available() else -1
        try:
            logger.info("Loading Text Detection Model (DeBERTa-v3)...")
            self.classifier = load_cached_text_classifier(
                "desklib/ai-text-detector-v1.01",
                device=device,
                top_k=None,
            )
            logger.info("Text Detection Model loaded successfully.")
        except Exception as e:
            logger.error(f"CRITICAL: Failed to load Text Model: {e}")
            raise e

    async def predict(self, content: str) -> DetectionResult:
        truncated_content = content[:512]
        results = self.classifier(truncated_content)[0]

        logger.info(f"Text Model Raw Output: {results}")

        ai_score = 0.0
        confidence = 0.0

        for res in results:
            if res["label"].upper() in ("AI", "FAKE", "GENERATED", "ARTIFICIAL"):
                ai_score = res["score"] * 100
                confidence = res["score"]

        signals: list[str] = []
        if ai_score > 70:
            signals.append("High likelihood of AI generation")

        return DetectionResult(
            risk_score=round(ai_score, 1),
            confidence=round(confidence, 3),
            signals=signals,
            modality="ai_text",
        )


text_processor = TextProcessor()
