import logging
import re
import threading
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)


@dataclass
class ReportIndicator:
    indicator_type: str
    value: str
    scam_type: str
    severity: str
    reported_at: str
    source_report_id: Optional[str] = None


@dataclass
class HeuristicResult:
    matched: bool = False
    boost_score: float = 0.0
    signals: list[str] = field(default_factory=list)
    matched_indicators: list[dict] = field(default_factory=list)


SEVERITY_BOOST = {
    "system_compromise": 30,
    "monetary_loss": 25,
    "info_loss": 20,
    "attempt": 12,
}

SCAM_TYPE_MODALITY = {
    "phishing": {"email", "url", "prompt"},
    "smishing": {"email", "prompt"},
    "vishing": {"audio"},
    "website": {"url", "file"},
    "social": {"email", "url", "prompt"},
    "other": {"email", "url", "file", "audio", "prompt"},
}


class ReportHeuristicService:

    def __init__(self):
        self._lock = threading.RLock()
        self._urls: dict[str, ReportIndicator] = {}
        self._contacts: dict[str, ReportIndicator] = {}
        self._keywords: list[ReportIndicator] = []
        self._total_reports = 0
        logger.info("ReportHeuristicService initialised (empty index).")

    def ingest_report(
        self,
        scam_type: str,
        severity: str,
        description: str,
        scammer_contact: Optional[str] = None,
        related_url: Optional[str] = None,
        report_id: Optional[str] = None,
        reported_at: Optional[str] = None,
    ) -> int:
        ts = reported_at or datetime.now(timezone.utc).isoformat()
        added = 0

        with self._lock:
            if related_url and related_url.strip():
                norm_url = self._normalise_url(related_url)
                if norm_url not in self._urls:
                    self._urls[norm_url] = ReportIndicator(
                        indicator_type="url",
                        value=norm_url,
                        scam_type=scam_type,
                        severity=severity,
                        reported_at=ts,
                        source_report_id=report_id,
                    )
                    added += 1

            if scammer_contact and scammer_contact.strip():
                norm_contact = scammer_contact.strip().lower()
                if norm_contact not in self._contacts:
                    self._contacts[norm_contact] = ReportIndicator(
                        indicator_type="contact",
                        value=norm_contact,
                        scam_type=scam_type,
                        severity=severity,
                        reported_at=ts,
                        source_report_id=report_id,
                    )
                    added += 1

            keywords = self._extract_keywords(description)
            for kw in keywords:
                if not any(existing.value == kw for existing in self._keywords):
                    self._keywords.append(ReportIndicator(
                        indicator_type="keyword",
                        value=kw,
                        scam_type=scam_type,
                        severity=severity,
                        reported_at=ts,
                        source_report_id=report_id,
                    ))
                    added += 1

            self._total_reports += 1

        logger.info(
            f"Ingested report ({scam_type}/{severity}): "
            f"+{added} indicators, total reports={self._total_reports}"
        )
        return added

    def check(self, content: str, modality: str) -> HeuristicResult:
        result = HeuristicResult()
        content_lower = content.lower().strip()

        if not content_lower:
            return result

        with self._lock:
            norm_input = self._normalise_url(content)
            if norm_input in self._urls:
                ind = self._urls[norm_input]
                if modality in SCAM_TYPE_MODALITY.get(ind.scam_type, set()):
                    boost = SEVERITY_BOOST.get(ind.severity, 10)
                    result.matched = True
                    result.boost_score += boost
                    result.signals.append(
                        f"Community-reported scam URL match (type: {ind.scam_type}, severity: {ind.severity})"
                    )
                    result.matched_indicators.append({"type": "url", "value": ind.value})

            for url_key, ind in self._urls.items():
                if url_key in content_lower and url_key != norm_input:
                    if modality in SCAM_TYPE_MODALITY.get(ind.scam_type, set()):
                        result.matched = True
                        result.boost_score += SEVERITY_BOOST.get(ind.severity, 10) * 0.7
                        result.signals.append(
                            f"Content contains community-reported scam URL: {ind.value}"
                        )
                        result.matched_indicators.append({"type": "url_partial", "value": ind.value})
                        break

            for contact_key, ind in self._contacts.items():
                if contact_key in content_lower:
                    if modality in SCAM_TYPE_MODALITY.get(ind.scam_type, set()):
                        boost = SEVERITY_BOOST.get(ind.severity, 10)
                        result.matched = True
                        result.boost_score += boost
                        result.signals.append(
                            f"Known scammer contact detected: {ind.value} (reported as {ind.scam_type})"
                        )
                        result.matched_indicators.append({"type": "contact", "value": ind.value})
                        break

            keyword_hits = 0
            for ind in self._keywords:
                if keyword_hits >= 3:
                    break
                if ind.value in content_lower:
                    if modality in SCAM_TYPE_MODALITY.get(ind.scam_type, set()):
                        keyword_hits += 1
                        result.matched = True
                        result.boost_score += 5
                        result.signals.append(
                            f"Matches community-reported scam keyword pattern"
                        )

        result.boost_score = min(result.boost_score, 40)
        return result

    def stats(self) -> dict:
        with self._lock:
            return {
                "total_reports_ingested": self._total_reports,
                "indexed_urls": len(self._urls),
                "indexed_contacts": len(self._contacts),
                "indexed_keywords": len(self._keywords),
            }

    @staticmethod
    def _normalise_url(url: str) -> str:
        url = url.strip().lower()
        url = re.sub(r"^https?://", "", url)
        url = re.sub(r"^www\.", "", url)
        url = url.rstrip("/")
        return url

    @staticmethod
    def _extract_keywords(text: str) -> list[str]:
        text = text.lower()
        stop = {
            "the", "a", "an", "is", "was", "were", "be", "been", "being",
            "have", "has", "had", "do", "does", "did", "will", "would",
            "could", "should", "may", "might", "shall", "can", "need",
            "dare", "ought", "used", "to", "of", "in", "for", "on", "with",
            "at", "by", "from", "as", "into", "through", "during", "before",
            "after", "above", "below", "between", "out", "off", "over",
            "under", "again", "further", "then", "once", "here", "there",
            "when", "where", "why", "how", "all", "each", "every", "both",
            "few", "more", "most", "other", "some", "such", "no", "nor",
            "not", "only", "own", "same", "so", "than", "too", "very",
            "just", "because", "but", "and", "or", "if", "while",
            "i", "me", "my", "we", "our", "you", "your", "he", "him",
            "she", "her", "it", "its", "they", "them", "their", "this",
            "that", "these", "those", "am", "are", "got", "get",
        }
        words = re.findall(r"[a-z0-9]+(?:'[a-z]+)?", text)
        meaningful = [w for w in words if w not in stop and len(w) >= 4]

        seen = set()
        result = []
        for w in meaningful:
            if w not in seen:
                seen.add(w)
                result.append(w)
        return result[:10]


report_heuristic = ReportHeuristicService()
