from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Complaint, User
from models import ComplaintCreate, ComplaintUpdateStatus, ComplaintResponse
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

@router.post("/create", response_model=ComplaintResponse)
def create_complaint(request: ComplaintCreate, db: Session = Depends(get_db)):
    # Ensure the user exists, create a dummy one if not
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        user = User(
            id=request.user_id,
            contact_method="EMAIL",
            contact_value=f"test_{request.user_id}@example.com"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    db_complaint = Complaint(
        user_id=request.user_id,
        district=request.district,
        ward_name=request.ward_name,
        department_category=request.department_category,
        rejection_risk_score=request.rejection_risk_score,
        status="PENDING_CALL_CONFIRMATION"
    )
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

@router.post("/update-status/{complaint_id}", response_model=ComplaintResponse)
def update_complaint_status(complaint_id: str, request: ComplaintUpdateStatus, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if complaint:
        complaint.status = request.status
        if request.status == "RTI_FILED":
            complaint.statutory_deadline_date = datetime.now(timezone.utc) + timedelta(days=30)
        db.commit()
        db.refresh(complaint)
    return complaint
