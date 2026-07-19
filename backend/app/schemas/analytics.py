from pydantic import BaseModel, ConfigDict
from datetime import datetime

class AnalyticsOut(BaseModel):
    id: int
    recruiter_id: int
    total_candidates: int
    shortlisted: int
    rejected: int

    model_config = ConfigDict(from_attributes=True)

class ReportBase(BaseModel):
    report_name: str
    report_type: str

class ReportCreate(ReportBase):
    pass

class ReportOut(ReportBase):
    id: int
    recruiter_id: int
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)
