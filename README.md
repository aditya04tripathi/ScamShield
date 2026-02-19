# ScamShield 🛡️

**ScamShield** is an advanced, multi-modal scam detection platform designed to protect users from phishing, deepfakes, and prompt injections. It leverages state-of-the-art machine learning models and local LLM orchestration to provide real-time risk analysis and remediation.

## Overview

Digital scams are becoming increasingly sophisticated. ScamShield provides a unified interface to analyze potential threats across multiple modalities—Email, URL, Audio, and AI Prompts—offering a comprehensive "Risk Score" and actionable advice.

## Key Features

- **Phishing Detection**: High-accuracy analysis of emails and URLs.
- **Deepfake Audio Analysis**: Spectral analysis to detect AI-generated voices.
- **Prompt Guard**: Protection against prompt injection and jailbreak attempts.
- **Local AI Orchestration**: Real-time explanations via local LLMs (Ollama) to ensure privacy.
- **Unified Scan History**: Integrated dashboard to track and manage scan reports.

## Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, shadcn/ui, Mongodb.
- **Backend**: FastAPI, Python 3.11, Redis.
- **ML/AI**: Hugging Face Transformers, Librosa, Ollama (Qwen 2.5).
- **Deployment**: Docker, Docker Compose.

## Architecture Overview

The system follows a microservices-inspired architecture:

- **Backend**: Orchestrates scan tasks, integrates with ML models, and manages state.
- **Frontend**: Provides a seamless UI and communicates with the backend via REST and Next.js Server Actions.
- **Services**: Dedicated services for different modalities (Audio, Email, etc.).
- **Data Layers**: MongoDB for persistent records and Redis for fast task processing.

## Setup and Installation

### Prerequisites

- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- 8GB+ RAM (Recommended for local model inference)

### Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/aditya04tripathi/ScamShield.git
   cd ScamShield
   ```

2. **Run with Docker Compose**:

   ```bash
   docker compose up --build
   ```

3. **Access the application**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`

## Configuration

Environment variables are managed within `docker-compose.yml` and local `.env` files for each subproject (backend/frontend).

## Usage

- **Analyze an Email**: Paste the email body into the scan dashboard.
- **Check a URL**: Input any suspicious link for real-time safety classification.
- **Audio Scan**: Upload audio clips to detect synthetic voice artifacts.
- **History**: View all past scans and categorized reports in your profile.

## Documentation

- [Software Requirements Specification](./SRS.md)
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

## Limitations and Assumptions

- The system assumes local hardware is capable of running small-scale LLMs (e.g., Qwen 0.5B/1.5B).
- Audio analysis currently focuses on timbre and pitch stability.

## License

This project is licensed under the terms described in [LICENSE](./LICENSE).
