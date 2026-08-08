from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, EmergencyHelpline
from models import HelplineResolveRequest, HelplineResolveResponse, EmergencyHelplineResponse
from typing import List

router = APIRouter(prefix="/api", tags=["Helplines"])

@router.get("/emergency-contacts", response_model=List[EmergencyHelplineResponse])
def get_emergency_contacts(category: str, zone: str = None, db: Session = Depends(get_db)):
    query = db.query(EmergencyHelpline).filter(EmergencyHelpline.department_category == category)
    if zone:
        query = query.filter(EmergencyHelpline.zone_or_ward == zone)
    
    # Return matched emergency contacts from DB
    return query.all()

@router.post("/helpline/resolve", response_model=HelplineResolveResponse)
def resolve_helpline(request: HelplineResolveRequest, db: Session = Depends(get_db)):
    # Mock logic
    return HelplineResolveResponse(
        contact_person="Junior Engineer",
        helpline_number="+91-9876543210",
        suggested_deadline_hours=48
    )
