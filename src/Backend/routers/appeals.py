from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Complaint, User
from models import AppealGenerateRequest, AppealGenerateResponse
from datetime import datetime

router = APIRouter(prefix="/api/appeals", tags=["Appeals"])

@router.post("/generate", response_model=AppealGenerateResponse)
def generate_appeal(request: AppealGenerateRequest, db: Session = Depends(get_db)):
    applicant_name = "Citizen Applicant"
    applicant_address = "District Administration Jurisdiction, Tamil Nadu"
    dept_name = "Civic Administration"
    filing_date_str = "Over 30 days ago"
    
    try:
        complaint = db.query(Complaint).filter(Complaint.id == request.complaint_id).first()
        if complaint:
            dept_name = complaint.department_category.replace('_', ' ')
            if complaint.created_at:
                filing_date_str = complaint.created_at.strftime("%d/%m/%Y")
            if complaint.user:
                applicant_name = complaint.user.name or applicant_name
                applicant_address = complaint.user.address or applicant_address
    except Exception as e:
        print(f"Notice: Appeal lookup fallback used: {e}")

    appeal_text = (
        f"FORM OF FIRST APPEAL UNDER SECTION 19(1) OF THE RIGHT TO INFORMATION ACT, 2005\n\n"
        f"To,\n"
        f"The First Appellate Authority (FAA),\n"
        f"O/o The Appellate Authority & Head of Department,\n"
        f"{dept_name} Section, Tamil Nadu.\n\n"
        f"1. Name of the Appellant: {applicant_name}\n"
        f"2. Address of the Appellant: {applicant_address}\n"
        f"3. Date of filing RTI Application under Sec 6(1): {filing_date_str}\n"
        f"4. Name and Designation of the PIO against whose non-decision appeal is preferred: Public Information Officer, {dept_name}\n"
        f"5. Statutory Expiry: The statutory period of thirty (30) days prescribed under Section 7(1) has elapsed without response or supply of certified information.\n\n"
        f"GROUNDS FOR APPEAL:\n"
        f"a. The PIO has failed to provide the certified public records within the statutory period of 30 days mandated by Section 7(1) of the RTI Act, 2005.\n"
        f"b. Deemed Refusal: As per Section 7(2), failure to give information within statutory limits is deemed refusal of request.\n\n"
        f"PRAYER / RELIEF SOUGHT:\n"
        f"The Appellant prays that the First Appellate Authority direct the PIO to furnish certified copies of the requested information immediately and free of charge pursuant to Section 7(6) of the RTI Act 2005.\n\n"
        f"Verification:\n"
        f"I, {applicant_name}, verify that the contents of this appeal are true and correct to the best of my knowledge.\n\n"
        f"Date: {datetime.now().strftime('%d/%m/%Y')}\n"
        f"Signature of Appellant: ____________________"
    )

    return AppealGenerateResponse(appeal_text=appeal_text)
