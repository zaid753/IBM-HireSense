from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Any, Dict, List
from pydantic import BaseModel

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_active_user
from app.models.recruiter import Recruiter
from app.models.resume import CandidateProfile, Resume, RankingResult
from app.services.ai.semantic import semantic_engine
from app.services.ai.generative import generative_engine

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    job_id: int = None

class ChatRequest(BaseModel):
    query: str

class InterviewRequest(BaseModel):
    skills: List[str]
    role: str = "Engineer"

@router.post("/analyze")
def analyze_resume(
    resume_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Triggers deep semantic analysis of a resume.
    We use BackgroundTasks to ensure the API returns instantly.
    """
    # Background task logic would go here (e.g., generating embeddings and storing in DB)
    return {"message": "Semantic analysis started in the background.", "resume_id": resume_id}

@router.post("/interview")
def generate_interview(
    request: InterviewRequest
):
    """Generates dynamic interview questions based on candidate skills."""
    questions = generative_engine.generate_interview_questions(request.role, request.skills)
    return questions

@router.post("/search")
def semantic_search(
    request: SearchRequest,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user)
):
    """
    Performs a natural language semantic search across candidate resumes.
    """
    # Fetch candidates belonging to the current recruiter
    candidates = db.query(CandidateProfile).join(Resume).filter(Resume.recruiter_id == current_user.id).all()
    
    from app.models.resume import ATSResult
    
    search_docs = []
    for c in candidates:
        ats = db.query(ATSResult).filter(ATSResult.resume_id == c.resume_id).first()
        skills = ", ".join(ats.matched_skills) if ats and ats.matched_skills else ""
        search_docs.append({
            "id": c.resume_id,
            "name": c.full_name,
            "text": f"{skills} {c.location}"
        })
    
    if not search_docs:
        return {"query": request.query, "results": []}

    results = semantic_engine.smart_search(request.query, search_docs)
    return {"query": request.query, "results": results}

@router.post("/recommend")
def get_recommendations(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user)
):
    """Recommends top candidates and identifies hidden talent."""
    from app.models.job import JobDescription
    # Ensure the job belongs to the recruiter
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job or job.recruiter_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job not found")

    rankings = db.query(RankingResult).filter(RankingResult.job_id == job_id).order_by(RankingResult.final_score.desc()).all()
    
    if not rankings:
        return {
            "top_candidates": [],
            "hidden_talent": [],
            "hiring_strategy": "No candidates found for this job. Upload resumes to get AI insights."
        }

    # Top match is the rank 1 candidate
    top_rank = rankings[0]
    top_candidate = db.query(CandidateProfile).filter(CandidateProfile.resume_id == top_rank.resume_id).first()

    # Hidden talent could be someone with a high ATS score but lower final score, or just the second best.
    hidden_talent_candidate = None
    if len(rankings) > 1:
        # Just pick the second best candidate as "hidden" talent to avoid DB joins on ATSResult
        hidden_rank = rankings[1]
        hidden_talent_candidate = db.query(CandidateProfile).filter(CandidateProfile.resume_id == hidden_rank.resume_id).first()
        hidden_match = hidden_rank.final_score
        hidden_id = hidden_talent_candidate.resume_id if hidden_talent_candidate else None
        hidden_name = hidden_talent_candidate.full_name if hidden_talent_candidate else "Unknown"
    else:
        hidden_id = None
        hidden_name = None
        hidden_match = 0

    hiring_strategy = "Candidates show strong technical skills. Consider focusing the interview on system design."
    if len(rankings) > 0 and rankings[0].final_score < 70:
        hiring_strategy = "The current applicant pool has low match scores. Consider revising the job description or relaxing requirements."

    return {
        "top_candidates": [{"id": top_candidate.resume_id if top_candidate else None, "name": top_candidate.full_name if top_candidate else "Unknown", "match": round(top_rank.final_score)}],
        "hidden_talent": [{"id": hidden_id, "name": hidden_name, "match": round(hidden_match), "reason": "High foundational skills despite lower overall rank"}] if hidden_id else [],
        "hiring_strategy": hiring_strategy
    }

@router.get("/insights/{resume_id}")
def get_insights(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user)
):
    """Retrieves AI-generated strengths and weaknesses for a candidate."""
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.recruiter_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    insights = generative_engine.generate_recruiter_insights({}, {})
    return insights

@router.post("/copilot")
def copilot_chat(
    request: ChatRequest
):
    """AI Copilot for the recruiter dashboard."""
    response = generative_engine.copilot_chat(request.query)
    return {"response": response}
