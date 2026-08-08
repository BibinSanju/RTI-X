from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, PIODirectory
from models import HelplineResolveRequest, HelplineResolveResponse

router = APIRouter(prefix="/api/helpline", tags=["Helplines"])

@router.post("/resolve", response_model=HelplineResolveResponse)
def resolve_helpline(request: HelplineResolveRequest, db: Session = Depends(get_db)):
    # Mock logic
    return HelplineResolveResponse(
        contact_person="Junior Engineer",
        helpline_number="+91-9876543210",
        suggested_deadline_hours=48
    )

from typing import List, Optional
from models import EmergencyHelplineResponse
from database import EmergencyHelpline

@router.get("/emergency-contacts", response_model=List[EmergencyHelplineResponse])
def get_emergency_contacts(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(EmergencyHelpline)
    if category:
        query = query.filter(EmergencyHelpline.authority_name.ilike(f"%{category}%"))
    return query.all()
