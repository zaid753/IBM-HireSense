from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class InterviewCreate(BaseModel):
    scheduled_time: datetime
    duration_minutes: int = 60
    meeting_link: Optional[str] = None
    notes: Optional[str] = None

class InterviewOut(BaseModel):
    id: int
    candidate_id: int
    recruiter_id: Optional[int]
    scheduled_time: datetime
    duration_minutes: int
    meeting_link: Optional[str]
    status: str
    notes: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
