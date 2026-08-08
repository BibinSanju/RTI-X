import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import EmergencyHelpline, engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

print("--- Emergency Helplines in DB ---")
contacts = db.query(EmergencyHelpline).all()
if not contacts:
    print("Database is completely EMPTY!")
else:
    for c in contacts:
        print(f"[{c.department_category}] Ward/Zone: '{c.zone_or_ward}' | Name: {c.authority_name} | Contact: {c.contact_value}")

db.close()
