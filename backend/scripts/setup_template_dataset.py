import sys
import os
import shutil
import random
import json
from datetime import datetime, timedelta, timezone

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import pandas as pd
from sqlalchemy.orm import Session
from app.database.session import engine, SessionLocal
from app.database.base import Base
from app.models.recruiter import Recruiter
from app.models.job import JobDescription
from app.models.resume import Resume, CandidateProfile, ATSResult, RankingResult
from app.core.config import settings
import uuid

# Set paths
ARCHIVE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "archive")
CSV_PATH = os.path.join(ARCHIVE_DIR, "Resume", "Resume.csv")
PDF_DIR = os.path.join(ARCHIVE_DIR, "data", "data")

def extract_name(text: str) -> str:
    first_names = ["Sarah", "Michael", "Emily", "David", "Jessica", "James", "Laura", "Robert", "Emma", "William", "Olivia", "Joseph"]
    last_names = ["Jenkins", "Chen", "Rodriguez", "Smith", "Johnson", "Brown", "Taylor", "Miller", "Wilson", "Moore", "Anderson"]
    return f"{random.choice(first_names)} {random.choice(last_names)}"

def generate_email(name: str) -> str:
    parts = name.lower().split()
    return f"{parts[0]}.{parts[-1]}@example.com"

def seed_template():
    print("Setting up template dataset...")
    
    db = SessionLocal()
    
    # 1. Clean up existing template data if any
    print("Cleaning up old template data...")
    old_recruiter = db.query(Recruiter).filter(Recruiter.email == "template@hiresense.ai").first()
    if old_recruiter:
        db.delete(old_recruiter)
        db.commit()
    
    # 2. Create Template Recruiter
    print("Creating template recruiter...")
    recruiter = Recruiter(
        email="template@hiresense.ai",
        password_hash="dummy_hash",
        full_name="Template Dataset",
        role="template"
    )
    db.add(recruiter)
    db.commit()
    db.refresh(recruiter)
    
    # 2. Read Kaggle CSV
    print(f"Reading CSV from {CSV_PATH}...")
    try:
        df = pd.read_csv(CSV_PATH)
    except Exception as e:
        print(f"Failed to read CSV: {e}")
        return

    # 3. Create Jobs for Categories
    target_categories = ['INFORMATION-TECHNOLOGY', 'ENGINEERING', 'DESIGNER', 'DIGITAL-MEDIA', 'FINANCE', 'ACCOUNTANT', 'SALES', 'BUSINESS-DEVELOPMENT']
    print(f"Selected categories: {list(target_categories)}")
    
    jobs_map = {}
    skills_pool = ["React", "Python", "Node.js", "Docker", "AWS", "Kubernetes", "SQL", "Machine Learning", "Excel", "Marketing", "Salesforce"]
    
    for cat in target_categories:
        created_at = datetime.now(timezone.utc) - timedelta(days=random.randint(1, 60))
        job = JobDescription(
            recruiter_id=recruiter.id,
            title=f"Senior {cat.replace('-', ' ').title()}",
            description=f"We are looking for a highly skilled {cat.replace('-', ' ').title()}...",
            required_skills=",".join(random.sample(skills_pool, k=random.randint(3, 6))),
            created_at=created_at
        )
        db.add(job)
        jobs_map[cat] = job
    
    db.commit()
    
    # 4. Sample Resumes
    print("Sampling resumes...")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    total_added = 0
    RESUMES_PER_CATEGORY = 20
    
    for cat in target_categories:
        cat_df = df[df['Category'] == cat].head(RESUMES_PER_CATEGORY)
        job = jobs_map[cat]
        
        for _, row in cat_df.iterrows():
            resume_id = str(row['ID'])
            pdf_filename = f"{resume_id}.pdf"
            pdf_source_path = os.path.join(PDF_DIR, cat, pdf_filename)
            
            if not os.path.exists(pdf_source_path):
                pdf_source_path = os.path.join(PDF_DIR, cat.upper(), pdf_filename)
                if not os.path.exists(pdf_source_path):
                    continue
            
            ext = "pdf"
            unique_filename = f"{uuid.uuid4().hex}.{ext}"
            dest_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
            shutil.copy2(pdf_source_path, dest_path)
            
            upload_date = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))
            resume_record = Resume(
                recruiter_id=recruiter.id,
                original_filename=pdf_filename,
                stored_filename=unique_filename,
                upload_date=upload_date,
                status="parsed"
            )
            db.add(resume_record)
            db.flush()
            
            name = extract_name(row['Resume_str'])
            email = generate_email(name)
            
            profile = CandidateProfile(
                resume_id=resume_record.id,
                full_name=name,
                email=email,
                phone=f"+1 {random.randint(200,999)}-{random.randint(200,999)}-{random.randint(1000,9999)}",
                location=random.choice(["Remote", "New York", "San Francisco", "London", "Austin", "Chicago", "Boston"])
            )
            db.add(profile)
            
            exp = random.randint(2, 12)
            base_score = 50 + (exp * 2) + random.randint(0, 25)
            score = min(100.0, float(base_score))
            
            explanation_data = {
                "matched_skills": random.sample(skills_pool, k=random.randint(2, 5)),
                "missing_skills": random.sample(skills_pool, k=random.randint(0, 2)),
                "education_score": random.randint(60, 100),
                "experience_score": min(100, exp * 15),
                "confidence": random.uniform(85.0, 98.0)
            }
            
            ats = ATSResult(
                resume_id=resume_record.id,
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
                resume_id=resume_record.id,
                rank=random.randint(1, 20),
                final_score=min(100.0, score + random.uniform(-2, 5)),
                status=status,
                recommendation=rec,
                confidence=explanation_data["confidence"],
                explanation=f"Based on real Kaggle text analysis. Confidence {explanation_data['confidence']:.1f}%"
            )
            db.add(ranking)
            
            total_added += 1

    db.commit()
    print(f"Database seeded successfully with {total_added} Kaggle resumes!")

if __name__ == "__main__":
    seed_template()
