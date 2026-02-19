from app.core.config import settings
from typing import Union, List
from pydantic import BaseModel, Field, field_validator
import logging
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

logger = logging.getLogger(__name__)


class FraudExplanation(BaseModel):
    explanation: Union[str, List[str]] = Field(
        description="Non-technical overview of the risk for end users"
    )
    technical_breakdown: Union[str, List[str]] = Field(
        description="Concise expert-level analysis of the detected signals"
    )
    threat_category: str = Field(
        description="Category of threat, e.g. Phishing, Malware, Deepfake"
    )
    remediation_steps: str = Field(
        description="Recommended action the user should take"
    )

    @field_validator("explanation", "technical_breakdown", "remediation_steps", mode="before")
    @classmethod
    def ensure_string(cls, v: Union[str, List[str]]) -> str:
        if isinstance(v, list):
            return "\n".join(v)
        return v


class LLMOrchestrator:
    def __init__(self):
        self._available = False
        try:
            print(
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
                    "You are a senior cybersecurity risk analyst and digital fraud investigator with expertise in "
                    "phishing detection, social engineering analysis, behavioral threat modeling, and consumer "
                    "digital safety education.\n\n"
                    "Your task is to generate a **highly detailed, comprehensive, and educational fraud analysis report** "
                    "explaining a fraud-detection result to a **non-technical, everyday user who has no cybersecurity knowledge**.\n\n"
                    "The explanation must assume the reader does not understand terms like phishing, spoofing, malware, "
                    "impersonation, or social engineering. Everything must be explained clearly using plain language, "
                    "relatable examples, and step-by-step reasoning.\n\n"
                    "---\n\n"
                    "DEFINITION OF RISK SCORE (CRITICAL INTERPRETATION RULE):\n\n"
                    "* 0–15 (Safe / Legitimate)\n"
                    "  No suspicious patterns detected. Communication follows normal, trustworthy standards.\n\n"
                    "* 16–35 (Low Risk)\n"
                    "  Minor anomalies detected. Likely harmless but worth briefly reviewing.\n\n"
                    "* 36–60 (Medium Risk)\n"
                    "  Noticeable suspicious elements detected. Could be a scam or poorly structured legitimate content. Caution required.\n\n"
                    "* 61–80 (High Risk)\n"
                    "  Strong indicators of malicious intent. Classic scam tactics present such as urgency, impersonation, "
                    "emotional manipulation, or suspicious links.\n\n"
                    "* 81–100 (CRITICAL THREAT)\n"
                    "  Extreme danger. Near-certain malicious attack designed to exploit, steal, infect, or manipulate the user.\n\n"
                    "IMPORTANT RULE:\n"
                    "A HIGHER SCORE MEANS MORE DANGEROUS.\n"
                    "A score of 99/100 represents an active, severe threat and must be treated urgently.\n\n"
                    "---\n\n"
                    "REPORT DATA:\n\n"
                    "* Risk Score: {risk_score}/100\n"
                    "* Threat Signals: {signals}\n"
                    "* Modality: {modality}\n\n"
                    "---\n\n"
                    "STRICT OUTPUT REQUIREMENTS:\n\n"
                    "1. Output MUST be valid JSON only.\n"
                    "2. Do NOT include commentary outside the JSON block.\n"
                    "3. Do NOT use markdown formatting inside the JSON values.\n"
                    "4. Do NOT add additional keys beyond those specified.\n"
                    "5. Each section must be extensive and detailed.\n"
                    "6. Write in structured paragraphs, not short fragments.\n"
                    "7. Avoid jargon unless it is immediately explained in simple terms.\n"
                    "8. When technical terms are used, define them clearly.\n"
                    "9. Use real-world analogies to explain complex concepts.\n"
                    "10. Minimum explanation length: Aim for significant depth (800+ words total across all fields).\n"
                    "11. Be precise, educational, and protective in tone.\n"
                    "12. Never minimize risk if the score is high.\n"
                    "13. Never exaggerate if the score is low.\n"
                    "14. If safe, explain why it is safe.\n"
                    "15. If dangerous, clearly state that it is dangerous and why.\n\n"
                    "---\n\n"
                    "SECTION-BY-SECTION INSTRUCTIONS:\n\n"
                    "1. \"explanation\"\n\n"
                    "* Begin by clearly stating the risk level classification based on the score.\n"
                    "* Explicitly explain what that level means for the user.\n"
                    "* Connect each listed threat signal ({signals}) to real-world scam behavior.\n"
                    "* Explain psychological manipulation tactics used, such as false urgency, fear-based pressure, "
                    "authority impersonation, financial temptation, or emotional exploitation.\n"
                    "* Describe what the attacker is likely trying to achieve and explain potential consequences "
                    "(money theft, identity theft, account takeover, etc.) in practical terms.\n"
                    "* Use relatable analogies (e.g., bank impersonation compared to a stranger at your door).\n\n"
                    "2. \"technical_breakdown\"\n\n"
                    "This section should be written at an expert level.\n"
                    "* Analyze each signal in {signals} and explain how they combine to increase risk severity.\n"
                    "* Discuss detection methodologies used (heuristic analysis, pattern recognition, NLP anomaly detection, "
                    "spoof detection, entropy analysis).\n"
                    "* Explain why the combination of signals justifies the final risk score of {risk_score}/100.\n\n"
                    "3. \"threat_category\"\n\n"
                    "* Provide a clear category (e.g., Phishing, Business Email Compromise, Malware Distribution, etc.).\n\n"
                    "4. \"remediation_steps\"\n\n"
                    "Provide prioritized, actionable steps structured as Immediate, Short-term, and Long-term.\n"
                    "* Explain WHY each step matters, not just what to do.\n\n"
                    "---\n\n"
                    "REQUIRED JSON STRUCTURE (STRICT):\n\n"
                    "{{\n"
                    '  "explanation": "Detailed plain-language explanation for a non-technical user...",\n'
                    '  "technical_breakdown": "Expert-level technical analysis...",\n'
                    '  "threat_category": "Specific fraud classification",\n'
                    '  "remediation_steps": "Clear prioritized protective steps..."\n'
                    "}}\n"
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
            print("Generating explanation with LLM...")
            _input = self.prompt.format(
                risk_score=int(risk_score),
                signals=", ".join(signals) if signals else "None",
                modality=modality,
            )
            print("Sending the prompt to LLM", _input)
            output = self.llm.invoke(_input)
            print(f"LLM Raw Output: {output}")

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
