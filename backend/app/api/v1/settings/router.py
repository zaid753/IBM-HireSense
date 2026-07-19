from fastapi import APIRouter, Depends
from typing import Any, Dict
from pydantic import BaseModel
from app.dependencies.auth import get_current_active_user
from app.models.recruiter import Recruiter

router = APIRouter()

class SettingsUpdate(BaseModel):
    notifications_enabled: bool
    theme: str

@router.get("", response_model=Dict[str, Any])
def get_settings(
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Get user settings."""
    return {
        "notifications_enabled": True,
        "theme": "dark"
    }

@router.put("", response_model=Dict[str, Any])
def update_settings(
    settings_in: SettingsUpdate,
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Update user settings."""
    return settings_in.model_dump()
