# Software Requirements Specification (SRS) - ScamShield

## 1. Introduction

ScamShield is a multi-modal fraud detection platform designed to evaluate content across various modalities (Email, URL, File, Audio, Prompt) using machine learning classifiers, heuristic engines, and LLM enrichment.

## 2. System Description

The system consists of a Next.js frontend handling user interaction and data persistence, and a stateless FastAPI backend performing detection and analysis.

## 3. Functional Requirements

### 3.1 Content Analysis

- **Email Scan**: Detect phishing attempts using DistilBERT and heuristic keyword analysis.
- **URL Scan**: Detect malicious URLs using BERT classification and heuristic feature extraction (IP detection, subdomain analysis).
- **File Scan**: Identify threats via magic-byte detection, entropy analysis, and pattern matching.
- **Audio Scan**: Detect deepfake audio using spectral features (MFCC, centroid, bandwidth).
- **Prompt Scan**: Identify LLM jailbreaks and injection attempts using DeBERTa v3.
- **Unified Scan**: Provide a weighted aggregation of risk across multiple modalities.

### 3.2 Reporting & Community

- **Community Reports**: Users can submit and view reports on known scams.
- **Heuristic Index**: The system uses reported data to boost risk scores for match content.

### 3.3 LLM Enrichment

- **Explanation Generation**: Use local LLMs (Ollama/Qwen) to provide human-readable explanations for risk assessments.
- **Fallback Mechanism**: Provide deterministic rule-based explanations if LLM services are unavailable.

## 4. Non-Functional Requirements

### 4.1 Performance

- API response times should be optimized for real-time user feedback.
- Heavy ML models should be preloaded or managed via efficient inference pipelines.

### 4.2 Security

- Secure token handling for authentication.
- Input validation on all scan endpoints and report submissions.

### 4.3 Availability

- Stateless backend to support horizontal scaling.
- Graceful degradation when external services (Hugging Face, Ollama) are unreachable.

## 5. Constraints

- Backend must be written in Python (FastAPI).
- Frontend must be Next.js (App Router).
- LLM component must support local execution via Ollama.

## 6. Interfaces

- **REST API**: FastAPI serves endpoints for scanning and system health.
- **Next.js Server Actions**: Bridge the frontend UI and backend services.

## 7. Dependencies

- **ML Models**: Hugging Face Transformers.
- **Audio Processing**: Librosa, FFmpeg.
- **Database**: MongoDB (via Mongoose).
- **UI**: shadcn/ui, Tailwind CSS.

## 8. Acceptance Criteria

- All five modality scans return a standardized `ScanResponse`.
- Risk scores are accurately calculated and categorized into tiers.
- LLM explanations are relevant to the detected signals.
- System handles missing/invalid inputs gracefully.
