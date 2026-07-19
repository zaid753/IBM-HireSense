from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import Any, List
import io
import csv

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_active_user
from app.models.recruiter import Recruiter
from app.schemas.ranking import RankingGenerateRequest, RankingListResponse, RankedCandidateSchema
from app.models.resume import RankingResult, ATSResult, Resume, CandidateProfile
from app.models.job import JobDescription
from app.services.ranking.engine import ranking_engine

router = APIRouter()

@router.post("/generate")
def generate_ranking(
    request: RankingGenerateRequest,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Trigger ranking generation for a specific job."""
    job = db.query(JobDescription).filter(JobDescription.id == request.job_id).first()
    if not job or job.recruiter_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job Description not found.")
        
    success = ranking_engine.generate_rankings(db, request.job_id)
    if not success:
        raise HTTPException(status_code=400, detail="No ATS results found to rank.")
        
    return {"message": "Ranking generated successfully."}

@router.get("/{job_id}", response_model=RankingListResponse)
def get_rankings(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
) -> Any:
    """Retrieve ranked candidate leaderboard for a specific job."""
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job or job.recruiter_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job not found")

    records = db.query(RankingResult).filter(RankingResult.job_id == job_id).order_by(RankingResult.rank.asc()).all()
    
    if not records:
        return RankingListResponse(job_id=job_id, total_candidates=0, rankings=[])
        
    rankings = []
    top_candidate = None
    
    for record in records:
        resume = db.query(Resume).filter(Resume.id == record.resume_id).first()
        profile = db.query(CandidateProfile).filter(CandidateProfile.resume_id == record.resume_id).first()
        ats = db.query(ATSResult).filter(ATSResult.resume_id == record.resume_id, ATSResult.job_id == job_id).first()
        
        name = profile.full_name if profile and profile.full_name else f"Candidate {record.resume_id}"
        if record.rank == 1:
            top_candidate = name
            
        rankings.append(RankedCandidateSchema(
            rank=record.rank,
            name=name,
            ats_score=ats.score if ats else 0.0,
            final_score=record.final_score,
            status=record.status,
            recommendation=record.recommendation,
            confidence=record.confidence if record.confidence else 0.0,
            explanation=record.explanation,
            resume_id=record.resume_id
        ))
        
    return RankingListResponse(
        job_id=job_id,
        total_candidates=len(rankings),
        top_candidate=top_candidate,
        rankings=rankings
    )

@router.get("/export/{job_id}/csv")
def export_ranking_csv(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
):
    """Export ranked candidates as CSV."""
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job or job.recruiter_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job not found")

    records = db.query(RankingResult).filter(RankingResult.job_id == job_id).order_by(RankingResult.rank.asc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Rank", "Candidate Name", "Final Score", "ATS Score", "Status", "Recommendation"])
    
    for record in records:
        profile = db.query(CandidateProfile).filter(CandidateProfile.resume_id == record.resume_id).first()
        ats = db.query(ATSResult).filter(ATSResult.resume_id == record.resume_id, ATSResult.job_id == job_id).first()
        name = profile.full_name if profile and profile.full_name else f"Candidate {record.resume_id}"
        writer.writerow([record.rank, name, record.final_score, ats.score if ats else 0, record.status, record.recommendation])
        
    response = Response(content=output.getvalue())
    response.headers["Content-Disposition"] = f"attachment; filename=rankings_job_{job_id}.csv"
    response.headers["Content-Type"] = "text/csv"
    return response

@router.get("/export/{job_id}/pdf")
def export_ranking_pdf(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
):
    """Export ranked candidates as PDF."""
    from fpdf import FPDF
    
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job or job.recruiter_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job not found")

    records = db.query(RankingResult).filter(RankingResult.job_id == job_id).order_by(RankingResult.rank.asc()).all()
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt=f"Candidate Rankings for Job ID {job_id}", ln=True, align='C')
    
    for record in records:
        profile = db.query(CandidateProfile).filter(CandidateProfile.resume_id == record.resume_id).first()
        name = profile.full_name if profile and profile.full_name else f"Candidate {record.resume_id}"
        pdf.cell(200, 10, txt=f"{record.rank}. {name} | Score: {record.final_score} | Status: {record.status}", ln=True)
        
    # Convert PDF to bytes
    pdf_bytes = pdf.output(dest='S').encode('latin-1') 
    
    response = Response(content=pdf_bytes)
    response.headers["Content-Disposition"] = f"attachment; filename=rankings_job_{job_id}.pdf"
    response.headers["Content-Type"] = "application/pdf"
    return response
