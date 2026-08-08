from pydantic import BaseModel

class PIODirectoryCreate(BaseModel):
    district: str
    local_body: str
    zone_or_ward: str = None
    department_category: str
    pio_designation: str
    office_address: str
    pincode: str
    online_supported: bool = False


class RTITelemetryLogCreate(BaseModel):
    district: str
    ward_name: str = None
    department_category: str
    rejection_risk_score: str = "LOW"
    sec_2f_auto_fixed_count: int = 0
    status: str = "FILED"
    statutory_deadline_date: str