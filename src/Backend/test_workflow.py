import requests
import uuid

base_url = "http://localhost:8000"

def test_workflow():
    print("Testing Endpoints...")
    
    # Create complaint
    c_data = {
        "user_id": str(uuid.uuid4()),
        "district": "Coimbatore",
        "ward_name": "Test Ward",
        "department_category": "WATER_SUPPLY",
        "problem_description": "Water pipe broken",
        "rejection_risk_score": "LOW"
    }
    res = requests.post(f"{base_url}/api/complaints/create", json=c_data)
    print(f"Create Complaint: {res.status_code}")
    c_id = res.json().get("id")
    
    # Test call status
    res = requests.post(f"{base_url}/api/complaints/{c_id}/call-status", json={"answered": True})
    print(f"Call Status (True): {res.status_code} - Status: {res.json().get('status')}")
    
    # Test resolution status
    res = requests.post(f"{base_url}/api/complaints/{c_id}/resolution-status", json={"cleared": False})
    print(f"Resolution (False): {res.status_code} - Status: {res.json().get('status')}")
    
    # Test RTI status
    res = requests.post(f"{base_url}/api/complaints/{c_id}/rti-status", json={"submitted": True})
    print(f"RTI (True): {res.status_code} - Status: {res.json().get('status')}")
    
    # Test cron
    res = requests.post(f"{base_url}/api/cron/process-deadlines")
    print(f"Cron: {res.status_code} - {res.json()}")
    
if __name__ == "__main__":
    test_workflow()
