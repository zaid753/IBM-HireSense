from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class JobDescriptionBase(BaseModel):
    title: str
    description: str
    required_skills: Optional[str] = None

class JobDescriptionCreate(JobDescriptionBase):
    pass

class JobDescriptionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[str] = None

class JobDescriptionOut(JobDescriptionBase):
    id: int
    recruiter_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
