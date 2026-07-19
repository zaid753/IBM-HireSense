import json
import random
from app.database.session import SessionLocal
from app.models.resume import Resume, ResumeAnalysis

def seed_resume_analysis():
    db = SessionLocal()
    resumes = db.query(Resume).all()
    
    for resume in resumes:
        # Check if analysis exists
        existing = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume.id).first()
        if existing:
            continue
            
        parsed_json = {
            "summary": "Experienced professional with a strong track record of success.",
            "skills": ["Python", "SQL", "Machine Learning", "Data Analysis", "Communication", "Leadership"],
            "experience": [
                {
                    "title": "Senior Professional",
                    "company": "Tech Corp",
                    "duration": "2020 - Present",
                    "description": "Led key initiatives resulting in 30% revenue growth and optimized internal processes."
                },
                {
                    "title": "Specialist",
                    "company": "Global Solutions Inc",
                    "duration": "2017 - 2020",
                    "description": "Managed cross-functional teams and delivered 5 major projects ahead of schedule."
                }
            ],
            "education": [
                {
                    "degree": "Bachelor of Science",
                    "institution": "University of Technology",
                    "graduation_year": "2016"
                }
            ]
        }
        
        analysis = ResumeAnalysis(
            resume_id=resume.id,
            parsed_json=parsed_json
        )
        db.add(analysis)
        
    db.commit()
    print("Seeded ResumeAnalysis for all resumes.")
    db.close()

if __name__ == "__main__":
    seed_resume_analysis()
