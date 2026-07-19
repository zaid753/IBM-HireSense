from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.recruiter import Recruiter
from app.schemas.recruiter import RecruiterCreate, RecruiterUpdate
from app.security.password import get_password_hash

class RepositoryRecruiter(BaseRepository[Recruiter, RecruiterCreate, RecruiterUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[Recruiter]:
        return db.query(Recruiter).filter(Recruiter.email == email).first()

    def create(self, db: Session, *, obj_in: RecruiterCreate) -> Recruiter:
        db_obj = Recruiter(
            email=obj_in.email,
            full_name=obj_in.full_name,
            password_hash=get_password_hash(obj_in.password),
            role="recruiter"
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

recruiter = RepositoryRecruiter(Recruiter)
