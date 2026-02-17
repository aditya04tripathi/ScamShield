from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from app.storage.db import Base
import datetime


class ScanRecord(Base):
    __tablename__ = "scans"

    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    vector_type = Column(String)
    global_score = Column(Float)
    risk_tier = Column(String)
    confidence = Column(Float)
    explanation = Column(String, nullable=True)
    analyst_summary = Column(String, nullable=True)
    recommended_action = Column(String, nullable=True)
    engine_metadata = Column(JSON, nullable=True)


class SignalRecord(Base):
    __tablename__ = "signals"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(String, index=True)
    signal_key = Column(String)
    weight = Column(Float, default=1.0)
