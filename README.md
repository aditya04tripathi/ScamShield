# ScamShield — Multi-Modal Scam Detection Platform

A full-stack scam detection platform that combines **transformer-based ML classifiers**, **heuristic analysis**, **community report intelligence**, and optional **LLM enrichment** to detect fraud across five modalities: email, URL, file, audio, and LLM prompt injection.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│              (React 19 · Bun · MongoDB)                  │
│   ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐   │
│   │  Scan   │  │ History  │  │ Reports  │  │  Admin  │   │
│   │ Pages   │  │ + Detail │  │ Submit   │  │ Review  │   │
│   └────┬────┘  └──────────┘  └────┬─────┘  └─────────┘.  │
│        │                          │                      │
│   Server Actions (scan.actions / report.actions)         │
└────────┼──────────────────────────┼──────────────────────┘
         │  HTTP POST /scan/*       │  POST /reports/ingest
         ▼                          ▼
┌───────────────────────────────────────────────────────────┐
│                   FastAPI Backend                         │
│           (Python 3.13 · Uvicorn · PyTorch)               │
│                                                           │
│   ┌────────────────────────────┐  ┌────────────────────┐  │
│   │    Detection Processors    │  │  Report Heuristic  │  │
│   │  Email · URL · File ·      │  │  (community scam   │  │
│   │  Audio · Prompt            │  │   indicator index) │  │
│   └────────────┬───────────────┘  └────────┬───────────┘  │
│                │   combined signals        │              │
│                ▼                           │              │
│   ┌────────────────────────────────────────┘              │
│   │  Risk Aggregator + Score Boost                        │
│   └────────────┬──────────────────────────────────────────┘
│                ▼                                          │
│   ┌────────────────────────┐                              │
│   │  LLM Enrichment        │                              │
│   │  (Ollama · gemma3:1b)  │                              │ 
│   └────────────────────────┘                              │
└───────────────────────────────────────────────────────────┘
```

## ML Models

| Modality | Model | Task |
|----------|-------|------|
| Email | `cybersectony/phishing-email-detection-distilbert_v2.1` | Phishing / spam classification |
| URL | `darshan8950/phishing_url_detection_BERT` | Phishing URL detection |
| File | Heuristic engine | Magic-byte, entropy, pattern, extension-spoofing |
| Audio | Librosa spectral analysis | Deepfake / synthetic speech detection |
| Prompt | `protectai/deberta-v3-base-prompt-injection-v2` | Prompt injection / jailbreak detection |

## Prerequisites

- **Python** 3.11+ (3.13 recommended)
- **Bun** 1.x (or Node.js 20+)
- **MongoDB** 7+
- **ffmpeg** (for audio processing)
- **Ollama** (optional, for LLM enrichment)
- **Docker & Docker Compose** (optional, for containerised deployment)

---

## Quick Start (Local Development)

### 1. Clone the repository

```bash
git clone <repo-url>
cd scam_detection
```

### 2. Backend setup

<details>
<summary><strong>macOS / Linux</strong></summary>

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Pre-download ML models (first time only, ~6 GB)
python preload_models.py

# Start the API server
uvicorn main:app --host 0.0.0.0 --port 8000
```

</details>

<details>
<summary><strong>Windows</strong></summary>

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Pre-download ML models (first time only, ~2 GB)
python preload_models.py

# Start the API server
uvicorn main:app --host 0.0.0.0 --port 8000
```

</details>

The API is available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 3. Frontend setup

<details>
<summary><strong>macOS / Linux</strong></summary>

```bash
cd frontend
bun install

# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/scam_detection
MICROSERVICE_URL=http://localhost:8000
EOF

bun dev
```

</details>

<details>
<summary><strong>Windows</strong></summary>

```powershell
cd frontend
bun install

# Create .env file
@"
MONGODB_URI=mongodb://localhost:27017/scam_detection
MICROSERVICE_URL=http://localhost:8000
"@ | Out-File -Encoding UTF8 .env

bun dev
```

</details>

The frontend is available at `http://localhost:3000`.

### 4. (Optional) Start Ollama for LLM enrichment

```bash
# Install Ollama (https://ollama.ai)
ollama pull gemma3:1b
ollama serve
```

When Ollama is not running, the backend automatically falls back to rule-based explanations.

---

## Docker Deployment

Run everything with a single command:

```bash
docker compose up --build
```

This starts:
| Service | Port | Description |
|---------|------|-------------|
| `mongo` | 27017 | MongoDB database |
| `backend` | 8000 | FastAPI ML backend |
| `frontend` | 3000 | Next.js application |

> **Note:** HuggingFace models are mounted from `./backend/models`. Run `python backend/preload_models.py` locally first to download them, or they will be downloaded on first container startup.

### Windows-specific Docker notes

- Ensure Docker Desktop is installed and running with WSL 2 backend enabled.
- If using WSL, clone the repo inside WSL for better I/O performance.
- The `host.docker.internal` hostname is used to reach Ollama on the host machine.

---

## Community Report Heuristic

Scam reports submitted by users are automatically forwarded to the backend's **Report Heuristic Engine**. The engine indexes:

- **URLs** associated with reported scams
- **Scammer contacts** (email, phone, handles)
- **Keywords** extracted from report descriptions

During every scan, the engine checks if the input matches any known indicators and applies a **risk score boost** (up to +40 points) with additional signals. This creates a community-driven feedback loop where reported scams make future detection more accurate.

### API Endpoints

- `POST /reports/ingest` — Submit a single report
- `POST /reports/ingest/bulk` — Bulk-submit reports
- `GET /reports/stats` — View heuristic index statistics

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./scam_detection.db` | SQLAlchemy database URL |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `LLM_MODEL` | `gemma3:1b` | Ollama model name |
| `HF_HOME` | `./models` | HuggingFace model cache directory |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://localhost:27017/scam_detection` | MongoDB connection string |
| `MICROSERVICE_URL` | `http://localhost:8000` | Backend API URL |

---

## Project Structure

```
scam_detection/
├── docker-compose.yml
├── README.md
├── backend/                 # FastAPI ML backend
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── preload_models.py
│   └── app/
│       ├── api/v1/          # API routes
│       ├── core/            # Configuration
│       ├── models/          # Pydantic schemas, SQLAlchemy models
│       ├── services/
│       │   ├── detection/   # ML processors (email, url, file, audio, prompt)
│       │   ├── llm/         # Ollama LLM orchestrator
│       │   └── risk/        # Risk aggregator + report heuristic
│       └── storage/         # Database layer
├── frontend/                # Next.js application
│   ├── app/                 # Pages & layouts
│   ├── components/          # UI components
│   ├── lib/
│   │   ├── actions/         # Server actions
│   │   └── db/              # MongoDB models
│   ├── Dockerfile
│   └── package.json
└── instructions.md
```

## License

Apache 2.0
