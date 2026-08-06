from app.models.schemas import DetectionResult
from app.services.detection.model_loader import load_cached_text_classifier
import torch
import re
import logging
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


class UrlProcessor:
    def __init__(self):
        device = 0 if torch.cuda.is_available() else -1
        try:
            logger.info("Loading URL Phishing Detection Model (BERT)...")
            self.classifier = load_cached_text_classifier(
                "darshan8950/phishing_url_detection_BERT",
                device=device,
            )
            logger.info("URL Phishing Detection Model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load URL Model – falling back to heuristics: {e}")
            self.classifier = None

    async def predict(self, url: str) -> DetectionResult:
        signals: list[str] = []
        heuristic_score = 0

        parsed = urlparse(url)
        hostname = parsed.netloc or ""

        if len(url) > 75:
            signals.append("Excessive URL length")
            heuristic_score += 15
        if "@" in url:
            signals.append("Obfuscated login attempt (@ symbol)")
            heuristic_score += 25
        if parsed.scheme == "http":
            signals.append("Insecure protocol (HTTP)")
            heuristic_score += 20
        if re.search(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", hostname):
            signals.append("IP address used instead of domain name")
            heuristic_score += 30
        if url.count(".") > 4:
            signals.append("Excessive subdomains")
            heuristic_score += 15

        suspicious_kw = re.findall(
            r"(login|verify|update|secure|account|bank|paypal|signin|confirm|password|credential)",
            url.lower(),
        )
        if suspicious_kw:
            unique_kw = sorted(set(suspicious_kw))
            signals.append(f"Suspicious keywords in URL: {', '.join(unique_kw)}")
            heuristic_score += 10 + 5 * len(unique_kw)

        if "-" in hostname:
            signals.append("Hyphenated domain name")
            heuristic_score += 10
        if re.search(r"[^\x00-\x7F]", url):
            signals.append("Non-ASCII / homoglyph characters detected")
            heuristic_score += 25

        path_depth = len([p for p in parsed.path.split("/") if p])
        if path_depth > 4:
            signals.append("Excessive URL path depth")
            heuristic_score += 10

        heuristic_score = min(heuristic_score, 100)

        ml_score = 0.0
        ml_confidence = 0.5

        if self.classifier:
            try:
                result = self.classifier(url[:512])
                logger.info(f"URL Model Raw Output: {result}")

                if result and len(result) > 0:
                    top = result[0]
                    label = str(top["label"]).lower()
                    prob = top["score"]

                    if label in ("phishing", "malicious", "unsafe", "label_1", "1"):
                        ml_score = prob * 100
                        ml_confidence = prob
                        if prob > 0.7:
                            signals.append("ML classifier: phishing URL pattern detected")
                    else:
                        ml_score = (1 - prob) * 100
                        ml_confidence = prob
            except Exception as e:
                logger.error(f"URL ML prediction failed: {e}")
                ml_score = 0
                ml_confidence = 0.5

        if self.classifier:
            weighted = (heuristic_score * 0.35) + (ml_score * 0.65)
            final_score = max(weighted, heuristic_score * 0.85)
            final_score = min(final_score, 100)
            final_confidence = ml_confidence
        else:
            final_score = min(heuristic_score, 100)
            final_confidence = 0.7

        if len(signals) >= 2 and final_score < 25:
            final_score = max(final_score, 25 + len(signals) * 5)
            final_score = min(final_score, 100)

        return DetectionResult(
            risk_score=round(final_score, 1),
            confidence=round(final_confidence, 3),
            signals=signals,
            modality="url",
        )


url_processor = UrlProcessor()
