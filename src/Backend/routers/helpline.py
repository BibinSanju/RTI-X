# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, EmergencyHelpline
from models import HelplineResolveRequest, HelplineResolveResponse, EmergencyHelplineResponse
from typing import List

router = APIRouter(prefix="/api", tags=["Helplines"])

@router.get("/emergency-contacts", response_model=List[EmergencyHelplineResponse])
def get_emergency_contacts(category: str, zone: str = None, db: Session = Depends(get_db)):
    # Map the AI classification strictly to the DB structure provided
    db_category = category
    if "ROAD" in category.upper():
        db_category = "ROAD_INFRASTRUCTURE"
    elif "WATER" in category.upper():
        db_category = "WATER_SUPPLY"
    elif "SEWAGE" in category.upper() or "HEALTH" in category.upper():
        db_category = "GARBAGE_HEALTH"
        
    query = db.query(EmergencyHelpline).filter(
        EmergencyHelpline.department_category.ilike(f"%{db_category}%")
    )

    print("before filter" , query.all())
    
    if zone:
        from sqlalchemy import or_
        query = query.filter(
            or_(
                EmergencyHelpline.zone_or_ward.ilike(f"%{zone}%"),
                EmergencyHelpline.zone_or_ward.is_(None)
            )
        )
    
    # Return matched emergency contacts from DB
    print(query.all())
    return query.all()

@router.post("/helpline/resolve", response_model=HelplineResolveResponse)
def resolve_helpline(request: HelplineResolveRequest, db: Session = Depends(get_db)):
    # Mock logic
    return HelplineResolveResponse(
        contact_person="Junior Engineer",
        helpline_number="+91-9876543210",
        suggested_deadline_hours=48
    )


