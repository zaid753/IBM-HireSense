from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_active_user
from app.models.recruiter import Recruiter
from app.schemas.job import JobDescriptionCreate, JobDescriptionUpdate, JobDescriptionOut
from app.repositories import job as repo_job
from app.models.job import JobDescription

router = APIRouter()

@router.post("", response_model=JobDescriptionOut)
def create_job(
    *,
    db: Session = Depends(get_db),
    job_in: JobDescriptionCreate,
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Create a new job description."""
    db_obj = JobDescription(
        recruiter_id=current_user.id,
        title=job_in.title,
        description=job_in.description,
        required_skills=job_in.required_skills
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("", response_model=List[JobDescriptionOut])
def get_jobs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Retrieve all jobs."""
    jobs = db.query(JobDescription).filter(JobDescription.recruiter_id == current_user.id).offset(skip).limit(limit).all()
    
    # Auto-seed default tech jobs if the user has none
    if not jobs and skip == 0:
        default_jobs = [
            {
                "title": "Senior Frontend Engineer",
                "description": "Looking for an expert React developer to build modern, scalable web applications with smooth UI/UX.",
                "required_skills": ["React", "TypeScript", "Tailwind CSS", "Next.js", "Framer Motion"]
            },
            {
                "title": "Backend Software Engineer",
                "description": "Seeking a backend engineer experienced in Python, FastAPI, and scalable microservices architectures.",
                "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"]
            },
            {
                "title": "Full Stack Developer",
                "description": "We need a versatile developer to own features end-to-end across the frontend and backend.",
                "required_skills": ["JavaScript", "Node.js", "React", "MongoDB", "Express"]
            },
            {
                "title": "Machine Learning Engineer",
                "description": "Join our AI team to build and deploy advanced language models and computer vision systems.",
                "required_skills": ["Python", "PyTorch", "TensorFlow", "NLP", "Machine Learning"]
            }
        ]
        
        for dj in default_jobs:
            job = JobDescription(
                recruiter_id=current_user.id,
                title=dj["title"],
                description=dj["description"],
                required_skills=",".join(dj["required_skills"])
            )
            db.add(job)
            
        db.commit()
        jobs = db.query(JobDescription).filter(JobDescription.recruiter_id == current_user.id).offset(skip).limit(limit).all()
        
    return jobs

@router.get("/{id}", response_model=JobDescriptionOut)
def get_job(
    id: int,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Get a specific job."""
    job = repo_job.get(db, id=id)
    if not job or job.recruiter_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.put("/{id}", response_model=JobDescriptionOut)
def update_job(
    *,
    id: int,
    db: Session = Depends(get_db),
    job_in: JobDescriptionUpdate,
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Update a job description."""
    job = repo_job.get(db, id=id)
    if not job or job.recruiter_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job not found")
    return repo_job.update(db, db_obj=job, obj_in=job_in)

@router.delete("/{id}")
def delete_job(
    id: int,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Delete a job."""
    job = repo_job.get(db, id=id)
    if not job or job.recruiter_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job not found")
    repo_job.remove(db, id=id)
    return {"message": "Job deleted successfully"}
