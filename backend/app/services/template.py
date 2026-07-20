import shutil
import uuid
import os
from sqlalchemy.orm import Session
from app.models.recruiter import Recruiter
from app.models.job import JobDescription
from app.models.resume import Resume, CandidateProfile, ATSResult, RankingResult
from app.core.config import settings

def clone_dataset_for_user(db: Session, target_recruiter_id: int) -> bool:
    """Clones the template Kaggle dataset for a specific user.
    Deep copies Jobs, Resumes, Profiles, ATS Results, and Rankings."""
    
    # Fetch template recruiter
    template_recruiter = db.query(Recruiter).filter(Recruiter.email == "template@hiresense.ai").first()
    if not template_recruiter:
        print("Template recruiter not found. Please run scripts/setup_template_dataset.py first.")
        return False
        
    # Check if target already has Kaggle jobs (idempotency check)
    existing_jobs = db.query(JobDescription).filter(JobDescription.recruiter_id == target_recruiter_id, JobDescription.title.like("Senior %")).count()
    if existing_jobs >= 4:
        print(f"Recruiter {target_recruiter_id} already has dataset jobs. Skipping clone.")
        return True
        
    job_map = {}
    resume_map = {}
    
    # 1. Clone Jobs
    template_jobs = db.query(JobDescription).filter(JobDescription.recruiter_id == template_recruiter.id).all()
    for t_job in template_jobs:
        new_job = JobDescription(
            recruiter_id=target_recruiter_id,
            title=t_job.title,
            description=t_job.description,
            required_skills=t_job.required_skills,
            created_at=t_job.created_at
        )
        db.add(new_job)
        db.flush()
        job_map[t_job.id] = new_job.id
        
    # 2. Clone Resumes & Profiles
    template_resumes = db.query(Resume).filter(Resume.recruiter_id == template_recruiter.id).all()
    for t_res in template_resumes:
        # Copy file
        old_path = os.path.join(settings.UPLOAD_DIR, t_res.stored_filename)
        ext = t_res.stored_filename.split(".")[-1]
        new_filename = f"{uuid.uuid4().hex}.{ext}"
        new_path = os.path.join(settings.UPLOAD_DIR, new_filename)
        
        if os.path.exists(old_path):
            shutil.copy2(old_path, new_path)
            
        new_res = Resume(
            recruiter_id=target_recruiter_id,
            original_filename=t_res.original_filename,
            stored_filename=new_filename,
            upload_date=t_res.upload_date,
            status=t_res.status
        )
        db.add(new_res)
        db.flush()
        resume_map[t_res.id] = new_res.id
        
        # Clone CandidateProfile
        t_prof = db.query(CandidateProfile).filter(CandidateProfile.resume_id == t_res.id).first()
        if t_prof:
            new_prof = CandidateProfile(
                resume_id=new_res.id,
                full_name=t_prof.full_name,
                email=t_prof.email,
                phone=t_prof.phone,
                location=t_prof.location
            )
            db.add(new_prof)
            
        # Clone ATSResult
        t_ats_list = db.query(ATSResult).filter(ATSResult.resume_id == t_res.id).all()
        for t_ats in t_ats_list:
            new_ats = ATSResult(
                resume_id=new_res.id,
                job_id=job_map.get(t_ats.job_id, t_ats.job_id),
                score=t_ats.score,
                explanation=t_ats.explanation,
                matched_skills=t_ats.matched_skills,
                missing_skills=t_ats.missing_skills
            )
            db.add(new_ats)
            
        # Clone RankingResult
        t_rank_list = db.query(RankingResult).filter(RankingResult.resume_id == t_res.id).all()
        for t_rank in t_rank_list:
            new_rank = RankingResult(
                job_id=job_map.get(t_rank.job_id, t_rank.job_id),
                resume_id=new_res.id,
                rank=t_rank.rank,
                final_score=t_rank.final_score,
                status=t_rank.status,
                recommendation=t_rank.recommendation,
                explanation=t_rank.explanation,
                confidence=t_rank.confidence
            )
            db.add(new_rank)
            
    db.commit()
    print(f"Successfully cloned dataset for Recruiter {target_recruiter_id}!")
    return True
