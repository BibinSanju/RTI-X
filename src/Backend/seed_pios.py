import os
import json
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from database import Base, PIODirectory

load_dotenv()
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"
engine = create_engine(DATABASE_URL)

def seed():
    # 1. Drop just the pio_directory table
    try:
        PIODirectory.__table__.drop(engine)
        print("Dropped pio_directory table.")
    except Exception as e:
        print(f"Table might not exist or couldn't drop: {e}")

    # 2. Recreate tables (this will create pio_directory with new schema)
    Base.metadata.create_all(bind=engine)
    print("Recreated tables.")

    # 3. Read JSON and insert data
    json_path = os.path.join(os.path.dirname(__file__), "..", "data", "pios.json")
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    with engine.begin() as conn:
        for item in data:
            stmt = text("""
                INSERT INTO pio_directory 
                (id, district, local_body, zone_or_ward, department_category, pio_designation, office_address, pincode, online_supported)
                VALUES 
                (:id, :district, :local_body, :zone_or_ward, :department_category, :pio_designation, :office_address, :pincode, :online_supported)
            """)
            conn.execute(stmt, item)
            
    print(f"Successfully seeded {len(data)} PIOs into the database.")

if __name__ == "__main__":
    seed()
