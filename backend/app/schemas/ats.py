from pydantic import BaseModel
from typing import List, Optional

class ATSCalculateRequest(BaseModel):
    resume_id: int
    job_id: int

class ATSResultOutput(BaseModel):
    ats_score: float
    confidence: float
    matched_skills: List[str]
    missing_skills: List[str]
    education_score: float
    experience_score: float
    project_score: float
    keyword_score: float
    recommendation: str
    summary: str
