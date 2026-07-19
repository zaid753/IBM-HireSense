from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.base import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"))
    recruiter_id = Column(Integer, ForeignKey("recruiters.id", ondelete="SET NULL"), nullable=True)
    scheduled_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60)
    meeting_link = Column(String, nullable=True)
    status = Column(String, default="scheduled") # scheduled, completed, canceled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    candidate = relationship("Resume", backref="interviews")
    recruiter = relationship("Recruiter")
