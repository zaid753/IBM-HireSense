from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Any, List

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_active_user
from app.models.recruiter import Recruiter
from app.schemas.resume import CandidateProfileOut, CandidateProfileUpdate
from app.models.resume import CandidateProfile
from app.schemas.interview import InterviewCreate, InterviewOut
from app.models.interview import Interview
from app.services.email import email_service

router = APIRouter()

@router.get("", response_model=List[CandidateProfileOut])
def get_candidates(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Retrieve all candidate profiles."""
    from app.models.resume import Resume
    return db.query(CandidateProfile).join(Resume).filter(Resume.recruiter_id == current_user.id).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=CandidateProfileOut)
def get_candidate(
    id: int,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Get a specific candidate."""
    from app.models.resume import Resume
    candidate = db.query(CandidateProfile).join(Resume).filter(CandidateProfile.id == id, Resume.recruiter_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@router.put("/{id}", response_model=CandidateProfileOut)
def update_candidate(
    *,
    id: int,
    db: Session = Depends(get_db),
    candidate_in: CandidateProfileUpdate,
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Update a candidate."""
    from app.models.resume import Resume
    candidate = db.query(CandidateProfile).join(Resume).filter(CandidateProfile.id == id, Resume.recruiter_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    update_data = candidate_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(candidate, field, value)
        
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate

@router.delete("/{id}")
def delete_candidate(
    id: int,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Delete a candidate."""
    from app.models.resume import Resume
    candidate = db.query(CandidateProfile).join(Resume).filter(CandidateProfile.id == id, Resume.recruiter_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    db.delete(candidate)
    db.commit()
    return {"message": "Candidate deleted successfully"}

@router.post("/{id}/schedule", response_model=InterviewOut)
def schedule_interview(
    id: int,
    interview_in: InterviewCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Schedule an interview and send an email/calendar invite to the candidate."""
    from app.models.resume import Resume
    candidate = db.query(CandidateProfile).join(Resume).filter(CandidateProfile.id == id, Resume.recruiter_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    if not candidate.email:
        raise HTTPException(status_code=400, detail="Candidate profile does not have an email address")

    new_interview = Interview(
        candidate_id=id,
        recruiter_id=current_user.id,
        scheduled_time=interview_in.scheduled_time,
        duration_minutes=interview_in.duration_minutes,
        meeting_link=interview_in.meeting_link,
        notes=interview_in.notes
    )
    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)

    # Send email in background
    background_tasks.add_task(
        email_service.send_interview_invite,
        to_email=candidate.email,
        candidate_name=candidate.full_name or "Candidate",
        role="HireSense Position", # Ideally fetched from a linked Job, but hardcoded here for simplicity
        start_time=interview_in.scheduled_time,
        duration_minutes=interview_in.duration_minutes,
        meeting_link=interview_in.meeting_link or "No link provided",
    )

    return new_interview
