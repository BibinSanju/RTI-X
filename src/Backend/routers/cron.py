from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Complaint
from datetime import datetime, timezone

router = APIRouter(prefix="/api/cron", tags=["CRON Jobs"])

@router.post("/process-deadlines")
def process_deadlines(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    
    expired_local = db.query(Complaint).filter(
        Complaint.local_resolution_deadline < now,
        Complaint.status == "HELD_AT_HELPLINE"
    ).all()
    
    for complaint in expired_local:
        complaint.status = "LOCAL_DEADLINE_EXPIRED"
        
    db.commit()
    return {"message": f"Processed {len(expired_local)} expired local deadlines."}
