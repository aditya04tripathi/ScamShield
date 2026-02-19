# ScamShield — Multi-Modal Scam Detection Platform

## Overview

ScamShield is a full-stack scam detection platform that combines **transformer-based ML classifiers**, **heuristic analysis**, **community report intelligence**, and optional **LLM enrichment** to detect fraud across five modalities: email, URL, file, audio, and LLM prompt injection.

It provides a unified dashboard for users to verify suspicious content, view analysis explanations, and contribute to a shared threat intelligence database.

## Key Features

- **Multi-Modal Scanning:** dedicated scanners for Email, URL, File, Audio, and Prompt Injection.
- **AI-Powered Analysis:** Uses local Transformer models (DistilBERT, DeBERTa) and spectral analysis (Librosa).
- **LLM Enrichment:** Integrates with Ollama (Gemma/Llama) to provide human-readable explanations of risk.
- **Community Intelligence:** Indexes user reports to boost detection scores for known scams.
- **Comprehensive History:** Searchable, filterable scan history with detailed risk metrics.

## Tech Stack

- **Frontend:** Next.js 16 (React 19), Tailwind CSS 4, Shadcn/ui
- **Backend:** Python 3.13, FastAPI, PyTorch, Transformers
- **Database:** MongoDB (User/Scan Data), SQLAlchemy (Backend Internal)
- **AI/ML:** HuggingFace Transformers, Scikit-learn, Librosa, Ollama
- **Infrastructure:** Docker, Bun, Railway

## Architecture Overview

The system consists of a **Next.js Frontend** that acts as the user interface and orchestrator, and a **FastAPI Microservice** that handles heavy ML inference and heuristic analysis.

For detailed documentation, including system requirements and design diagrams, see the **[docs](docs)** folder:

- **[SRS.md](docs/SRS.md)**: Product requirements and constraints.
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**: Technical design and system modules.

## Setup and Installation

### Prerequisites

- **Python** 3.11+ (3.13 recommended)
- **Bun** 1.x (or Node.js 20+)
- **MongoDB** 7+
- **ffmpeg** (for audio processing)
- **Ollama** (optional, for LLM enrichment)

### Local Development

1.  **Clone the repository:**

    ```bash
    git clone <repo-url>
    cd scam_detection
    ```

2.  **Backend Setup:**

    ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python preload_models.py  # Download models (~2GB)
    uvicorn main:app --host 0.0.0.0 --port 8000
    ```

3.  **Frontend Setup:**
    ```bash
    cd frontend
    bun install
    cp .env.example .env.local # Configure MONGODB_URI and MICROSERVICE_URL
    bun dev
    ```

## Usage

1.  Access the frontend at `http://localhost:3000`.
2.  Navigate to `/dashboard/scan`.
3.  Select a modality (e.g., Email) and paste suspicious content.
4.  View the Risk Score, Confidence Level, and AI Explanation.

## Configuration

Refer to the specific README files for detailed environment variable configuration:

- [Frontend Configuration](frontend/README.md)
- [Backend Configuration](backend/README.md)

## Deployment

The project includes a `docker-compose.yml` for containerized deployment.

```bash
docker compose up --build
```

This spins up:

- **Frontend** (Port 3000)
- **Backend** (Port 8000)
- **MongoDB** (Port 27017)
- **Ollama** (Port 11434)
- **Redis** (Port 6379)

## Limitations and Assumptions

- **Local Models:** The backend requires ~2-4GB of RAM to load the ML models.
- **Ollama:** LLM enrichment depends on a local Ollama instance running qwen2.5:0.5b. If unavailable, it falls back to rule-based text.
- **Rate Limiting:** Currently handled at the Nginx/Infrastructure level in production, not implemented in the app code.

## Future Improvements

- **Real-time Subscriptions:** Websocket updates for long-running scans.
- **Mobile Application:** React Native companion app.
- **Browser Extension:** Sidebar for instant URL scanning.
