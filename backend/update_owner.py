import os
import sys

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal
from app.models.recruiter import Recruiter
from app.models.job import JobDescription
from app.models.resume import Resume

def main():
    db = SessionLocal()
    if len(sys.argv) > 1:
        email = sys.argv[1]
        target_recruiter = db.query(Recruiter).filter(Recruiter.email == email).first()
    else:
        target_recruiter = db.query(Recruiter).order_by(Recruiter.id.desc()).first()
    
    if not target_recruiter:
        print("No matching recruiter found in the database.")
        return
        
    print(f"Updating data to belong to Recruiter ID: {target_recruiter.id} ({target_recruiter.full_name}, {target_recruiter.email})")
    
    # Update jobs
    jobs = db.query(JobDescription).all()
    for job in jobs:
        job.recruiter_id = target_recruiter.id
        
    # Update resumes
    resumes = db.query(Resume).all()
    for resume in resumes:
        resume.recruiter_id = target_recruiter.id
        
    db.commit()
    print(f"Updated {len(jobs)} jobs and {len(resumes)} resumes to belong to {target_recruiter.full_name}.")

if __name__ == '__main__':
    main()
