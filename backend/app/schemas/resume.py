from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime

class ResumeBase(BaseModel):
    original_filename: str

class ResumeCreate(ResumeBase):
    stored_filename: str

class ResumeOut(ResumeBase):
    id: int
    recruiter_id: int
    stored_filename: str
    upload_date: datetime
    status: str

    model_config = ConfigDict(from_attributes=True)

class CandidateProfileBase(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None

class CandidateProfileUpdate(CandidateProfileBase):
    pass

class CandidateProfileOut(CandidateProfileBase):
    id: int
    resume_id: int

    model_config = ConfigDict(from_attributes=True)

class ATSResultOut(BaseModel):
    id: int
    resume_id: int
    job_id: int
    score: float
    explanation: Optional[str] = None
    matched_skills: Optional[Dict[str, Any]] = None
    missing_skills: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)
