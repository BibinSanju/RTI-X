from fastapi import FastAPI
from database import PIODirectory, Complaint, User, get_db
from fastapi.middleware.cors import CORSMiddleware
from routers import intent, helpline, complaints, rti, cron, appeals

app = FastAPI()

origins = ["https://frontend-rho-two-tniuknfmwg.vercel.app", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(intent.router)
app.include_router(helpline.router)
app.include_router(complaints.router)
app.include_router(rti.router)
app.include_router(cron.router)
app.include_router(appeals.router)

@app.get("/")
def check_health():
    return {"status": "Running", "Database": "Connected"}
