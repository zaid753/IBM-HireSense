from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
import os
from app.core.config import settings
from sqlalchemy.orm import Session
from typing import Any, List

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_active_user
from app.models.recruiter import Recruiter
from app.schemas.resume import ResumeOut
from app.services.resume import resume_service
from app.repositories import resume as repo_resume

router = APIRouter()

@router.post("/upload", response_model=ResumeOut)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Upload a new resume. Must be PDF or DOCX."""
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
    ALLOWED_MIME_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and DOCX are allowed.")
    
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the 5MB limit.")

    return resume_service.upload_resume(db, file=file, recruiter_id=current_user.id)

@router.get("", response_model=List[ResumeOut])
def get_resumes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Retrieve all uploaded resumes for the current recruiter."""
    return db.query(Resume).filter(Resume.recruiter_id == current_user.id).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=ResumeOut)
def get_resume(
    id: int,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Get a specific resume by ID."""
    resume = repo_resume.get(db, id=id)
    if not resume or resume.recruiter_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.delete("/{id}")
def delete_resume(
    id: int,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Delete a resume."""
    resume = repo_resume.get(db, id=id)
    if not resume or resume.recruiter_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
    repo_resume.remove(db, id=id)
    return {"message": "Resume deleted successfully"}

@router.get("/download/{id}")
def download_resume(
    id: int,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
):
    """Download the original resume file."""
    resume = repo_resume.get(db, id=id)
    if not resume or resume.recruiter_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    file_path = os.path.join(settings.UPLOAD_DIR, resume.stored_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
        
    return FileResponse(path=file_path, filename=resume.original_filename)

@router.post("/parse/{id}", response_model=Any)
def parse_resume_endpoint(
    id: int,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Parse a resume using the Resume Intelligence Engine."""
    import os
    from app.core.config import settings
    from app.services.parsing.parser import parse_resume
    from app.models.resume import ResumeAnalysis
    
    resume = repo_resume.get(db, id=id)
    if not resume or resume.recruiter_id != current_user.id:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    file_path = os.path.join(settings.UPLOAD_DIR, resume.stored_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=400, detail="Stored resume file not found on disk.")
        
    # Run intelligence engine
    try:
        parsed_data = parse_resume(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")
        
    # Store in database
    analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == id).first()
    if not analysis:
        analysis = ResumeAnalysis(resume_id=id)
        db.add(analysis)
        
    analysis.parsed_json = parsed_data.model_dump()
    db.commit()
    db.refresh(analysis)
    
    return analysis.parsed_json

@router.get("/parsed/{id}", response_model=Any)
def get_parsed_resume(
    id: int,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Retrieve the parsed structured JSON for a resume."""
    from app.models.resume import ResumeAnalysis, Resume
    analysis = db.query(ResumeAnalysis).join(Resume).filter(
        ResumeAnalysis.resume_id == id,
        Resume.recruiter_id == current_user.id
    ).first()
    
    if not analysis or not analysis.parsed_json:
        raise HTTPException(status_code=404, detail="Parsed data not found. Please parse the resume first.")
        
    return analysis.parsed_json

