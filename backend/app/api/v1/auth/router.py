from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any
from sqlalchemy.orm import Session
from app.dependencies.auth import get_current_active_user
from app.dependencies.db import get_db
from app.schemas.recruiter import RecruiterOut, RecruiterUpdate
from app.models.recruiter import Recruiter

router = APIRouter()

@router.get("/me", response_model=RecruiterOut)
def read_current_user(
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Get current user."""
    return current_user

@router.put("/me", response_model=RecruiterOut)
def update_current_user(
    recruiter_in: RecruiterUpdate,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Update current user profile."""
    if recruiter_in.full_name is not None:
        current_user.full_name = recruiter_in.full_name
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/logout")
def logout() -> Any:
    """Logout current user (client side usually destroys token, but can be managed via blacklist)."""
    return {"message": "Successfully logged out"}
