# Software Requirements Specification (SRS) - Backend Agent

## 1. Introduction

### 1.1 Purpose

The Backend Agent serves as the core intelligence layer for ScamShield, responsible for processing scan requests across all modalities, orchestrating ML models, and managing data workflows.

### 1.2 Scope

The backend provides a RESTful API built with FastAPI, manages asynchronous workers for computationally intensive scans, and integrates with local AI backends (Ollama and Hugging Face).

## 2. Overall Description

### 2.1 System Context

The backend acts as a bridge between the Frontend UI and the underlying Machine Learning models. It persists data to MongoDB (indirectly via shared state/frontend) and manages transient task states in Redis.

## 3. Functional Requirements

### 3.1 API Endpoints

1. **Health Check**: Endpoint to verify system and sub-service (Redis, Ollama) status.
2. **Multi-Modal Scans**: Dedicated endpoints for Email, URL, Audio, and Prompt scanning.
3. **LLM Orchestration**: The system shall process model outputs through a local LLM to generate structured JSON responses containing risk summaries and remediation steps.

### 3.2 AI Integration

1. **Hugging Face Inference**: The system shall load and run transformer models for text-based classification locally.
2. **Ollama Integration**: The system shall communicate with a local Ollama instance to provide contextual explanations.
3. **Feature Extraction**: The system shall compute audio features (MFCC, Spectral Centroid) for deepfake detection.

## 4. Non-Functional Requirements

### 4.1 Performance

- **Model Loading**: Models shall be pre-loaded on startup to minimize request latency.
- **Resource Management**: The system shall utilize async IO to handle concurrent requests without blocking.

### 4.2 Error Handling

- The backend shall provide detailed error responses when models fail to load or process.

## 5. System Constraints

- Must run within a Python 3.11 environment.
- Dependencies must be managed via `requirements.txt`.

## 6. External Interface Requirements

- **Redis**: Used for task management and caching.
- **Ollama API**: Used for advanced NLP generation.
