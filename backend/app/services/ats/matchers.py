from typing import Dict, List, Any

def match_skills(candidate_skills: Dict[str, List[str]], jd_skills: List[str]) -> Dict[str, Any]:
    """
    Compares candidate skills against job description required skills.
    In a real scenario, jd_skills would be extracted from the JD.
    For this foundation, we simulate required skills based on JD text if not provided explicitly.
    """
    # Flatten candidate skills
    all_candidate_skills = []
    if candidate_skills:
        for category, skills in candidate_skills.items():
            if skills:
                all_candidate_skills.extend([s.lower() for s in skills])
                
    # Normalize JD skills
    jd_skills_lower = [s.lower() for s in jd_skills]
    
    matched = list(set(all_candidate_skills) & set(jd_skills_lower))
    missing = list(set(jd_skills_lower) - set(all_candidate_skills))
    extra = list(set(all_candidate_skills) - set(jd_skills_lower))
    
    score = (len(matched) / len(jd_skills_lower) * 100) if jd_skills_lower else 100.0
    
    return {
        "score": min(100.0, score),
        "matched": matched,
        "missing": missing,
        "extra": extra
    }

def match_education(candidate_edu: List[Dict[str, Any]], jd_text: str) -> float:
    """
    Checks if candidate education meets JD requirements.
    """
    jd_lower = jd_text.lower()
    needs_bachelors = "bachelor" in jd_lower or "b.tech" in jd_lower or "bs" in jd_lower
    needs_masters = "master" in jd_lower or "m.tech" in jd_lower or "ms " in jd_lower
    
    has_bachelors = False
    has_masters = False
    
    if candidate_edu:
        for edu in candidate_edu:
            degree = str(edu.get("degree", "")).lower()
            if "bachelor" in degree or "b.tech" in degree or "bs" in degree:
                has_bachelors = True
            if "master" in degree or "m.tech" in degree or "ms" in degree:
                has_masters = True
                
    score = 100.0
    if needs_masters and not has_masters:
        score -= 50
    if needs_bachelors and not (has_bachelors or has_masters):
        score -= 50
        
    return max(0.0, score)

def match_experience(candidate_exp: List[Dict[str, Any]], jd_text: str) -> float:
    """
    Heuristic experience matcher.
    """
    jd_lower = jd_text.lower()
    # Simple heuristic to find required years of experience in JD
    import re
    years_req = re.search(r'(\d+)\+?\s*years? of experience', jd_lower)
    required_years = int(years_req.group(1)) if years_req else 0
    
    # Calculate candidate total years
    candidate_years = len(candidate_exp) * 1.5 # Rough heuristic: 1.5 years per role listed
    
    if required_years == 0:
        return 100.0
        
    if candidate_years >= required_years:
        return 100.0
        
    return (candidate_years / required_years) * 100

def match_projects(candidate_proj: List[Dict[str, Any]], jd_text: str) -> float:
    """Project relevance matcher."""
    # If candidate has projects, we give a base score, then boost based on text similarity
    if not candidate_proj:
        return 0.0
    
    return min(100.0, 50.0 + (len(candidate_proj) * 10.0))
