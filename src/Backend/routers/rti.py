from fastapi import APIRouter
from models import RTIDraftRequest, RTIDraftResponse

router = APIRouter(prefix="/api/rti", tags=["RTI Engine"])

@router.post("/draft", response_model=RTIDraftResponse)
def draft_rti(request: RTIDraftRequest):
    draft = f"To The Public Information Officer,\n\nUnder Section 2(f) of the RTI Act 2005, please provide information regarding: {request.user_description}."
    
    return RTIDraftResponse(
        rti_text=draft,
        target_pio_designation="Public Information Officer",
        target_pio_address="Municipal Corporation Office"
    )
