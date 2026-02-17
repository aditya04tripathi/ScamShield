import logging
import os

from transformers import (
    pipeline,
    AutoConfig,
    AutoTokenizer,
    AutoModelForSequenceClassification
)

CACHE_DIR = os.environ.get("HF_HOME", os.path.join(os.path.dirname(os.path.abspath(__file__)), "models"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

MODELS_TO_DOWNLOAD = [
    {
        "task": "text-classification",
        "model": "cybersectony/phishing-email-detection-distilbert_v2.1",
        "name": "Email Phishing Model",
    },
    {
        "task": "text-classification",
        "model": "desklib/ai-text-detector-v1.01",
        "name": "AI Text Detection Model",
    },
    {
        "task": "text-classification",
        "model": "protectai/deberta-v3-base-prompt-injection-v2",
        "name": "Prompt Injection Model",
    },
    {
        "task": "text-classification",
        "model": "darshan8950/phishing_url_detection_BERT",
        "name": "URL Phishing Detection Model (BERT)",
    },
]


def load_model_safely(model_id: str, task: str):

    logger.info(f"→ Loading config for {model_id}")

    config = AutoConfig.from_pretrained(
        model_id,
        cache_dir=CACHE_DIR,
        trust_remote_code=True
    )

    tokenizer = AutoTokenizer.from_pretrained(
        model_id,
        cache_dir=CACHE_DIR,
        trust_remote_code=True
    )

    model = AutoModelForSequenceClassification.from_pretrained(
        model_id,
        config=config,
        cache_dir=CACHE_DIR,
        trust_remote_code=True,
        ignore_mismatched_sizes=True 
    )

    return pipeline(
        task,
        model=model,
        tokenizer=tokenizer,
        cache_dir=CACHE_DIR
    )


def preload_models():
    logger.info(f"Starting model preload → Cache: {CACHE_DIR}")
    os.makedirs(CACHE_DIR, exist_ok=True)

    for item in MODELS_TO_DOWNLOAD:
        try:
            logger.info(f"Downloading {item['name']} ({item['model']})")

            _ = load_model_safely(
                model_id=item["model"],
                task=item["task"]
            )

            logger.info(f"✅ Successfully downloaded {item['name']}")

        except Exception as e:
            logger.error(f"❌ Failed → {item['name']}: {e}")
            raise

    logger.info("🎉 All models successfully preloaded!")


if __name__ == "__main__":
    preload_models()