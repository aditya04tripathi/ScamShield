from app.core.config import settings
from pydantic import BaseModel, Field
import logging
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

logger = logging.getLogger(__name__)


class FraudExplanation(BaseModel):
    explanation: str = Field(description="Non-technical overview of the risk for end users")
    technical_breakdown: str = Field(description="Concise expert-level analysis of the detected signals")
    threat_category: str = Field(description="Category of threat, e.g. Phishing, Malware, Deepfake")
    remediation_steps: str = Field(description="Recommended action the user should take")


class LLMOrchestrator:
    def __init__(self):
        self._available = False
        try:
            logger.info(
                f"Initializing Ollama with model: {settings.LLM_MODEL} "
                f"at {settings.OLLAMA_BASE_URL}"
            )
            self.llm = OllamaLLM(
                base_url=settings.OLLAMA_BASE_URL,
                model=settings.LLM_MODEL,
            )
            self.parser = PydanticOutputParser(pydantic_object=FraudExplanation)
            self.prompt = PromptTemplate(
                template=(
                    "You are a professional cybersecurity risk analyst. "
                    "Explain a fraud-detection result to a non-technical user.\n\n"
                    "REPORT DATA:\n"
                    "- Score: {risk_score}/100\n"
                    "- Signals: {signals}\n"
                    "- Modality: {modality}\n\n"
                    "DIRECTIONS:\n"
                    "1. Be concise but informative.\n"
                    "2. ONLY output valid JSON.\n"
                    "3. DO NOT include commentary outside the JSON block.\n\n"
                    "REQUIRED JSON STRUCTURE:\n"
                    '{{\n'
                    '  "explanation": "...",\n'
                    '  "technical_breakdown": "...",\n'
                    '  "threat_category": "...",\n'
                    '  "remediation_steps": "..."\n'
                    '}}\n'
                ),
                input_variables=["risk_score", "signals", "modality"],
            )
            self._available = True
        except Exception as e:
            logger.warning(f"LLM Orchestrator not available (Ollama offline?): {e}")

    async def explain(
        self, risk_score: float, signals: list, modality: str
    ) -> FraudExplanation:
        if not self._available:
            raise RuntimeError("LLM backend is not available")

        try:
            logger.info("Generating explanation with LLM...")
            _input = self.prompt.format(
                risk_score=int(risk_score),
                signals=", ".join(signals) if signals else "None",
                modality=modality,
            )
            output = self.llm.invoke(_input)
            logger.info(f"LLM Raw Output: {output}")

            try:
                return self.parser.parse(output)
            except Exception:
                import json
                import re

                json_match = re.search(r"\{.*\}", output, re.DOTALL)
                if json_match:
                    data = json.loads(json_match.group())
                    return FraudExplanation(**data)
                raise ValueError("No JSON found in LLM output")

        except Exception as e:
            logger.error(f"LLM Generation/Parsing Failed: {e}")
            return FraudExplanation(
                explanation=(
                    "The risk analysis indicates suspicious patterns "
                    "commonly associated with automated fraud attempts."
                ),
                technical_breakdown=f"Aggregated signals: {signals}",
                threat_category="Suspicious Activity",
                remediation_steps=(
                    "Exercise caution. Do not click links or share credentials."
                ),
            )


llm_orchestrator = LLMOrchestrator()
