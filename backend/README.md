# ScamShield Backend 🐍

The core API and intelligence orchestration layer for ScamShield, powered by FastAPI.

## Overview

This service handles all machine learning inference and logic for detected scams. It coordinates between specialized transformer models, spectral analysis tools, and local LLMs to provide a unified risk assessment.

## Key Features

- **FastAPI Core**: Highly performant asynchronous API.
- **Model Orchestration**: Manages weights and inference for multiple modalities.
- **Local LLM Integration**: Uses LangChain and Ollama for intelligent report generation.
- **Spectral Audio Engine**: Advanced feature extraction for deepfake detection.
- **Task Management**: Integration with Redis for handling intensive scans.

## Tech Stack

- **FastAPI**
- **LangChain**
- **Ollama** (Local Inference)
- **Hugging Face Transformers**
- **Librosa** (Audio Processing)
- **Redis**

## Setup and Installation

### Prerequisites

- Python 3.11+
- FFmpeg (for audio processing)

### Local Development

1. **Navigate to the backend directory**:

   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:

   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Run the preloader (Optional)**:
   Pre-load models from Hugging Face to avoid latency on first run.

   ```bash
   python preload_models.py
   ```

5. **Start the server**:
   ```bash
   uvicorn main:app --reload
   ```

## Configuration

Configuration is managed in `app/core/config.py`. Key environment variables include:

- `OLLAMA_BASE_URL`: URL for the local Ollama instance.
- `REDIS_URL`: Connection string for Redis.
- `LLM_MODEL`: The LLM model name (e.g., `qwen2.5:0.5b`).

## Documentation

- [Backend SRS](./SRS.md)
- [Project-level SRS](../SRS.md)

## License

Licensed under the [MIT License](../LICENSE).
