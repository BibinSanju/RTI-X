import os
import requests
import json
from fastapi import APIRouter
from models import ClassifyIntentRequest, ClassifyIntentResponse

router = APIRouter(prefix="/api", tags=["Intent Classification"])

@router.post("/classify-intent", response_model=ClassifyIntentResponse)
def classify_intent(request: ClassifyIntentRequest):
    api_key = os.environ.get("GROQ_API_KEY_CLASSIFIER", os.environ.get("GROQ_API_KEY"))
    
    system_prompt = """You are an AI classification engine for a public grievance system in Tamil Nadu.
The user's grievance may be in English, Tamil, or Tanglish (a mix of both).
Classify the user's grievance into one of these exact categories:
ROAD_INFRASTRUCTURE, SEWAGE_DRAINAGE, WATER_SUPPLY, ELECTRICITY, GARBAGE_HEALTH, BUILDING_APPROVAL, HIGHWAYS, REVENUE_AND_TAX, EDUCATION, TRANSPORT, CIVIL_SUPPLIES, HEALTHCARE, REGISTRATION, GENERAL, APPEAL.

CRITICAL INSTRUCTIONS:
- If the text mentions "road", "pothole", "otai" (hole), "road-la otai" (hole in the road), classify as ROAD_INFRASTRUCTURE.
- If the text mentions water, pipes, drinking water, classify as WATER_SUPPLY.

Respond ONLY with a JSON object in this exact format:
{
  "category": "CATEGORY_NAME",
  "classification": "IMMEDIATE_CAUSE", 
  "ward": "Unknown"
}
"""
    try:
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'model': 'llama3-70b-8192',
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': f'Grievance: "{request.grievance_text}"'}
                ],
                'response_format': {'type': 'json_object'},
                'temperature': 0.1
            }
        )
        if response.status_code == 200:
            data = response.json()
            result = json.loads(data['choices'][0]['message']['content'])
            category = result.get("category", "GENERAL")
            classification_type = result.get("classification", "IMMEDIATE_CAUSE")
            
            return ClassifyIntentResponse(
                classification=classification_type,
                department=category,
                ward=result.get("ward", "Unknown"),
                extracted_entities={"issue": request.grievance_text}
            )
    except Exception as e:
        print("Groq API error:", e)

    # Fallback response
    return ClassifyIntentResponse(
        classification="IMMEDIATE_CAUSE",
        department="GENERAL",
        ward="Unknown",
        extracted_entities={"issue": request.grievance_text}
    )

