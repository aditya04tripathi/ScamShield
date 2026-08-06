from app.models.schemas import DetectionResult
from app.services.detection.model_loader import load_cached_text_classifier
import torch
import logging

logger = logging.getLogger(__name__)


class PromptProcessor:
    def __init__(self):
        device = 0 if torch.cuda.is_available() else -1
        try:
            logger.info("Loading Prompt Injection Model...")
            self.classifier = load_cached_text_classifier(
                "protectai/deberta-v3-base-prompt-injection-v2",
                device=device,
            )
            logger.info("Prompt Injection Model loaded successfully.")
        except Exception as e:
            logger.error(f"CRITICAL: Failed to load Prompt Model: {e}")
            raise e

    async def predict(self, content: str) -> DetectionResult:
        truncated_content = content[:512]
        result = self.classifier(truncated_content)
        logger.info(f"Prompt Model Raw Output: {result}")

        if isinstance(result, list) and result and isinstance(result[0], list):
            result = result[0]

        score = 0.0
        confidence = 0.0
        signals: list[str] = []

        if isinstance(result, list) and result:
            top_result = result[0]
            confidence = top_result["score"]
            label_upper = top_result["label"].upper()

            if label_upper in (
                "INJECTION", "JAILBREAK", "MALICIOUS", "ATTACK",
            ):
                score = top_result["score"] * 100
                signals.append("Prompt injection detected")
            elif label_upper not in ("SAFE", "LEGITIMATE", "BENIGN"):
                if top_result["score"] > 0.6:
                    score = top_result["score"] * 80
                    signals.append(
                        f"Suspicious prompt pattern ({top_result['label']})"
                    )

        return DetectionResult(
            risk_score=round(score, 1),
            confidence=round(confidence, 3),
            signals=signals,
            modality="prompt",
        )


prompt_processor = PromptProcessor()
