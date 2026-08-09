import os
import requests
import json
from fastapi import APIRouter
from models import ClassifyIntentRequest, ClassifyIntentResponse

router = APIRouter(prefix="/api", tags=["Intent Classification"])

@router.post("/classify-intent", response_model=ClassifyIntentResponse)
def classify_intent(request: ClassifyIntentRequest):
    text = request.grievance_text.lower()
    if "water" in text:
        department = "WATER_SUPPLY"
    elif "electric" in text or "current" in text or "power" in text:
        department = "ELECTRICITY"
    else:
        department = "ROAD_INFRASTRUCTURE"

    return ClassifyIntentResponse(
        classification="IMMEDIATE_CAUSE",
        department=department,
        ward="Ward 10",
        extracted_entities={"issue": request.grievance_text}
    )

