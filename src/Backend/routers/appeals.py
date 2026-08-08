from fastapi import APIRouter
from models import AppealGenerateRequest, AppealGenerateResponse

router = APIRouter(prefix="/api/appeals", tags=["Appeals"])

@router.post("/generate", response_model=AppealGenerateResponse)
def generate_appeal(request: AppealGenerateRequest):
    appeal_text = "FORM OF FIRST APPEAL UNDER SECTION 19(1) OF RTI ACT 2005...\n\nSince no reply was received within 30 days..."
    return AppealGenerateResponse(appeal_text=appeal_text)
