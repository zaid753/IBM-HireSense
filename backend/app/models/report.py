from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.base import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("recruiters.id", ondelete="CASCADE"), nullable=False)
    report_name = Column(String, nullable=False)
    report_type = Column(String, nullable=False)
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    recruiter = relationship("Recruiter", back_populates="reports")
