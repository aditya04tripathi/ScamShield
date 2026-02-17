# ScamShield Backend

## Overview

The **ScamShield Backend** is a high-performance FastAPI microservice designed for multi-modal scam detection. It leverages local Transformer models, heuristic engines, and external LLM integrations to analyze potentially malicious content.

## Key Features

- **High-Performance API:** FastAPI with Uvicorn for asynchronous request handling.
- **Local Inference:** Runs HuggingFace transformers locally for privacy and speed.
- **Heuristic Engine:** Rule-based fallback and boosting logic for common scam patterns.
- **Audio Analysis:** Spectral feature extraction using Librosa for deepfake detection.
- **Prompt Injection Detection:** Specialized models to detect malicious LLM prompts.

## Tech Stack

- **Framework:** FastAPI 0.109, Pydantic
- **Runtime:** Python 3.13
- **ML Libraries:** PyTorch, Transformers, Scikit-learn
- **Audio Processing:** Librosa, Soundfile, FFmpeg
- **LLM Integration:** LangChain, Ollama

## ML Models Used

| Modality   | Model                                                   | Task                          |
| ---------- | ------------------------------------------------------- | ----------------------------- |
| **Email**  | `cybersectony/phishing-email-detection-distilbert_v2.1` | Phishing Classification       |
| **URL**    | `darshan8950/phishing_url_detection_BERT`               | Malicious URL Detection       |
| **Prompt** | `protectai/deberta-v3-base-prompt-injection-v2`         | Injection/Jailbreak Detection |
| **Audio**  | Custom Spectral Analysis (Librosa)                      | Synthetic Speech Detection    |

## Architecture Overview

This service operates as a stateless microservice, accepting JSON/Form-data requests and returning analysis results.

For detailed backend architectural diagrams, including class structures and flow sequences, please refer to the **[Documentation Folder](../docs)**.

## Setup and Installation

### Prerequisites

- Python 3.11+
- FFmpeg (for audio support)
- ~4GB RAM available for models

### Installation

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Model Setup

You must download the models before searching to avoid runtime timeouts.

```bash
python preload_models.py
```

### Running Locally

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive docs available at `http://localhost:8000/docs`.

## Usage

**Example Request (Email Scan):**

```bash
curl -X POST "http://localhost:8000/scan/email" \
     -H "Content-Type: application/json" \
     -d '{"content": "Urgent: Verify your account now..."}'
```

## Configuration

Environment variables in `.env` (or system env):

```env
DATABASE_URL=sqlite:///./scam_detection.db
OLLAMA_BASE_URL=http://localhost:11434
LLM_MODEL=qwen2.5:0.5b
HF_HOME=./models
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

## Deployment

A `Dockerfile` is provided for containerization.

```bash
docker build -t scamshield-backend .
docker run -p 8000:8000 -v $(pwd)/models:/app/models scamshield-backend
```

_Note: Mounting the `models` volume is recommended to persist downloaded weights._

## Limitations and Assumptions

- **Cold Start:** First request to a model class may take 2-3 seconds for lazy loading (can be mitigated by warm-up scripts).
- **Dependencies:** `librosa` and `soundfile` rely on system-level `libsndfile` and `ffmpeg`.

## Future Improvements

- **GPU Acceleration:** Add CUDA support in Dockerfile.
- **Model Quantization:** Switch to ONNX runtime for faster CPU inference.
