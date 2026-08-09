import os
import requests
import json
from fastapi import APIRouter
from models import ClassifyIntentRequest, ClassifyIntentResponse

router = APIRouter(prefix="/api", tags=["Intent Classification"])

@router.post("/classify-intent", response_model=ClassifyIntentResponse)
def classify_intent(request: ClassifyIntentRequest):
    # Hardcoded response for demo
    return ClassifyIntentResponse(
        classification="IMMEDIATE_CAUSE",
        department="ROAD_INFRASTRUCTURE",
        ward="Ward 10",
        extracted_entities={"issue": request.grievance_text}
    )

