import sys
import os

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from app.database.session import SessionLocal
from app.models.recruiter import Recruiter
from app.services.template import clone_dataset_for_user

def main():
    db = SessionLocal()
    recruiters = db.query(Recruiter).filter(Recruiter.role != "template").all()
    
    print(f"Found {len(recruiters)} existing recruiters.")
    for recruiter in recruiters:
        print(f"Cloning dataset for recruiter {recruiter.id} ({recruiter.email})...")
        try:
            clone_dataset_for_user(db, recruiter.id)
        except Exception as e:
            print(f"Error cloning for {recruiter.email}: {e}")
            
    print("Migration complete!")

if __name__ == "__main__":
    main()
