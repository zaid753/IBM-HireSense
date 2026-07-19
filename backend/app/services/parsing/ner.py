import re
import spacy
from typing import Dict, List, Any
from app.schemas.parsed_resume import PersonalInfo, SkillsDict, EducationItem, ExperienceItem, ProjectItem, CertificationItem

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import logging
    logging.error("spacy model en_core_web_sm not found. Please run: python -m spacy download en_core_web_sm")
    nlp = None

def extract_personal_info(text: str) -> PersonalInfo:
    """Extract Personal Info using Regex and spaCy."""
    info = PersonalInfo()
    
    # Email
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    if email_match:
        info.email = email_match.group(0)
        
    # Phone Number (International and local formats)
    phone_match = re.search(r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    if phone_match:
        info.phone_number = phone_match.group(0)
        
    # LinkedIn
    linkedin_match = re.search(r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+', text)
    if linkedin_match:
        info.linkedin = linkedin_match.group(0)
        
    # GitHub
    github_match = re.search(r'(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+', text)
    if github_match:
        info.github = github_match.group(0)

    # Full Name & Location using spaCy
    if nlp:
        doc = nlp(text)
        # Assuming the first PERSON entity in personal_info section is the name
        for ent in doc.ents:
            if ent.label_ == "PERSON" and not info.full_name:
                info.full_name = ent.text
            elif ent.label_ == "GPE" and not info.location:
                info.location = ent.text
                
        # Fallback for name if spacy fails (first line of text usually is name)
        if not info.full_name:
            first_line = text.split('\n')[0].strip()
            if 1 < len(first_line.split()) < 5:
                info.full_name = first_line
                
    return info

def extract_skills(text: str) -> SkillsDict:
    """Extract skills (basic keyword matching approach)."""
    skills = SkillsDict(
        programming_languages=[], frameworks=[], libraries=[], databases=[], cloud=[], devops=[], ai_ml=[], soft_skills=[]
    )
    # Very basic matching just for the structure setup. 
    # Real NLP would use a massive dictionary/tri-gram match.
    text_lower = text.lower()
    
    programming_keywords = ['python', 'java', 'c++', 'javascript', 'typescript', 'go', 'rust']
    frameworks_keywords = ['react', 'angular', 'vue', 'django', 'fastapi', 'spring', 'next.js']
    databases_keywords = ['sql', 'mysql', 'postgresql', 'mongodb', 'redis']
    cloud_keywords = ['aws', 'gcp', 'azure', 'heroku']
    
    for word in programming_keywords:
        if word in text_lower:
            skills.programming_languages.append(word)
            
    for word in frameworks_keywords:
        if word in text_lower:
            skills.frameworks.append(word)
            
    for word in databases_keywords:
        if word in text_lower:
            skills.databases.append(word)
            
    for word in cloud_keywords:
        if word in text_lower:
            skills.cloud.append(word)

    return skills

def extract_education(text: str) -> List[EducationItem]:
    """Heuristic extraction for Education."""
    # A complete parser would use zero-shot classification or strict regex.
    # For foundation, we map lines to a basic item if it contains year/degree keywords.
    edu_list = []
    
    if "bachelor" in text.lower() or "b.tech" in text.lower() or "bs" in text.lower():
        edu = EducationItem(degree="Bachelor's Degree")
        
        # Simple year regex
        year_match = re.search(r'\b(19|20)\d{2}\b', text)
        if year_match:
            edu.passing_year = year_match.group(0)
            
        edu_list.append(edu)
        
    return edu_list

def extract_experience(text: str) -> List[ExperienceItem]:
    """Heuristic extraction for Experience."""
    exp_list = []
    lines = text.split('\n')
    
    current_exp = None
    for line in lines:
        # If line has a date range, we assume it's a job header
        if re.search(r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|20\d{2}).*(20\d{2}|present)', line.lower()):
            if current_exp:
                exp_list.append(current_exp)
            current_exp = ExperienceItem(duration=line.strip(), responsibilities=[])
        elif current_exp and len(line) > 10:
            current_exp.responsibilities.append(line.strip())
            
    if current_exp:
        exp_list.append(current_exp)
        
    return exp_list

def extract_projects(text: str) -> List[ProjectItem]:
    """Heuristic extraction for Projects."""
    return []

def extract_certifications(text: str) -> List[CertificationItem]:
    """Heuristic extraction for Certifications."""
    return []

def extract_achievements(text: str) -> List[str]:
    return [line.strip() for line in text.split('\n') if len(line) > 5]
