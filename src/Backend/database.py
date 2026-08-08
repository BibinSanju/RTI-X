from sqlalchemy import create_engine, String, Boolean, Integer, Text, DateTime, Index, func, ForeignKey
from dotenv import load_dotenv
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session, sessionmaker, relationship

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

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    contact_method: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. email, phone, push
    contact_value: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    complaints: Mapped[list["Complaint"]] = relationship("Complaint", back_populates="user")


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    ward_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    department_category: Mapped[str] = mapped_column(String(100), nullable=False)
    
    status: Mapped[str] = mapped_column(
        String(50), default="PENDING_CALL_CONFIRMATION", nullable=False
    )
    
    # Track Notifications and Deadlines
    last_notified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    notification_retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    local_resolution_deadline: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    statutory_deadline_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    rejection_risk_score: Mapped[str] = mapped_column(
        String(20), default="LOW", nullable=False
    )
    sec_2f_auto_fixed_count: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="complaints")

    __table_args__ = (
        Index("idx_complaints_district_ward", "district", "ward_name"),
        Index("idx_complaints_status", "status"),
    )


class PIODirectory(Base):
    __tablename__ = "pio_directory"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    local_body: Mapped[str] = mapped_column(String(150), nullable=False)
    zone_or_ward: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    department_category: Mapped[str] = mapped_column(String(100), nullable=False)
    pio_designation: Mapped[str] = mapped_column(String(200), nullable=False)
    office_address: Mapped[str] = mapped_column(Text, nullable=False)
    pincode: Mapped[str] = mapped_column(String(10), nullable=False)
    helpline_phone_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    online_supported: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        Index("idx_pio_lookup", "district", "department_category", "pincode"),
    )

class EmergencyHelpline(Base):
    __tablename__ = "emergency_helplines"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    authority_name: Mapped[str] = mapped_column(String(100), nullable=False)
    department_category: Mapped[str] = mapped_column(String(100), nullable=False)
    zone_or_ward: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    contact_title: Mapped[str] = mapped_column(String(150), nullable=False)
    contact_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    contact_type: Mapped[str] = mapped_column(String(50), nullable=False)
    contact_value: Mapped[str] = mapped_column(String(50), nullable=False)
    
    source_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        Index("idx_emergency_lookup", "authority_name", "department_category", "zone_or_ward"),
    )

Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
