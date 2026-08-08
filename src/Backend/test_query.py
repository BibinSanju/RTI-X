import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

sys.path.append(os.path.join(os.getcwd(), 'src', 'Backend'))
from database import EmergencyHelpline

load_dotenv(os.path.join(os.getcwd(), 'src', 'Backend', '.env'))

USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

category = "ROADS_AND_SEWAGE"
db_category = category
if "ROAD" in category.upper():
    db_category = "ROAD_INFRASTRUCTURE"
elif "WATER" in category.upper():
    db_category = "WATER_SUPPLY"
elif "SEWAGE" in category.upper() or "HEALTH" in category.upper():
    db_category = "GARBAGE_HEALTH"

query = db.query(EmergencyHelpline).filter(
    EmergencyHelpline.department_category.ilike(f"%{db_category}%")
)
results = query.all()
print(f"Mapped {category} to {db_category}")
print(f"Found {len(results)} results")
for r in results:
    print(r.contact_title)
