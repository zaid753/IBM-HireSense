from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_active_user
from app.models.recruiter import Recruiter
from app.schemas.ats import ATSCalculateRequest, ATSResultOutput
from app.models.resume import ATSResult, ResumeAnalysis, Resume
from app.models.job import JobDescription
from app.services.ats.calculator import calculate_ats_score

router = APIRouter()

@router.post("/calculate", response_model=ATSResultOutput)
def calculate_ats(
    request: ATSCalculateRequest,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Compare a parsed resume with a Job Description and calculate an explainable ATS Score."""
    # 1. Fetch Resume Analysis (Parsed JSON)
    analysis = db.query(ResumeAnalysis).join(Resume).filter(
        ResumeAnalysis.resume_id == request.resume_id,
        Resume.recruiter_id == current_user.id
    ).first()
    
    if not analysis or not analysis.parsed_json:
        raise HTTPException(status_code=400, detail="Resume not parsed yet or unauthorized. Please run the parsing engine first.")
        
    # 2. Fetch Job Description
    job = db.query(JobDescription).filter(JobDescription.id == request.job_id).first()
    if not job or job.recruiter_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job Description not found.")
        
    # 3. Run ATS Engine
    jd_text = f"{job.title}\n{job.description}"
    required_skills = job.required_skills if job.required_skills else None
    
    result = calculate_ats_score(analysis.parsed_json, jd_text, required_skills)
    
    # 4. Store in Database
    ats_record = db.query(ATSResult).filter(
        ATSResult.resume_id == request.resume_id,
        ATSResult.job_id == request.job_id
    ).first()
    
    if not ats_record:
        ats_record = ATSResult(resume_id=request.resume_id, job_id=request.job_id)
        db.add(ats_record)
        
    ats_record.score = result.ats_score
    ats_record.matched_skills = result.matched_skills
    ats_record.missing_skills = result.missing_skills
    
    # Store the entire complex output JSON in the explanation text for now 
    # (Since we didn't add a JSON metadata column to ATSResult)
    import json
    ats_record.explanation = json.dumps(result.model_dump())
    
    db.commit()
    db.refresh(ats_record)
    
    return result

@router.get("/{resume_id}", response_model=List[ATSResultOutput])
def get_ats_results(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Retrieve all ATS results for a specific resume."""
    import json
    
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.recruiter_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    records = db.query(ATSResult).filter(ATSResult.resume_id == resume_id).all()
    results = []
    for record in records:
        if record.explanation:
            try:
                data = json.loads(record.explanation)
                results.append(ATSResultOutput(**data))
            except Exception:
                pass
    return results
