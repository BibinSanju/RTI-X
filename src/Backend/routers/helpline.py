from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db, EmergencyHelpline, PIODirectory
from models import HelplineResolveRequest, HelplineResolveResponse, EmergencyHelplineResponse
from typing import List

router = APIRouter(prefix="/api", tags=["Helplines"])

CATEGORY_MAP = {
    "ROAD": "ROAD_INFRASTRUCTURE",
    "ROADS": "ROAD_INFRASTRUCTURE",
    "ROAD_INFRASTRUCTURE": "ROAD_INFRASTRUCTURE",
    "ROADS_AND_SEWAGE": "ROAD_INFRASTRUCTURE",
    "WATER": "WATER_SUPPLY",
    "WATER_SUPPLY": "WATER_SUPPLY",
    "ELECTRIC": "ELECTRICITY",
    "ELECTRICITY": "ELECTRICITY",
    "SEWAGE": "SEWAGE_DRAINAGE",
    "SEWAGE_DRAINAGE": "SEWAGE_DRAINAGE",
    "DRAIN": "SEWAGE_DRAINAGE",
    "DRAINAGE": "SEWAGE_DRAINAGE",
    "GARBAGE": "GARBAGE_HEALTH",
    "GARBAGE_HEALTH": "GARBAGE_HEALTH",
    "PUBLIC_HEALTH": "GARBAGE_HEALTH",
    "BUILDING": "BUILDING_APPROVAL",
    "BUILDING_APPROVAL": "BUILDING_APPROVAL",
    "HIGHWAY": "HIGHWAYS",
    "HIGHWAYS": "HIGHWAYS",
    "REVENUE": "REVENUE_AND_TAX",
    "TAX": "REVENUE_AND_TAX",
    "REVENUE_AND_TAX": "REVENUE_AND_TAX",
    "EDUCATION": "EDUCATION",
    "TRANSPORT": "TRANSPORT",
    "CIVIL_SUPPLIES": "CIVIL_SUPPLIES",
    "RATION": "CIVIL_SUPPLIES",
    "PDS": "CIVIL_SUPPLIES",
    "HEALTHCARE": "HEALTHCARE",
    "HOSPITAL": "HEALTHCARE",
    "REGISTRATION": "REGISTRATION",
    "GENERAL": "GENERAL",
    "APPEAL": "APPEAL",
}

def normalize_category(cat: str) -> str:
    if not cat:
        return "GENERAL"
    cat_upper = cat.upper().strip()
    if cat_upper in CATEGORY_MAP:
        return CATEGORY_MAP[cat_upper]
    for key, mapped in CATEGORY_MAP.items():
        if key in cat_upper:
            return mapped
    return "GENERAL"

@router.get("/emergency-contacts", response_model=List[EmergencyHelplineResponse])
def get_emergency_contacts(category: str, zone: str = None, db: Session = Depends(get_db)):
    db_category = normalize_category(category)
        
    query = db.query(EmergencyHelpline).filter(
        EmergencyHelpline.department_category.ilike(f"%{db_category}%")
    )
    
    if zone and zone != "Unknown" and zone != "General":
        zone_matches = query.filter(EmergencyHelpline.zone_or_ward.ilike(f"%{zone}%")).all()
        if zone_matches:
            return zone_matches
    
    contacts = query.all()
    if not contacts:
        contacts = db.query(EmergencyHelpline).filter(
            EmergencyHelpline.department_category == "GENERAL"
        ).all()
        
    return contacts

@router.post("/helpline/resolve", response_model=HelplineResolveResponse)
def resolve_helpline(request: HelplineResolveRequest, db: Session = Depends(get_db)):
    try:
        norm_cat = normalize_category(request.department)
        
        # 1. Search for a direct contact in EmergencyHelpline
        contact_query = db.query(EmergencyHelpline).filter(
            EmergencyHelpline.department_category.ilike(f"%{norm_cat}%")
        )
        if request.ward and request.ward != "Unknown" and request.ward != "General":
            ward_contact = contact_query.filter(
                EmergencyHelpline.zone_or_ward.ilike(f"%{request.ward}%")
            ).first()
            if ward_contact:
                return HelplineResolveResponse(
                    contact_person=ward_contact.contact_name or ward_contact.contact_title,
                    helpline_number=ward_contact.contact_value,
                    suggested_deadline_hours=48
                )

        contact = contact_query.first()
        if contact:
            return HelplineResolveResponse(
                contact_person=contact.contact_name or contact.contact_title,
                helpline_number=contact.contact_value,
                suggested_deadline_hours=48
            )

        # 2. Search in PIODirectory
        pio_query = db.query(PIODirectory).filter(
            PIODirectory.department_category.ilike(f"%{norm_cat}%")
        )
        pio = pio_query.first()
        if pio and pio.helpline_phone_number:
            return HelplineResolveResponse(
                contact_person=pio.pio_designation,
                helpline_number=pio.helpline_phone_number,
                suggested_deadline_hours=48
            )
    except Exception as e:
        print(f"Error querying helpline in DB: {e}")

    # Fallback kept aside for graceful resilience
    return HelplineResolveResponse(
        contact_person="Municipal Civic Control Room",
        helpline_number="1100",
        suggested_deadline_hours=48
    )
