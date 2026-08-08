from fastapi import FastAPI
from database import PIODirectory,RTITelemetryLog,get_db



app = FastAPI()

@app.get("/")
def check_health():
    return {"status" : "Running"}
