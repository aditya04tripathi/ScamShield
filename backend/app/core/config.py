from pydantic_settings import BaseSettings
from typing import List
import os

if "HF_HOME" not in os.environ:
    os.environ["HF_HOME"] = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "models",
    )

class Settings(BaseSettings):
    PROJECT_NAME: str = "Scam Detection Platform"
    API_V1_STR: str = "/api/v1"
    
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    OLLAMA_BASE_URL: str = "http://localhost:11434"
    LLM_MODEL: str = "granite3.1-moe:3b"
    LLM_CONTEXT_SIZE: int = 4096
    LLM_MAX_TOKENS: int = 512
    LLM_TIMEOUT_SECONDS: float = 90
    
    DATABASE_URL: str = "sqlite:///./scam_detection.db"

    class Config:
        env_file = ".env"

settings = Settings()
