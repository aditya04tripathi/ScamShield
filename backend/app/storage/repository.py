from sqlalchemy.orm import Session
from app.models.domain import ScanRecord, SignalRecord
from app.models.schemas import DetectionResult
import uuid
import json

class ScanRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_scan(self, result: DetectionResult, vector_type: str) -> ScanRecord:
        scan_id = str(uuid.uuid4())
        
        db_scan = ScanRecord(
            id=scan_id,
            vector_type=vector_type,
            global_score=result.risk_score,
            confidence=result.confidence,
            label=result.label,
            engine_metadata=result.engine_metadata
        )
        self.db.add(db_scan)
        
        for sig in result.signals:
            db_signal = SignalRecord(
                scan_id=scan_id,
                signal_key=sig,
                weight=1.0
            )
            self.db.add(db_signal)
            
        self.db.commit()
        self.db.refresh(db_scan)
        return db_scan

    def get_scan(self, scan_id: str):
        return self.db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
