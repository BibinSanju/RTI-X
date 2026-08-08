
from sqlalchemy import create_engine,String, Boolean, Integer, Text, DateTime, Index, func
from dotenv import load_dotenv
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional


from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column,Session,sessionmaker

load_dotenv()

# Fetch variables
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")


DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"


engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as connection:
        print("Connection successful!")
except Exception as e:
    print(f"Failed to connect: {e}")

class Base(DeclarativeBase):
    pass


def get_default_statutory_deadline() -> datetime:
    """Calculates the statutory 30-day RTI response deadline."""
    return datetime.now(timezone.utc) + timedelta(days=30)



class PIODirectory(Base):
    __tablename__ = "pio_directory"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    local_body: Mapped[str] = mapped_column(String(150), nullable=False)  # e.g., 'Madukkarai Municipality'
    zone_or_ward: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    department_category: Mapped[str] = mapped_column(String(100), nullable=False)
    pio_designation: Mapped[str] = mapped_column(String(200), nullable=False)
    office_address: Mapped[str] = mapped_column(Text, nullable=False)
    pincode: Mapped[str] = mapped_column(String(10), nullable=False)
    online_supported: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        # Index for fast PIO lookups during user query processing
        Index("idx_pio_lookup", "district", "department_category", "pincode"),
    )



class RTITelemetryLog(Base):
    __tablename__ = "rti_telemetry_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    ward_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    department_category: Mapped[str] = mapped_column(String(100), nullable=False)
    rejection_risk_score: Mapped[str] = mapped_column(
        String(20), default="LOW", nullable=False
    ) 
    sec_2f_auto_fixed_count: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(50), default="FILED", nullable=False
    )
    statutory_deadline_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=get_default_statutory_deadline,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        
        Index("idx_telemetry_district_ward", "district", "ward_name"),
        
        Index("idx_telemetry_status_deadline", "status", "statutory_deadline_date"),
    )

Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

