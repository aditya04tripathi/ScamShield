import os

from transformers import (
    AutoConfig,
    AutoModelForSequenceClassification,
    AutoTokenizer,
    pipeline,
)


_UNSET = object()


def _default_cache_dir() -> str:
    return os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "models",
    )


def load_cached_text_classifier(
    model_id: str,
    *,
    device: int,
    top_k: object = _UNSET,
    ignore_mismatched_sizes: bool = True,
):
    cache_dir = os.environ.get("HF_HOME", _default_cache_dir())

    config = AutoConfig.from_pretrained(
        model_id,
        cache_dir=cache_dir,
        local_files_only=True,
        trust_remote_code=True,
    )
    tokenizer = AutoTokenizer.from_pretrained(
        model_id,
        cache_dir=cache_dir,
        local_files_only=True,
        trust_remote_code=True,
    )
    model = AutoModelForSequenceClassification.from_pretrained(
        model_id,
        config=config,
        cache_dir=cache_dir,
        local_files_only=True,
        trust_remote_code=True,
        ignore_mismatched_sizes=ignore_mismatched_sizes,
    )

    kwargs = {"device": device}
    if top_k is not _UNSET:
        kwargs["top_k"] = top_k

    return pipeline(
        "text-classification",
        model=model,
        tokenizer=tokenizer,
        **kwargs,
    )
