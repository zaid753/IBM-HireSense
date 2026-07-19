from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Any, Dict, List

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_active_user
from app.models.recruiter import Recruiter
from app.services.analytics.engine import AnalyticsEngine

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
):
    """Get complete dashboard overview with KPIs and Insights."""
    engine = AnalyticsEngine(db, current_user.id)
    return {
        "kpis": engine.get_kpis(),
        "insights": engine.get_ai_insights()
    }

@router.get("/kpi")
def get_kpis(
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
):
    """Get high-level KPIs."""
    engine = AnalyticsEngine(db, current_user.id)
    return engine.get_kpis()

@router.get("/charts")
def get_charts_data(
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
):
    """Get aggregated data for all charts."""
    engine = AnalyticsEngine(db, current_user.id)
    return {
        "monthly_applications": engine.get_monthly_applications(),
        "candidate_status": engine.get_candidate_status(),
        "skills_distribution": engine.get_skills_distribution()
    }

@router.get("/funnel")
def get_funnel_data(
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
):
    """Get hiring funnel drop-off metrics."""
    engine = AnalyticsEngine(db, current_user.id)
    return engine.get_funnel()

@router.get("/skills")
def get_skills_analytics(
    db: Session = Depends(get_db),
    current_user: Recruiter = Depends(get_current_active_user),
):
    """Get detailed skills analytics."""
    engine = AnalyticsEngine(db, current_user.id)
    return engine.get_skills_distribution()
