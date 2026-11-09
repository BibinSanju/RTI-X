import os
import requests
import json
from datetime import datetime, timedelta, timezone

def generate_local_resolution_deadline(problem_description: str) -> datetime:
    """
    Determines the civic resolution SLA deadline.
    Calls Groq LLM if configured; seamlessly falls back to domain-rule heuristic.
    """
    api_key = os.environ.get("GROQ_API_KEY_CLASSIFIER") or os.environ.get("GROQ_API_KEY")
    
    if api_key and problem_description and len(problem_description.strip()) > 5:
        try:
            prompt = (
                "You are an Indian Municipal SLA specialist. "
                "Analyze this civic complaint description and estimate the realistic turnaround time in days (between 1 and 14 days). "
                "Respond ONLY with a JSON object: {\"days\": integer}\n\n"
                f"Complaint: \"{problem_description}\""
            )
            response = requests.post(
                'https://api.groq.com/openai/v1/chat/completions',
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {api_key}'
                },
                json={
                    'model': 'llama3-8b-8192',
                    'messages': [{'role': 'user', 'content': prompt}],
                    'response_format': {'type': 'json_object'},
                    'temperature': 0.1
                },
                timeout=4
            )
            if response.status_code == 200:
                data = response.json()
                content = json.loads(data['choices'][0]['message']['content'])
                days = int(content.get("days", 3))
                days = max(1, min(days, 15)) # clamp between 1 and 15 days
                return datetime.now(timezone.utc) + timedelta(days=days)
        except Exception as e:
            print(f"Notice: Groq SLA estimation error, falling back to civic rules: {e}")

    # Fallback civic rules kept aside for resilience
    days_to_resolve = 2
    if problem_description:
        desc_lower = problem_description.lower()
        if "water" in desc_lower or "pipe" in desc_lower:
            days_to_resolve = 3
        elif "pothole" in desc_lower or "road" in desc_lower:
            days_to_resolve = 7
        elif "garbage" in desc_lower or "waste" in desc_lower:
            days_to_resolve = 2
        elif "electric" in desc_lower or "wire" in desc_lower or "light" in desc_lower:
            days_to_resolve = 1
            
    return datetime.now(timezone.utc) + timedelta(days=days_to_resolve)
