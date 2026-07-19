from sqlalchemy.orm import Session
from app.repositories import recruiter as repo_recruiter
from app.security.password import verify_password
from app.models.recruiter import Recruiter

class AuthService:
    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> Recruiter | None:
        user = repo_recruiter.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

auth_service = AuthService()
