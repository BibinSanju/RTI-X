from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, EmergencyHelpline
from models import HelplineResolveRequest, HelplineResolveResponse, EmergencyHelplineResponse
from typing import List

router = APIRouter(prefix="/api", tags=["Helplines"])

@router.get("/emergency-contacts", response_model=EmergencyHelplineResponse)
def get_emergency_contacts(db: Session = Depends(get_db)):
    # Return the entire JSON document from the DB
    return db.query(EmergencyHelpline).first()

@router.post("/helpline/resolve", response_model=HelplineResolveResponse)
def resolve_helpline(request: HelplineResolveRequest, db: Session = Depends(get_db)):
    # Mock logic
    return HelplineResolveResponse(
        contact_person="Junior Engineer",
        helpline_number="+91-9876543210",
        suggested_deadline_hours=48
    )


