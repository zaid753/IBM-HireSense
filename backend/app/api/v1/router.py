from fastapi import APIRouter, Depends
from app.api.v1.auth import router as auth_router
from app.api.v1.resume import router as resume_router
from app.api.v1.job import router as job_router
from app.api.v1.candidate import router as candidate_router
from app.api.v1.ats import router as ats_router
from app.api.v1.ranking import router as ranking_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.report import router as report_router
from app.api.v1.settings import router as settings_router
from app.api.v1.ai import router as ai_router
from app.api.v1.chat import router as chat_router
from app.dependencies.auth import get_current_active_user, get_current_admin_user

api_router = APIRouter()
api_router.include_router(auth_router.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(resume_router.router, prefix="/resume", tags=["Resumes"], dependencies=[Depends(get_current_active_user)])
api_router.include_router(job_router.router, prefix="/job", tags=["Jobs"], dependencies=[Depends(get_current_active_user)])
api_router.include_router(candidate_router.router, prefix="/candidate", tags=["Candidates"], dependencies=[Depends(get_current_active_user)])
api_router.include_router(ats_router.router, prefix="/ats", tags=["ATS Scoring"], dependencies=[Depends(get_current_active_user)])
api_router.include_router(ranking_router.router, prefix="/ranking", tags=["Ranking"], dependencies=[Depends(get_current_active_user)])
api_router.include_router(analytics_router.router, prefix="/analytics", tags=["Analytics"], dependencies=[Depends(get_current_active_user)])
api_router.include_router(report_router.router, prefix="/reports", tags=["Reports"], dependencies=[Depends(get_current_active_user)])
api_router.include_router(settings_router.router, prefix="/settings", tags=["Settings"], dependencies=[Depends(get_current_admin_user)])
api_router.include_router(ai_router.router, prefix="/ai", tags=["AI Intelligence"], dependencies=[Depends(get_current_active_user)])
api_router.include_router(chat_router.router, prefix="/chat", tags=["Real-time Collaboration"])
