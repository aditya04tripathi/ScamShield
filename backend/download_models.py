"""Fetch required classifier weights in CI without loading them into RAM."""
import os
from huggingface_hub import snapshot_download

for model_id in (
    "cybersectony/phishing-email-detection-distilbert_v2.1",
    "protectai/deberta-v3-base-prompt-injection-v2",
    "darshan8950/phishing_url_detection_BERT",
):
    snapshot_download(
        repo_id=model_id,
        cache_dir=os.environ["HF_HOME"],
        allow_patterns=["*.json", "*.txt", "*.model", "*.safetensors", "pytorch_model.bin", "*.py"],
    )
