import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from sqlalchemy.sql import text

from app.core.security_middleware import SecurityHeadersMiddleware, limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.config import settings
from app.api.v1.router import api_router
from app.database.session import engine
from app.database.base import Base
from app.core.firebase import init_firebase

# Initialize Firebase Admin
init_firebase()

# Create all tables for SQLite (since we don't have Alembic migrations explicitly run in this minimal setup yet)
Base.metadata.create_all(bind=engine)

tags_metadata = [
    {"name": "Auth", "description": "Operations with users and authentication. Examples: Login, Register."},
    {"name": "Resume", "description": "Manage and parse resumes securely."},
    {"name": "Health", "description": "Advanced system health checks."},
    {"name": "Analytics", "description": "Platform analytics and metrics."},
]

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend APIs for HireSense AI. Features secure JWT authentication, rate limiting, and AI parsing.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    openapi_tags=tags_metadata
)
# Set up Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Set up Loguru for production
logger.add("logs/app.log", rotation="10 MB", level="INFO")
logger.add("logs/error.log", rotation="10 MB", level="ERROR")
logger.add("logs/auth.log", rotation="10 MB", filter=lambda record: "auth" in record["extra"])
logger.add("logs/perf.log", rotation="10 MB", filter=lambda record: "perf" in record["extra"])

# Security Headers
app.add_middleware(SecurityHeadersMiddleware)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"], # Explicit origins required when allow_credentials is True
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

# Global Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected error occurred. Please try again later."},
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
@limiter.limit("5/minute")
def health_check(request: Request):
    db_status = "ok"
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "error"

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "version": settings.VERSION,
        "database": db_status
    }

