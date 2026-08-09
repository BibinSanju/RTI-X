import requests

url = "http://localhost:8000/api/emergency-contacts?category=ROAD_INFRASTRUCTURE"
try:
    response = requests.get(url)
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    print("Error:", e)
