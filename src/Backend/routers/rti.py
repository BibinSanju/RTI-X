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
    department = "GENERAL"
    
    # 1. Try to fetch complaint details
    try:
        complaint = None
        if request.complaint_id and str(request.complaint_id) != "mock-complaint":
            complaint = db.query(Complaint).filter(Complaint.id == request.complaint_id).first()
            
        if complaint:
            department = (complaint.department_category or "GENERAL").upper()
            # 2. Try to lookup specific PIO in directory
            pio_record = db.query(PIODirectory).filter(
                PIODirectory.department_category.ilike(f"%{department}%")
            ).first()
            if pio_record:
                pio_desig = pio_record.pio_designation
                pio_addr = f"{pio_record.office_address}, {pio_record.district} - {pio_record.pincode}"
    except Exception as e:
        print(f"Notice: PIO directory lookup fallback used: {e}")

    clean_desc = request.user_description.strip()
    if clean_desc.lower().startswith("why ") or clean_desc.lower().startswith("how "):
        clean_desc = f"the official file notes, inspection records, and administrative decisions regarding {clean_desc}"

    # Build category-tailored Section 2(f) questions
    if "REGIST" in department:
        pio_desig = pio_desig if pio_desig != "The Public Information Officer (PIO)" else "The Public Information Officer / Sub Registrar"
        pio_addr = pio_addr if pio_addr != "Municipal Corporation Office, Tamil Nadu" else "Sub Registrar Office, Registration Department, Tamil Nadu"
        draft = (
            f"Under Section 6(1) read with Section 2(f) of the Right to Information Act, 2005, "
            f"please provide certified copies of the following official public records regarding: {clean_desc}.\n\n"
            f"1. Provide certified copy of the Citizen's Charter and official statutory fee receipt schedule applicable to document registration and encumbrance verification.\n"
            f"2. Provide certified copy of the daily token register, counter attendance log, and CCTV footage access log for the date of the transaction.\n"
            f"3. Provide certified copy of official reasons recorded in writing under Section 71 of the Registration Act, 1908 regarding pendency, delay, or refusal of the subject registration.\n"
            f"4. Provide certified copy of grievance registration logs and action taken report (ATR) by the District Registrar on complaints filed regarding un-receipted fee demands."
        )
    elif "REVENUE" in department or "TAX" in department:
        pio_desig = pio_desig if pio_desig != "The Public Information Officer (PIO)" else "The Public Information Officer / District Revenue Officer"
        pio_addr = pio_addr if pio_addr != "Municipal Corporation Office, Tamil Nadu" else "Taluk Office & District Collectorate, Revenue Department, Tamil Nadu"
        draft = (
            f"Under Section 6(1) read with Section 2(f) of the Right to Information Act, 2005, "
            f"please provide certified copies of the following official public records regarding: {clean_desc}.\n\n"
            f"1. Provide certified copy of file notes, field verification reports, and Village Administrative Officer (VAO) recommendation entries regarding this application.\n"
            f"2. Provide certified copy of the Tamil Nadu Citizen Charter specifying the mandatory statutory turnaround time (SLA) for Patta mutation and land record corrections.\n"
            f"3. Provide certified copy of the Daily Disposal Register and pendency report of the concerned Tahsildar / Taluk office for the preceding 6 months."
        )
    elif "WATER" in department:
        draft = (
            f"Under Section 6(1) read with Section 2(f) of the Right to Information Act, 2005, "
            f"please provide certified copies of the following official public records regarding: {clean_desc}.\n\n"
            f"1. Provide certified copy of daily municipal drinking water distribution logs and valve operation schedules for this locality.\n"
            f"2. Provide certified copy of sanctioned work orders, expenditure vouchers, and contractor agreements for pipeline repairs in this area.\n"
            f"3. Provide certified copy of water quality test lab reports (chlorine, bacterial, turbidity) conducted during the last 90 days."
        )
    elif "ELECTRIC" in department:
        draft = (
            f"Under Section 6(1) read with Section 2(f) of the Right to Information Act, 2005, "
            f"please provide certified copies of the following official public records regarding: {clean_desc}.\n\n"
            f"1. Provide certified copy of the Substation breakdown logbook and power interruption register for this feeder line.\n"
            f"2. Provide certified copy of sanctioned work orders and material requisition vouchers for transformer/pole repairs.\n"
            f"3. Provide certified copy of street light maintenance contract agreement and Defect Liability Period (DLP) terms."
        )
    else:
        # Default / Road / Infrastructure
        draft = (
            f"Under Section 6(1) read with Section 2(f) of the Right to Information Act, 2005, "
            f"please provide certified copies of the following official records regarding: {clean_desc}.\n\n"
            f"1. Provide certified copy of sanctioned work orders, technical estimates, and administrative approval notes.\n"
            f"2. Provide certified copy of measurement book (MB) entries, quality control test reports, and contractor warranty terms.\n"
            f"3. Provide certified copy of grievance registration and action-taken reports filed to date."
        )
    
    return RTIDraftResponse(
        rti_text=draft,
        target_pio_designation=pio_desig,
        target_pio_address=pio_addr
    )
