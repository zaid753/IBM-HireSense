from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.base import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("recruiters.id", ondelete="CASCADE"), nullable=False)
    original_filename = Column(String, nullable=False)
    stored_filename = Column(String, nullable=False, unique=True)
    upload_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String, default="uploaded") # e.g. uploaded, parsed, failed

    recruiter = relationship("Recruiter", back_populates="resumes")
    candidate_profile = relationship("CandidateProfile", back_populates="resume", uselist=False, cascade="all, delete-orphan")
    analysis = relationship("ResumeAnalysis", back_populates="resume", uselist=False, cascade="all, delete-orphan")
    ats_results = relationship("ATSResult", back_populates="resume", cascade="all, delete-orphan")
    ranking_results = relationship("RankingResult", back_populates="resume", cascade="all, delete-orphan")

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String, index=True)
    email = Column(String, index=True)
    phone = Column(String)
    location = Column(String)

    resume = relationship("Resume", back_populates="candidate_profile")

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), unique=True, nullable=False)
    parsed_json = Column(JSON) # Store structured parsed resume
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    resume = relationship("Resume", back_populates="analysis")

class ATSResult(Base):
    __tablename__ = "ats_results"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)
    explanation = Column(Text)
    matched_skills = Column(JSON)
    missing_skills = Column(JSON)

    resume = relationship("Resume", back_populates="ats_results")
    job = relationship("JobDescription", back_populates="ats_results")

class RankingResult(Base):
    __tablename__ = "ranking_results"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    rank = Column(Integer, nullable=False)
    final_score = Column(Float, nullable=False)
    status = Column(String)
    recommendation = Column(String)
    explanation = Column(Text)
    confidence = Column(Float)

    job = relationship("JobDescription", back_populates="ranking_results")
    resume = relationship("Resume", back_populates="ranking_results")
