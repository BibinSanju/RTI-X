from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
import uuid

# User Models
class UserCreate(BaseModel):
    contact_method: str
    contact_value: str

class UserResponse(BaseModel):
    id: uuid.UUID
    contact_method: str
    contact_value: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Complaint Models
class ComplaintCreate(BaseModel):
    user_id: uuid.UUID
    district: str
    ward_name: Optional[str] = None
    department_category: str
    rejection_risk_score: str = "LOW"

class ComplaintUpdateStatus(BaseModel):
    status: str

class ComplaintResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    district: str
    ward_name: Optional[str] = None
    department_category: str
    status: str
    last_notified_at: Optional[datetime] = None
    notification_retry_count: int
    local_resolution_deadline: Optional[datetime] = None
    statutory_deadline_date: Optional[datetime] = None
    rejection_risk_score: str
    sec_2f_auto_fixed_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# PIO Directory Models
class PIODirectoryCreate(BaseModel):
    district: str
    local_body: str
    zone_or_ward: Optional[str] = None
    department_category: str
    pio_designation: str
    office_address: str
    pincode: str
    helpline_phone_number: Optional[str] = None
    online_supported: bool = False

class PIODirectoryResponse(PIODirectoryCreate):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Emergency Helpline Models
class EmergencyHelplineCreate(BaseModel):
    authority_name: str
    department_category: str
    zone_or_ward: Optional[str] = None
    contact_title: str
    contact_name: Optional[str] = None
    contact_type: str
    contact_value: str
    source_url: Optional[str] = None
    verified_at: Optional[datetime] = None

class EmergencyHelplineResponse(EmergencyHelplineCreate):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# API Endpoint Request/Response Models
class ClassifyIntentRequest(BaseModel):
    grievance_text: str

class ClassifyIntentResponse(BaseModel):
    classification: str # "IMMEDIATE_CAUSE" or "DIRECT_RTI"
    department: str
    ward: Optional[str] = None
    extracted_entities: dict

class HelplineResolveRequest(BaseModel):
    district: str
    ward: Optional[str] = None
    department: str

class HelplineResolveResponse(BaseModel):
    contact_person: str
    helpline_number: str
    suggested_deadline_hours: int

class RTIDraftRequest(BaseModel):
    complaint_id: uuid.UUID
    user_description: str

class RTIDraftResponse(BaseModel):
    rti_text: str
    target_pio_designation: str
    target_pio_address: str

class AppealGenerateRequest(BaseModel):
    complaint_id: uuid.UUID

class AppealGenerateResponse(BaseModel):
    appeal_text: str