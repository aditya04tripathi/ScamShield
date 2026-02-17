import logging
from app.models.schemas import (
    DetectionResult,
    ScanResponse,
    score_to_risk_tier,
    build_scan_response,
)
from app.services.llm.orchestrator import llm_orchestrator

logger = logging.getLogger(__name__)

class ScanOrchestrator:
    @staticmethod
    async def enrich_with_llm(result: DetectionResult) -> ScanResponse:
        try:
            enrichment = await llm_orchestrator.explain(
                risk_score=result.risk_score,
                signals=result.signals,
                modality=result.modality,
            )
            return build_scan_response(
                result=result,
                explanation=enrichment.explanation,
                analyst_summary=enrichment.technical_breakdown,
                recommended_action=enrichment.remediation_steps,
            )
        except Exception as e:
            logger.warning(f"LLM enrichment failed, using rule-based fallback: {e}")
            return build_scan_response(
                result=result,
                explanation=ScanOrchestrator._fallback_explanation(result),
                analyst_summary=ScanOrchestrator._fallback_summary(result),
                recommended_action=ScanOrchestrator._fallback_action(result),
            )

    @staticmethod
    def _fallback_explanation(r: DetectionResult) -> str:
        tier = score_to_risk_tier(r.risk_score)
        messages = {
            "safe": f"The {r.modality} content appears safe. No significant threat indicators were found.",
            "low": f"Minor suspicious patterns were detected in the {r.modality} content, but overall risk is low.",
            "medium": f"Moderate risk indicators found in the {r.modality} content. Some signals suggest potential malicious intent.",
            "high": f"High-risk patterns detected in the {r.modality} content. Multiple signals indicate likely malicious activity.",
            "critical": f"Critical threat level detected in the {r.modality} content. Strong evidence of malicious intent or fraud.",
        }
        return messages.get(tier, "Analysis complete.")

    @staticmethod
    def _fallback_summary(r: DetectionResult) -> str:
        signals_str = ", ".join(r.signals) if r.signals else "No specific signals"
        return f"Automated analysis detected the following signals: {signals_str}. Confidence: {r.confidence:.0%}."

    @staticmethod
    def _fallback_action(r: DetectionResult) -> str:
        tier = score_to_risk_tier(r.risk_score)
        actions = {
            "safe": "No action required. Content appears safe.",
            "low": "Exercise normal caution. Verify the source if unsure.",
            "medium": "Proceed with caution. Verify authenticity before taking action.",
            "high": "Do not interact with this content. Report and block the source.",
            "critical": "Immediately delete and block. Report to your security team.",
        }
        return actions.get(tier, "Exercise caution.")

scan_orchestrator = ScanOrchestrator()
