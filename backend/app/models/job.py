from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.base import Base

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("recruiters.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(Text) # Stored as JSON or comma-separated
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    recruiter = relationship("Recruiter", back_populates="jobs")
    ats_results = relationship("ATSResult", back_populates="job", cascade="all, delete-orphan")
    ranking_results = relationship("RankingResult", back_populates="job", cascade="all, delete-orphan")
