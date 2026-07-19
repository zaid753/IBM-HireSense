from pydantic import BaseModel
from typing import List, Optional

class EducationItem(BaseModel):
    degree: Optional[str] = None
    college: Optional[str] = None
    university: Optional[str] = None
    branch: Optional[str] = None
    cgpa: Optional[str] = None
    percentage: Optional[str] = None
    passing_year: Optional[str] = None

class ExperienceItem(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration: Optional[str] = None
    responsibilities: Optional[List[str]] = None

class ProjectItem(BaseModel):
    project_name: Optional[str] = None
    description: Optional[str] = None
    technology_stack: Optional[List[str]] = None

class SkillsDict(BaseModel):
    programming_languages: Optional[List[str]] = None
    frameworks: Optional[List[str]] = None
    libraries: Optional[List[str]] = None
    databases: Optional[List[str]] = None
    cloud: Optional[List[str]] = None
    devops: Optional[List[str]] = None
    ai_ml: Optional[List[str]] = None
    soft_skills: Optional[List[str]] = None

class CertificationItem(BaseModel):
    certificate_name: Optional[str] = None
    organization: Optional[str] = None
    year: Optional[str] = None

class PersonalInfo(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio_website: Optional[str] = None
    location: Optional[str] = None

class ParsedResume(BaseModel):
    personal_info: Optional[PersonalInfo] = None
    summary: Optional[str] = None
    education: Optional[List[EducationItem]] = None
    experience: Optional[List[ExperienceItem]] = None
    projects: Optional[List[ProjectItem]] = None
    skills: Optional[SkillsDict] = None
    certifications: Optional[List[CertificationItem]] = None
    achievements: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    interests: Optional[List[str]] = None
