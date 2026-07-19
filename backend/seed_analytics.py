import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.database.session import engine, SessionLocal
from app.database.base import Base
from app.models.recruiter import Recruiter
from app.models.job import JobDescription
from app.models.resume import Resume, CandidateProfile, ATSResult, RankingResult
from app.security.password import get_password_hash
import json

def seed():
    print("Wiping database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # 1. Create Recruiter
    print("Creating recruiter...")
    recruiter = Recruiter(
        email="test@hiresense.ai",
        password_hash="dummy_hash",
        full_name="Test Recruiter"
    )
    db.add(recruiter)
    db.commit()
    db.refresh(recruiter)
    
    # 2. Create 50 Jobs
    print("Creating 50 Jobs...")
    roles = ["Frontend Engineer", "Backend Engineer", "Data Scientist", "Product Manager", "DevOps Engineer"]
    skills_pool = ["React", "Python", "Node.js", "Docker", "AWS", "Kubernetes", "SQL", "TypeScript", "Machine Learning"]
    jobs = []
    
    for i in range(50):
        created_at = datetime.now(timezone.utc) - timedelta(days=random.randint(1, 180))
        
        job = JobDescription(
            recruiter_id=recruiter.id,
            title=f"{random.choice(roles)} (Level {random.randint(1,4)})",
            description="We are looking for a highly skilled individual...",
            required_skills=",".join(random.sample(skills_pool, k=random.randint(3, 6))),
            created_at=created_at
        )
        db.add(job)
        jobs.append(job)
        
    db.commit()
    
    # 3. Create 500 Candidates
    print("Creating 500 Candidates and Analytics Data...")
    first_names = ["John", "Jane", "Alice", "Bob", "Charlie", "David", "Emma", "Frank", "Grace", "Henry"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez"]
    
    candidates = []
    for i in range(500):
        created_at = datetime.now(timezone.utc) - timedelta(days=random.randint(1, 180))
        resume = Resume(
            recruiter_id=recruiter.id,
            original_filename=f"candidate_{i}_resume.pdf",
            stored_filename=f"hash_{i}.pdf",
            upload_date=created_at,
            status="parsed"
        )
        db.add(resume)
        db.flush()
        
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        exp = random.randint(0, 10)
        
        profile = CandidateProfile(
            resume_id=resume.id,
            full_name=f"{fname} {lname}",
            email=f"{fname.lower()}.{lname.lower()}{i}@example.com",
            phone="123-456-7890",
            location=random.choice(["Remote", "New York", "San Francisco", "London", "Austin"])
        )
        db.add(profile)
        
        # Assign to 1-3 random jobs
        applied_jobs = random.sample(jobs, k=random.randint(1, 3))
        for job in applied_jobs:
            base_score = 40 + (exp * 3) + random.randint(0, 30)
            score = min(100.0, float(base_score))
            
            explanation_data = {
                "matched_skills": random.sample(skills_pool, k=random.randint(1, 5)),
                "missing_skills": random.sample(skills_pool, k=random.randint(0, 2)),
                "education_score": random.randint(50, 100),
                "experience_score": min(100, exp * 15),
                "confidence": random.uniform(85.0, 98.0)
            }
            
            ats = ATSResult(
                resume_id=resume.id,
                job_id=job.id,
                score=score,
                matched_skills=explanation_data["matched_skills"],
                missing_skills=explanation_data["missing_skills"],
                explanation=json.dumps(explanation_data)
            )
            db.add(ats)
            
            status = "Excellent Match" if score >= 90 else "Strong Match" if score >= 80 else "Potential Match" if score >= 70 else "Not Suitable"
            rec = "Shortlist (YES)" if score >= 80 else "Manual Review" if score >= 70 else "Reject"
            
            ranking = RankingResult(
                job_id=job.id,
                resume_id=resume.id,
                rank=random.randint(1, 20),
                final_score=min(100.0, score + random.uniform(-2, 5)),
                status=status,
                recommendation=rec,
                confidence=explanation_data["confidence"],
                explanation=f"Matches requirements. Confidence {explanation_data['confidence']:.1f}%"
            )
            db.add(ranking)
            
    db.commit()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed()
