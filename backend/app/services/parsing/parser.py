from app.services.parsing.extractor import extract_text
from app.services.parsing.cleaner import clean_text
from app.services.parsing.sectionizer import identify_sections
from app.services.parsing.ner import (
    extract_personal_info,
    extract_skills,
    extract_education,
    extract_experience,
    extract_projects,
    extract_certifications,
    extract_achievements
)
from app.schemas.parsed_resume import ParsedResume

def parse_resume(file_path: str) -> ParsedResume:
    """Main orchestration pipeline for resume intelligence."""
    # 1. Extract
    raw_text = extract_text(file_path)
    
    # 2. Clean
    cleaned_text = clean_text(raw_text)
    
    # 3. Sectionize
    sections = identify_sections(cleaned_text)
    
    # 4. Extract entities per section
    personal_info = extract_personal_info(sections.get("personal_info", cleaned_text[:500])) # Fallback to top of resume if sectioning fails
    skills = extract_skills(sections.get("skills", cleaned_text)) # Fallback to full text for skills
    
    education = extract_education(sections.get("education", ""))
    experience = extract_experience(sections.get("experience", ""))
    projects = extract_projects(sections.get("projects", ""))
    certifications = extract_certifications(sections.get("certifications", ""))
    
    achievements = extract_achievements(sections.get("achievements", ""))
    languages = [line.strip() for line in sections.get("languages", "").split('\n') if len(line) > 3]
    interests = [line.strip() for line in sections.get("interests", "").split('\n') if len(line) > 3]
    
    summary = sections.get("summary", "")
    if not summary:
        summary = sections.get("profile", "")
        
    # 5. Build parsed schema
    parsed_data = ParsedResume(
        personal_info=personal_info,
        summary=summary,
        education=education,
        experience=experience,
        projects=projects,
        skills=skills,
        certifications=certifications,
        achievements=achievements,
        languages=languages,
        interests=interests
    )
    
    return parsed_data
