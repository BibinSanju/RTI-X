import os
import requests
import json
import re
from fastapi import APIRouter
from models import ClassifyIntentRequest, ClassifyIntentResponse

router = APIRouter(prefix="/api", tags=["Intent Classification"])

TAMIL_BRIBE_KEYWORDS = [
    "லஞ்சம்", "கையூட்டு", "பணம் கேட்டாங்க", "காசு கேக்குறாங்க", "ஊழல்", 
    "bribe", "bribery", "corruption", "speed money", "demanded money",
    "பணம் கேட்கிறார்", "காசு கேட்கிறார்", "லஞ்ச"
]

TAMIL_REGISTRATION_KEYWORDS = [
    "பத்திரம்", "பத்திரப்பதிவு", "பதிவுத்துறை", "சார்பதிவாளர்", "வில்லங்கம்",
    "sub-registrar", "sub registrar", "registration", "encumbrance", "deed", "stamp duty"
]

TAMIL_REVENUE_KEYWORDS = [
    "பட்டா", "சிட்டா", "அடங்கல்", "விஏஓ", "வருவாய்", "தாசில்தார்",
    "patta", "chitta", "vao", "tahsildar", "revenue inspector", "taluk"
]

TAMIL_ROAD_KEYWORDS = [
    "ரோடு", "பள்ளம்", "குழி", "தார்ப்பாய்", "சாலை",
    "road", "pothole", "tar", "asphalt", "crater", "otai"
]

TAMIL_WATER_KEYWORDS = [
    "தண்ணீர்", "குடிநீர்", "பைப்", "குழாய்", "கசிவு",
    "water", "drinking water", "pipe", "leak", "pipeline", "tanker"
]

TAMIL_ELECTRICITY_KEYWORDS = [
    "மின்சாரம்", "கரண்ட்", "மின் கம்பம்", "மின் விளக்கு", "தெரு விளக்கு", "டிரான்ஸ்பார்மர்",
    "power", "electricity", "street light", "wire", "pole", "transformer", "tangedco", "eb"
]

TAMIL_SEWAGE_KEYWORDS = [
    "சாக்கடை", "கழிவுநீர்", "மழைநீர் வடிகால்", "மேன்ஹோல்",
    "sewage", "drainage", "manhole", "drain", "gutter"
]

TAMIL_GARBAGE_KEYWORDS = [
    "குப்பை", "துப்புரவு", "கொசு", "டெங்கு",
    "garbage", "waste", "sanitation", "mosquito", "dengue", "cleaning"
]

def rule_based_fallback(text: str) -> dict:
    lower = text.lower()
    
    # Check for bribe / corruption
    is_bribe = any(k in lower or k in text for k in TAMIL_BRIBE_KEYWORDS)
    is_reg = any(k in lower or k in text for k in TAMIL_REGISTRATION_KEYWORDS)
    is_rev = any(k in lower or k in text for k in TAMIL_REVENUE_KEYWORDS)
    is_road = any(k in lower or k in text for k in TAMIL_ROAD_KEYWORDS)
    is_water = any(k in lower or k in text for k in TAMIL_WATER_KEYWORDS)
    is_elec = any(k in lower or k in text for k in TAMIL_ELECTRICITY_KEYWORDS)
    is_sewage = any(k in lower or k in text for k in TAMIL_SEWAGE_KEYWORDS)
    is_garbage = any(k in lower or k in text for k in TAMIL_GARBAGE_KEYWORDS)
    
    if is_bribe and is_reg:
        return {"category": "REGISTRATION", "classification": "DIRECT_RTI"}
    elif is_bribe and is_rev:
        return {"category": "REVENUE_AND_TAX", "classification": "DIRECT_RTI"}
    elif is_bribe:
        return {"category": "REGISTRATION", "classification": "DIRECT_RTI"}
    elif is_reg:
        return {"category": "REGISTRATION", "classification": "DIRECT_RTI"}
    elif is_rev:
        return {"category": "REVENUE_AND_TAX", "classification": "DIRECT_RTI"}
    elif is_water:
        return {"category": "WATER_SUPPLY", "classification": "IMMEDIATE_CAUSE"}
    elif is_elec:
        return {"category": "ELECTRICITY", "classification": "IMMEDIATE_CAUSE"}
    elif is_sewage:
        return {"category": "SEWAGE_DRAINAGE", "classification": "IMMEDIATE_CAUSE"}
    elif is_garbage:
        return {"category": "GARBAGE_HEALTH", "classification": "IMMEDIATE_CAUSE"}
    elif is_road:
        return {"category": "ROAD_INFRASTRUCTURE", "classification": "IMMEDIATE_CAUSE"}
    
    return {"category": "GENERAL", "classification": "IMMEDIATE_CAUSE"}

@router.post("/classify-intent", response_model=ClassifyIntentResponse)
def classify_intent(request: ClassifyIntentRequest):
    api_key = os.environ.get("GROQ_API_KEY_CLASSIFIER", os.environ.get("GROQ_API_KEY"))
    text = request.grievance_text.strip()
    
    system_prompt = """You are an expert AI classification engine for Tamil Nadu public grievances and RTI filings.
The citizen's grievance may be in Tamil (தமிழ்), Tanglish (Tamil in English script), or English.

Classify the user's grievance into:
1. 'category': Exactly one of:
   - REGISTRATION (Sub-Registrar office, land deed registration, patta transfer bribery, EC, guideline value, பத்திரப்பதிவு, லஞ்சம்)
   - REVENUE_AND_TAX (VAO, Tahsildar, patta/chitta, property tax, revenue certificates, பட்டா, சிட்டா)
   - ROAD_INFRASTRUCTURE (Potholes, broken roads, damaged asphalt, ரோடு, பள்ளம்)
   - WATER_SUPPLY (Drinking water, pipe bursts, leakage, குடிநீர், தண்ணீர்)
   - ELECTRICITY (Power cut, transformer, street light, EB/TANGEDCO, கரண்ட், மின்சாரம்)
   - SEWAGE_DRAINAGE (Open drainage, sewage overflow, சாக்கடை, கழிவுநீர்)
   - GARBAGE_HEALTH (Garbage dump, sanitation, dengue, குப்பை, சுகாதாரம்)
   - BUILDING_APPROVAL (Illegal construction, building plan approval)
   - HIGHWAYS (National/State highways, toll plaza, நெடுஞ்சாலை)
   - EDUCATION (School infrastructure, noon meal, fees, பள்ளி)
   - TRANSPORT (Bus breakdown, route, RTO, பேருந்து)
   - CIVIL_SUPPLIES (Ration shop, PDS rice/sugar, smart card, ரேஷன் கடை)
   - HEALTHCARE (Government hospital, doctor absence, medicine shortage, அரசு மருத்துவமனை)
   - GENERAL (Other civic hazards, fallen trees, flooding)
   - APPEAL (First appeal, RTI delay)

2. 'classification':
   - 'DIRECT_RTI': When the user reports corruption, bribery, scam, extortion ('லஞ்சம்', 'பணம் கேட்டாங்க', 'கையூட்டு', 'bribe', 'corruption', 'money demanded') OR asks for certified government records/files/tenders.
   - 'IMMEDIATE_CAUSE': Only for immediate physical infrastructure repair/hazards (burst pipe, live wire, broken pothole, overflowing garbage).

Respond ONLY with a JSON object in this exact format:
{
  "category": "CATEGORY_NAME",
  "classification": "DIRECT_RTI" or "IMMEDIATE_CAUSE",
  "ward": "Unknown"
}
"""
    try:
        if api_key:
            response = requests.post(
                'https://api.groq.com/openai/v1/chat/completions',
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {api_key}'
                },
                json={
                    'model': 'openai/gpt-oss-120b',
                    'messages': [
                        {'role': 'system', 'content': system_prompt},
                        {'role': 'user', 'content': f'Grievance: "{text}"'}
                    ],
                    'response_format': {'type': 'json_object'},
                    'temperature': 0.1
                },
                timeout=10
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
                    extracted_entities={"issue": text}
                )
            else:
                print(f"Groq API returned status {response.status_code}: {response.text}")
    except Exception as e:
        print("Groq API classification error, activating local semantic fallback:", e)

    # High-accuracy deterministic fallback
    fb = rule_based_fallback(text)
    return ClassifyIntentResponse(
        classification=fb["classification"],
        department=fb["category"],
        ward="Unknown",
        extracted_entities={"issue": text}
    )
