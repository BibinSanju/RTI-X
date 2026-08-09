from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Complaint, User
from models import ComplaintCreate, ComplaintUpdateStatus, ComplaintResponse, CallStatusRequest, ResolutionStatusRequest, RTIStatusRequest
from datetime import datetime, timedelta, timezone
from utils.llm import generate_local_resolution_deadline
from fastapi import HTTPException

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
        problem_description=request.problem_description,
        rejection_risk_score=request.rejection_risk_score,
        status="PENDING_CALL_CONFIRMATION"
    )
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

@router.post("/{complaint_id}/call-status", response_model=ComplaintResponse)
def update_call_status(complaint_id: str, request: CallStatusRequest, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    if request.answered:
        complaint.status = "PENDING_RESOLUTION"
        complaint.local_resolution_deadline = generate_local_resolution_deadline(complaint.problem_description or "")
    else:
        complaint.status = "PENDING_REPLY_SLA"
        complaint.local_resolution_deadline = datetime.now(timezone.utc) + timedelta(hours=48)
        
    db.commit()
    db.refresh(complaint)
    return complaint

@router.post("/{complaint_id}/resolution-status", response_model=ComplaintResponse)
def update_resolution_status(complaint_id: str, request: ResolutionStatusRequest, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    if request.cleared:
        complaint.status = "RESOLVED"
    else:
        if complaint.status == "PENDING_REPLY_SLA" and request.replied:
            complaint.status = "PENDING_RESOLUTION"
            complaint.local_resolution_deadline = generate_local_resolution_deadline(complaint.problem_description or "")
        else:
            # Not cleared and deadline is up, or didn't reply after SLA
            complaint.status = "PENDING_RTI_SUBMISSION"
            
    db.commit()
    db.refresh(complaint)
    return complaint

@router.post("/{complaint_id}/rti-status", response_model=ComplaintResponse)
def update_rti_status(complaint_id: str, request: RTIStatusRequest, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    if request.submitted:
        complaint.status = "PENDING_RTI_RESPONSE"
        complaint.statutory_deadline_date = datetime.now(timezone.utc) + timedelta(days=30)
        
    db.commit()
    db.refresh(complaint)
    return complaint
