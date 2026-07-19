from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class RecruiterBase(BaseModel):
    email: EmailStr
    full_name: str

class RecruiterCreate(RecruiterBase):
    password: str

class RecruiterUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class RecruiterOut(RecruiterBase):
    id: int
    role: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
