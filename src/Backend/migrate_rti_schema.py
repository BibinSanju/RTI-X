import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"
engine = create_engine(DATABASE_URL)

queries = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(150);",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(50) DEFAULT 'India';",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100);",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS status_rural_urban VARCHAR(20);",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS educational_status VARCHAR(20);",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS citizenship VARCHAR(50) DEFAULT 'Indian';",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_bpl BOOLEAN;",
    "ALTER TABLE complaints ADD COLUMN IF NOT EXISTS problem_description TEXT;"
]

with engine.begin() as conn:
    for query in queries:
        try:
            conn.execute(text(query))
            print(f"Executed: {query}")
        except Exception as e:
            print(f"Error executing {query}: {e}")

print("Migration completed successfully.")
