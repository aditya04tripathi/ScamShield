from typing import Dict
from app.models.schemas import DetectionResult


class RiskAggregator:
    WEIGHTS = {
        "email": 0.25,
        "url": 0.20,
        "file": 0.20,
        "audio": 0.15,
        "prompt": 0.10,
        "ai_text": 0.10,
    }

    @staticmethod
    def aggregate(results: Dict[str, DetectionResult]) -> DetectionResult:
        total_score = 0.0
        total_weight = 0.0
        all_signals: list[str] = []
        min_confidence = 1.0

        for modality, result in results.items():
            if result:
                weight = RiskAggregator.WEIGHTS.get(modality, 0.15)
                total_score += result.risk_score * weight
                total_weight += weight
                all_signals.extend(result.signals)
                min_confidence = min(min_confidence, result.confidence)

        final_score = round(total_score / total_weight, 2) if total_weight > 0 else 0.0

        return DetectionResult(
            risk_score=final_score,
            confidence=min_confidence,
            signals=all_signals,
            modality="unified",
        )
