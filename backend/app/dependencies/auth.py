from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.dependencies.db import get_db
from app.models.recruiter import Recruiter
from app.repositories import recruiter as repo_recruiter
from app.core.firebase import verify_token
import secrets

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login" # Keeping it for Swagger UI even if we don't use it directly
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> Recruiter:
    decoded_token = verify_token(token)
    if not decoded_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate Firebase credentials",
        )
    
    email = decoded_token.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Firebase token missing email",
        )
    
    user = repo_recruiter.get_by_email(db, email=email)
    if not user:
        # Auto-create shadow user in Postgres
        from app.schemas.recruiter import RecruiterCreate
        from app.security.password import get_password_hash
        new_user = Recruiter(
            email=email,
            full_name=decoded_token.get("name") or email.split("@")[0],
            password_hash=get_password_hash(secrets.token_urlsafe(32)), # dummy random password
            role="recruiter"
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user = new_user
        
        try:
            from app.services.template import clone_dataset_for_user
            clone_dataset_for_user(db, user.id)
        except Exception as e:
            print(f"Failed to clone dataset for new user: {e}")
            
    return user

def get_current_active_user(
    current_user: Recruiter = Depends(get_current_user),
) -> Recruiter:
    return current_user

def get_current_admin_user(
    current_user: Recruiter = Depends(get_current_active_user),
) -> Recruiter:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="The user doesn't have enough privileges"
        )
    return current_user
