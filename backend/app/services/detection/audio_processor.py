from app.models.schemas import DetectionResult
import logging
import os
import subprocess
import tempfile
from urllib.parse import urlparse

import numpy as np

logger = logging.getLogger(__name__)

_SOUNDFILE_NATIVE = {".wav", ".flac", ".ogg", ".aiff", ".aif"}


class AudioProcessor:
    def __init__(self):
        try:
            import librosa

            self._librosa = librosa
            logger.info(
                "Audio Processor initialised with librosa spectral-analysis engine."
            )
        except ImportError:
            self._librosa = None
            logger.warning(
                "librosa not available – audio analysis will use fallback mode."
            )

    async def predict(self, file_url: str) -> DetectionResult:
        signals: list[str] = []
        score = 0
        confidence = 0.75
        audio_data: np.ndarray | None = None
        sr: int | None = None

        if file_url and self._librosa:
            audio_data, sr = await self._load_audio(file_url, signals)

        if audio_data is not None and sr is not None:
            try:
                result = self._analyze_spectral_features(audio_data, sr)
                signals = result["signals"]
                score = result["score"]
                confidence = result["confidence"]
            except Exception as exc:
                logger.error(f"Spectral analysis failed: {exc}")
                signals.append("Audio analysis encountered an error")
                score = 50
                confidence = 0.3
        else:
            filename = os.path.basename(file_url) if file_url else ""
            ext = os.path.splitext(filename)[1].lower()
            if ext not in (
                ".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac", ".wma",
            ):
                signals.append(f"Unusual audio format: {ext or 'unknown'}")
                score += 15
            signals.append(
                "Full spectral analysis unavailable – file not accessible"
            )
            confidence = 0.4

        return DetectionResult(
            risk_score=min(score, 100),
            confidence=round(confidence, 3),
            signals=signals,
            modality="audio",
        )

    async def _load_audio(self, file_url: str, signals: list[str]):
        librosa = self._librosa
        audio_path: str | None = None
        wav_path: str | None = None
        is_temp = False
        parsed = urlparse(file_url)

        try:
            if parsed.scheme in ("http", "https"):
                import httpx

                async with httpx.AsyncClient(timeout=60) as client:
                    resp = await client.get(file_url)
                    if resp.status_code == 200:
                        suffix = os.path.splitext(parsed.path)[1] or ".wav"
                        tmp = tempfile.NamedTemporaryFile(
                            suffix=suffix, delete=False
                        )
                        tmp.write(resp.content)
                        tmp.close()
                        audio_path = tmp.name
                        is_temp = True
            elif os.path.exists(file_url):
                audio_path = file_url

            if audio_path:
                ext = os.path.splitext(audio_path)[1].lower()
                wav_path: str | None = None
                if ext not in _SOUNDFILE_NATIVE:
                    wav_path = audio_path + ".wav"
                    try:
                        subprocess.run(
                            [
                                "ffmpeg", "-y", "-i", audio_path,
                                "-ar", "22050", "-ac", "1",
                                "-sample_fmt", "s16",
                                wav_path,
                            ],
                            capture_output=True,
                            timeout=30,
                            check=True,
                        )
                        audio_path = wav_path
                    except (subprocess.CalledProcessError, FileNotFoundError) as e:
                        logger.warning(f"ffmpeg conversion failed, loading directly: {e}")
                        wav_path = None

                audio_data, sr = librosa.load(audio_path, sr=22050, duration=30)
                return audio_data, sr
        except Exception as exc:
            logger.error(f"Failed to load audio: {exc}")
        finally:
            if is_temp and audio_path and os.path.exists(audio_path):
                os.unlink(audio_path)
            if wav_path and os.path.exists(wav_path):
                os.unlink(wav_path)

        return None, None

    def _analyze_spectral_features(
        self, audio_data: np.ndarray, sr: int
    ) -> dict:
        librosa = self._librosa
        signals: list[str] = []
        score = 0

        mfccs = librosa.feature.mfcc(y=audio_data, sr=sr, n_mfcc=13)
        mfcc_mean_var = float(np.mean(np.var(mfccs, axis=1)))
        if mfcc_mean_var < 50:
            signals.append("Unnaturally uniform MFCC patterns detected")
            score += 25
        elif mfcc_mean_var < 100:
            signals.append("Low MFCC variance – possible synthetic origin")
            score += 15

        centroid = librosa.feature.spectral_centroid(y=audio_data, sr=sr)[0]
        centroid_std = float(np.std(centroid))
        if centroid_std < 200:
            signals.append(
                "Spectral centroid unusually stable – synthetic signature"
            )
            score += 20
        elif centroid_std < 400:
            signals.append("Low spectral centroid variation")
            score += 10

        bandwidth = librosa.feature.spectral_bandwidth(y=audio_data, sr=sr)[0]
        if float(np.std(bandwidth)) < 150:
            signals.append(
                "Spectral bandwidth too consistent for natural speech"
            )
            score += 15

        rolloff = librosa.feature.spectral_rolloff(y=audio_data, sr=sr)[0]
        if float(np.mean(rolloff)) < sr * 0.3:
            signals.append("Low spectral rolloff – truncated frequency range")
            score += 15

        zcr = librosa.feature.zero_crossing_rate(audio_data)[0]
        if float(np.std(zcr)) < 0.01:
            signals.append("Unnaturally smooth zero-crossing rate")
            score += 15

        flatness = librosa.feature.spectral_flatness(y=audio_data)[0]
        flatness_mean = float(np.mean(flatness))
        if flatness_mean > 0.5:
            signals.append("High spectral flatness – possible noise artefact")
            score += 10
        elif flatness_mean < 0.01:
            signals.append(
                "Extremely low spectral flatness – unnaturally tonal"
            )
            score += 10

        try:
            f0, _voiced_flag, _voiced_probs = librosa.pyin(
                audio_data,
                fmin=librosa.note_to_hz("C2"),
                fmax=librosa.note_to_hz("C7"),
                sr=sr,
            )
            valid_f0 = f0[~np.isnan(f0)]
            if len(valid_f0) > 0:
                f0_std = float(np.std(valid_f0))
                if f0_std < 10:
                    signals.append(
                        "Pitch variance unusually low – robotic quality"
                    )
                    score += 20
                elif f0_std < 20:
                    signals.append("Limited pitch variation detected")
                    score += 10
        except Exception:
            pass

        n_segments = min(10, len(audio_data) // (sr // 2))
        if n_segments >= 3:
            seg_len = len(audio_data) // n_segments
            energies = [
                float(np.mean(audio_data[i * seg_len : (i + 1) * seg_len] ** 2))
                for i in range(n_segments)
            ]
            if float(np.std(energies)) < 1e-6:
                signals.append(
                    "Suspiciously uniform audio energy distribution"
                )
                score += 15

        confidence = min(0.95, 0.6 + len(signals) * 0.04)

        if not signals:
            signals.append("No synthetic audio markers detected")

        return {
            "signals": signals,
            "score": min(score, 100),
            "confidence": round(confidence, 3),
        }


audio_processor = AudioProcessor()
