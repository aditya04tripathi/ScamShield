# syntax=docker/dockerfile:1
FROM python:3.11-slim-bookworm AS builder
WORKDIR /app
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH" HF_HOME=/app/models
COPY backend/requirements.txt ./
# CPU wheels avoid pulling NVIDIA libraries onto a CPU server.
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt 'transformers<5' sentencepiece protobuf
COPY backend/ ./
RUN python download_models.py

FROM python:3.11-slim-bookworm AS runner
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg libsndfile1 && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --gid 1001 app && useradd --uid 1001 --gid app app && \
    mkdir -p /app/data && chown app:app /app/data
WORKDIR /app
ENV PATH="/opt/venv/bin:$PATH" HF_HOME=/app/models PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 HF_HUB_OFFLINE=1 DATABASE_URL=sqlite:////app/data/scam_detection.db
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder --chown=app:app /app /app
USER app
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
