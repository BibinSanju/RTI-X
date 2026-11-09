from sqlalchemy import create_engine, String, Boolean, Integer, Text, DateTime, Index, func, ForeignKey
from dotenv import load_dotenv
import os
import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session, sessionmaker, relationship

load_dotenv()

# ── Platform-independent GUID Type (compatible with SQLite and PostgreSQL) ────
class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's native UUID type if on Postgres; otherwise uses CHAR(36).
    """
    impl = CHAR(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if not isinstance(value, uuid.UUID):
            return uuid.UUID(str(value))
        return value

# ── Database Engine Selection (Local SQLite by default for standalone run) ───
USE_LOCAL_DB = os.getenv("USE_LOCAL_DB", "true").lower() in ("true", "1", "yes")

# Look for explicit DATABASE_URL, or build PostgreSQL URL if provided
USER = os.getenv("user") or os.getenv("USER") or os.getenv("DB_USER")
HOST = os.getenv("host") or os.getenv("HOST") or os.getenv("DB_HOST")
PORT = os.getenv("port") or os.getenv("PORT") or os.getenv("DB_PORT") or "5432"
DBNAME = os.getenv("dbname") or os.getenv("DBNAME") or os.getenv("DB_NAME") or "postgres"
PASSWORD = os.getenv("password") or os.getenv("PASSWORD") or os.getenv("DB_PASSWORD") or ""

db_file = os.path.join(os.path.dirname(__file__), "local_rti.db")

if not USE_LOCAL_DB and USER and HOST:
    DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            print("Connected to remote PostgreSQL database successfully!")
    except Exception as e:
        print(f"Warning: PostgreSQL connection failed ({e}). Falling back to local SQLite database.")
        DATABASE_URL = f"sqlite:///{db_file}"
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    DATABASE_URL = f"sqlite:///{db_file}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    print(f"Using local standalone SQLite database: {db_file}")

class Base(DeclarativeBase):
    pass

def get_default_statutory_deadline() -> datetime:
    """Calculates the statutory 30-day RTI response deadline."""
    return datetime.now(timezone.utc) + timedelta(days=30)

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4
    )
    contact_method: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. email, phone, push
    contact_value: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    
    # First stage details
    name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Second stage (RTI) details
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    pincode: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    country: Mapped[str] = mapped_column(String(50), default="India")
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status_rural_urban: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    educational_status: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    citizenship: Mapped[str] = mapped_column(String(50), default="Indian")
    is_bpl: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    complaints: Mapped[list["Complaint"]] = relationship("Complaint", back_populates="user")


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id"), nullable=False
    )
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    ward_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    department_category: Mapped[str] = mapped_column(String(100), nullable=False)
    problem_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
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

    id: Mapped[str] = mapped_column(
        String(100), primary_key=True
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
        GUID, primary_key=True, default=uuid.uuid4
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

# ── Auto-create tables ────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ── Automatic Seeding for Local Offline Database ─────────────────────────────
def seed_local_database():
    """Seeds PIO directory and Emergency Helplines if empty."""
    db = SessionLocal()
    try:
        # 1. Seed Helplines
        helpline_count = db.query(EmergencyHelpline).count()
        if helpline_count == 0:
            helpline_json = os.path.join(os.path.dirname(__file__), "..", "data", "emergency_helplines.json")
            if os.path.exists(helpline_json):
                with open(helpline_json, "r", encoding="utf-8") as f:
                    entries = json.load(f)
                for item in entries:
                    h = EmergencyHelpline(
                        id=uuid.uuid4(),
                        authority_name=item["authority_name"],
                        department_category=item["department_category"],
                        zone_or_ward=item.get("zone_or_ward"),
                        contact_title=item["contact_title"],
                        contact_name=item.get("contact_name"),
                        contact_type=item["contact_type"],
                        contact_value=item["contact_value"],
                        source_url=item.get("source_url")
                    )
                    db.add(h)
                db.commit()
                print(f"Successfully seeded {len(entries)} Emergency Helplines into local database!")

        # 2. Seed PIODirectory
        pio_count = db.query(PIODirectory).count()
        if pio_count == 0:
            pio_json = os.path.join(os.path.dirname(__file__), "..", "data", "pios.json")
            if os.path.exists(pio_json):
                with open(pio_json, "r", encoding="utf-8") as f:
                    entries = json.load(f)
                for item in entries:
                    p = PIODirectory(
                        id=item["id"],
                        district=item["district"],
                        local_body=item["local_body"],
                        zone_or_ward=item.get("zone_or_ward"),
                        department_category=item["department_category"],
                        pio_designation=item["pio_designation"],
                        office_address=item["office_address"],
                        pincode=item["pincode"],
                        helpline_phone_number=item.get("helpline_phone_number"),
                        online_supported=item.get("online_supported", False)
                    )
                    db.add(p)
                db.commit()
                print(f"Successfully seeded {len(entries)} PIO Directory entries into local database!")

        # 3. Ensure Default Demo User exists
        demo_user_id = uuid.UUID("00000000-0000-0000-0000-000000000000")
        demo_user = db.query(User).filter(User.id == demo_user_id).first()
        if not demo_user:
            demo_user = User(
                id=demo_user_id,
                contact_method="EMAIL",
                contact_value="citizen.demo@example.com",
                name="Murugan K.",
                phone_number="+91 98421 54321",
                address="14/2B, Anna Nagar Main Road, Gandhipuram, Ward 24, Coimbatore",
                pincode="641012"
            )
            db.add(demo_user)
            db.commit()
            print("Successfully initialized default demo citizen user!")

    except Exception as e:
        print(f"Notice during seeding: {e}")
        db.rollback()
    finally:
        db.close()

# Run seed on import
seed_local_database()
