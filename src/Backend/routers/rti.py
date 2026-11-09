import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Complaint, PIODirectory
from models import RTIDraftRequest, RTIDraftResponse

router = APIRouter(prefix="/api/rti", tags=["RTI Engine"])

@router.post("/draft", response_model=RTIDraftResponse)
def draft_rti(request: RTIDraftRequest, db: Session = Depends(get_db)):
    pio_desig = "The Public Information Officer (PIO)"
    pio_addr = "Municipal Corporation Office, Tamil Nadu"
    department = "Civil Works"
    
    # 1. Try to fetch complaint details
    try:
        complaint = None
        if request.complaint_id and str(request.complaint_id) != "mock-complaint":
            complaint = db.query(Complaint).filter(Complaint.id == request.complaint_id).first()
            
        if complaint:
            department = complaint.department_category or "Civil Works"
            # 2. Try to lookup specific PIO in directory
            pio_record = db.query(PIODirectory).filter(
                PIODirectory.department_category.ilike(f"%{department}%")
            ).first()
            if pio_record:
                pio_desig = pio_record.pio_designation
                pio_addr = f"{pio_record.office_address}, {pio_record.district} - {pio_record.pincode}"
    except Exception as e:
        print(f"Notice: PIO directory lookup fallback used: {e}")

    # Build Section 2(f) legally compliant query
    clean_desc = request.user_description.strip()
    if clean_desc.lower().startswith("why ") or clean_desc.lower().startswith("how "):
        clean_desc = f"the official file notes, inspection records, and administrative decisions regarding {clean_desc}"

    draft = (
        f"Under Section 6(1) read with Section 2(f) of the Right to Information Act, 2005, "
        f"please provide certified copies of the following official records regarding: {clean_desc}.\n\n"
        f"1. Provide certified copy of sanctioned work orders, technical estimates, and administrative approval notes.\n"
        f"2. Provide certified copy of measurement book (MB) entries and quality control test reports.\n"
        f"3. Provide certified copy of grievance registration and action-taken reports filed to date."
    )
    
    return RTIDraftResponse(
        rti_text=draft,
        target_pio_designation=pio_desig,
        target_pio_address=pio_addr
    )
