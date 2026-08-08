from fastapi import APIRouter
from models import ClassifyIntentRequest, ClassifyIntentResponse

router = APIRouter(prefix="/api", tags=["Intent Classification"])

@router.post("/classify-intent", response_model=ClassifyIntentResponse)
def classify_intent(request: ClassifyIntentRequest):
    # TODO: Integrate with Gemini API for actual classification
    # Mock response for now
    return ClassifyIntentResponse(
        classification="IMMEDIATE_CAUSE",
        department="Water Board",
        ward="Ward 10",
        extracted_entities={"issue": request.grievance_text}
    )
