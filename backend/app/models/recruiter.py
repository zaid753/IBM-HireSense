from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.base import Base

class Recruiter(Base):
    __tablename__ = "recruiters"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="recruiter") # "admin" or "recruiter"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    jobs = relationship("JobDescription", back_populates="recruiter", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="recruiter", cascade="all, delete-orphan")
    analytics = relationship("Analytics", back_populates="recruiter", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="recruiter", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="recruiter", cascade="all, delete-orphan")
