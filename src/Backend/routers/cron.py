# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Complaint
from datetime import datetime, timezone

router = APIRouter(prefix="/api/cron", tags=["CRON Jobs"])

@router.post("/process-deadlines")
def process_deadlines(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    
    # 1. Local SLAs expired -> Require RTI
    expired_local = db.query(Complaint).filter(
        Complaint.local_resolution_deadline < now,
        Complaint.status.in_(["PENDING_RESOLUTION", "PENDING_REPLY_SLA"])
    ).all()
    
    for complaint in expired_local:
        complaint.status = "PENDING_RTI_SUBMISSION"
        # TODO: Queue Notification
        
    # 2. RTI Response SLA expired (30 days) -> Require Appeal
    expired_rti = db.query(Complaint).filter(
        Complaint.statutory_deadline_date < now,
        Complaint.status == "PENDING_RTI_RESPONSE"
    ).all()
    
    for complaint in expired_rti:
        complaint.status = "PENDING_FIRST_APPEAL"
        # TODO: Queue Notification
        
    db.commit()
    return {
        "message": "Processed deadlines successfully.",
        "local_expired_count": len(expired_local),
        "rti_expired_count": len(expired_rti)
    }
