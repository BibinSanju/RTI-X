from fastapi import FastAPI
from database import PIODirectory, Complaint, User, get_db
from fastapi.middleware.cors import CORSMiddleware
from routers import intent, helpline, complaints, rti, cron, appeals

app = FastAPI()

origins = [
    "https://frontend-rho-two-tniuknfmwg.vercel.app", 
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "https://rti-x-git-main-neural-ninjas.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+",
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
    db_status = "Connected"
    try:
        from database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"Disconnected (Fallback mode: {type(e).__name__})"
        
    return {"status": "Running", "Database": db_status}
