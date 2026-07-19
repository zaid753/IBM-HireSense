import os
import uuid
import shutil
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.resume import Resume
from app.repositories import resume as repo_resume
from app.schemas.resume import ResumeCreate

class ResumeService:
    @staticmethod
    def upload_resume(db: Session, file: UploadFile, recruiter_id: int) -> Resume:
        if not file.filename.endswith((".pdf", ".docx")):
            raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed.")
            
        # Check size (mocked by reading a small chunk or handled in route)
        # Actually in FastAPI, we can't easily check size before reading, usually done via middleware or starlette request.
        
        # Ensure upload dir exists
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        # Generate unique filename
        ext = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Create DB record
        obj_in = ResumeCreate(original_filename=file.filename, stored_filename=unique_filename)
        
        # Actually repo_resume.create expects a slightly different signature if recruiter_id is needed, 
        # but since we are mocking, we will just manually create the model to avoid schema mismatch for now
        db_obj = Resume(
            recruiter_id=recruiter_id,
            original_filename=obj_in.original_filename,
            stored_filename=obj_in.stored_filename
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        
        # Here we would normally trigger an async Celery task for AI parsing
        # For now, it stays "uploaded"
        
        return db_obj

resume_service = ResumeService()
