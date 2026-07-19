import os
import random
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.database.base import Base
from app.models.recruiter import Recruiter
from app.models.job import JobDescription
from app.models.resume import Resume, CandidateProfile, ResumeAnalysis, ATSResult, RankingResult
from app.models.analytics import Analytics, ActivityLog
from app.models.notification import Notification

# Ensure fast seeding using Mock mode for semantic engine if needed
os.environ["MOCK_AI"] = "true"
from app.services.ai.semantic import semantic_engine

def seed_database():
    print("Wiping database for AI Phase 2.0...")
    db = SessionLocal()
    
    # Drop and recreate all tables
    Base.metadata.drop_all(bind=db.get_bind())
    Base.metadata.create_all(bind=db.get_bind())

    print("Creating recruiter...")
    recruiter = Recruiter(
        full_name="AI Administrator",
        email="admin@hiresense.ai",
        password_hash="mockhash", # For bypass
        role="admin"
    )
    db.add(recruiter)
    db.commit()
    db.refresh(recruiter)

    print("Creating 100 AI-Ready Jobs...")
    roles = [
        "Senior Backend Engineer", "Frontend React Developer", "Data Scientist", 
        "DevOps Engineer", "Cloud Architect", "Product Manager", "UI/UX Designer",
        "Machine Learning Engineer", "Security Analyst", "Full Stack Developer"
    ]
    
    jobs = []
    for i in range(100):
        role = random.choice(roles)
        job = JobDescription(
            recruiter_id=recruiter.id,
            title=f"{role} #{i+1}",
            description=f"Looking for an experienced {role} to join our fast-growing startup.",
            required_skills="Python, React, AWS, Docker, Kubernetes" if "Engineer" in role else "Figma, Sketch, Agile"
        )
        jobs.append(job)
    
    db.add_all(jobs)
    db.commit()

    print("Creating 1000 Candidates and AI Data (This might take a minute)...")
    names = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
    
    resumes = []
    profiles = []
    analyses = []
    ats_results = []
    rankings = []
    
    for i in range(1000):
        if i % 100 == 0:
            print(f"  Processed {i}/1000 resumes...")
            
        name = f"{random.choice(names)} {random.choice(last_names)}"
        
        resume = Resume(
            recruiter_id=recruiter.id,
            original_filename=f"{name.replace(' ', '_')}_Resume.pdf",
            stored_filename=f"ai_mock_{i}_{random.randint(1000, 9999)}.pdf",
            status="ranked"
        )
        resumes.append(resume)
        
    db.add_all(resumes)
    db.commit()

    # Now add associated records
    for i, resume in enumerate(resumes):
        # 2. Profile
        prof = CandidateProfile(
            resume_id=resume.id,
            full_name=f"{resume.original_filename.split('_')[0]} {resume.original_filename.split('_')[1]}",
            email=f"candidate{i}@example.com",
            phone="555-0199",
            location="Global"
        )
        profiles.append(prof)
        
        # 3. ATS
        job_id = random.randint(1, 100)
        score = random.uniform(50, 98)
        ats = ATSResult(
            resume_id=resume.id,
            job_id=job_id,
            score=score,
            matched_skills=["Python", "React"] if score > 70 else ["HTML"],
            missing_skills=["AWS", "Docker"] if score < 80 else []
        )
        ats_results.append(ats)
        
        # 4. Ranking (With Semantic Blending)
        semantic_score = semantic_engine.calculate_similarity("mock jd", ["mock resume"])[0] * 100
        final_score = (score * 0.6) + (semantic_score * 0.4)
        
        if final_score >= 85:
            status = "Excellent Match"
            rec = "Shortlist (YES)"
        elif final_score >= 70:
            status = "Strong Match"
            rec = "Shortlist (YES)"
        elif final_score >= 55:
            status = "Potential Match"
            rec = "Manual Review"
        else:
            status = "Not Suitable"
            rec = "Reject"
            
        ranking = RankingResult(
            resume_id=resume.id,
            job_id=job_id,
            rank=random.randint(1, 50),
            final_score=final_score,
            status=status,
            recommendation=rec,
            explanation=f"AI Semantic Engine generated match of {semantic_score:.1f}% blended with ATS of {score:.1f}%."
        )
        rankings.append(ranking)

    db.add_all(profiles)
    db.add_all(ats_results)
    db.add_all(rankings)
    db.commit()

    print("Creating AI Notifications...")
    notifications = [
        Notification(
            recruiter_id=recruiter.id,
            title="Semantic Analysis Complete",
            message="1000 resumes have been successfully vectorized and ranked.",
            notification_type="system"
        ),
        Notification(
            recruiter_id=recruiter.id,
            title="Hidden Talent Identified",
            message="Emma Davis is a 95% semantic match despite missing keyword filters.",
            notification_type="ai_insight"
        )
    ]
    db.add_all(notifications)
    db.commit()

    print(f"Database seeded successfully with {len(jobs)} jobs and {len(resumes)} candidates!")

if __name__ == "__main__":
    seed_database()
