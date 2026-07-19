from typing import Dict, Any, List
from app.services.ats.similarity import default_scorer
from app.services.ats.matchers import match_skills, match_education, match_experience, match_projects
from app.schemas.ats import ATSResultOutput

# Weight Distribution
WEIGHTS = {
    "skills": 0.40,
    "experience": 0.25,
    "education": 0.15,
    "projects": 0.10,
    "keywords": 0.10
}

def generate_recommendation(score: float) -> str:
    if score >= 85:
        return "Excellent Match"
    elif score >= 70:
        return "Good Match"
    elif score >= 50:
        return "Partial Match"
    else:
        return "Poor Match"

def calculate_ats_score(parsed_resume: Dict[str, Any], jd_text: str, required_skills: List[str] = None) -> ATSResultOutput:
    """Main Orchestrator for ATS Scoring Engine."""
    if required_skills is None:
        # Extract implied required skills from JD text if not provided explicitly
        import re
        # Dummy extraction for foundation
        required_skills = [s for s in ["python", "react", "fastapi", "aws", "sql", "docker", "machine learning"] if s.lower() in jd_text.lower()]
        if not required_skills:
            required_skills = ["communication", "teamwork"] # Fallback

    # 1. Similarity (Keyword Score)
    resume_text_dump = str(parsed_resume) # Dump whole JSON as string for keyword similarity
    keyword_score = default_scorer.calculate_similarity(resume_text_dump, jd_text)
    
    # 2. Skill Match
    skills_result = match_skills(parsed_resume.get("skills", {}), required_skills)
    skill_score = skills_result["score"]
    
    # 3. Education Match
    edu_score = match_education(parsed_resume.get("education", []), jd_text)
    
    # 4. Experience Match
    exp_score = match_experience(parsed_resume.get("experience", []), jd_text)
    
    # 5. Project Match
    proj_score = match_projects(parsed_resume.get("projects", []), jd_text)
    
    # 6. Weighted Total Score
    total_score = (
        (skill_score * WEIGHTS["skills"]) +
        (exp_score * WEIGHTS["experience"]) +
        (edu_score * WEIGHTS["education"]) +
        (proj_score * WEIGHTS["projects"]) +
        (keyword_score * WEIGHTS["keywords"])
    )
    
    # Calculate confidence based on data completeness
    confidence = 100.0
    if not parsed_resume.get("education"): confidence -= 10
    if not parsed_resume.get("experience"): confidence -= 15
    if not parsed_resume.get("skills"): confidence -= 20
    
    # 7. Generate Explanation Summary
    missing = skills_result["missing"]
    if missing:
        summary = f"Candidate matches many requirements but is missing key skills like {', '.join(missing[:3])}."
    elif total_score >= 80:
        summary = "Candidate strongly matches technical and educational requirements."
    else:
        summary = "Candidate lacks sufficient relevant experience or skills for this role."

    return ATSResultOutput(
        ats_score=round(total_score, 2),
        confidence=round(confidence, 2),
        matched_skills=skills_result["matched"],
        missing_skills=skills_result["missing"],
        education_score=round(edu_score, 2),
        experience_score=round(exp_score, 2),
        project_score=round(proj_score, 2),
        keyword_score=round(keyword_score, 2),
        recommendation=generate_recommendation(total_score),
        summary=summary
    )
