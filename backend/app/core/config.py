import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "HireSense AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 11520 # 8 days
    
    DATABASE_URL: str
    
    UPLOAD_DIR: str = "uploads/resumes"
    MAX_UPLOAD_SIZE: int = 10485760 # 10 MB

    GEMINI_API_KEY: str | None = None

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
