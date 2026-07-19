import re
from typing import Dict, List

# Common resume section headers
SECTION_HEADERS = {
    "profile": [r"^profile$", r"^personal profile$", r"^about me$", r"^objective$", r"^summary$"],
    "summary": [r"^summary$", r"^professional summary$", r"^executive summary$"],
    "education": [r"^education$", r"^academic background$", r"^qualifications$", r"^academic details$"],
    "experience": [r"^experience$", r"^work experience$", r"^professional experience$", r"^employment history$"],
    "projects": [r"^projects$", r"^academic projects$", r"^personal projects$"],
    "skills": [r"^skills$", r"^technical skills$", r"^core competencies$", r"^technologies$"],
    "certifications": [r"^certifications$", r"^certificates$", r"^licenses$"],
    "achievements": [r"^achievements$", r"^awards$", r"^honors$"],
    "languages": [r"^languages$", r"^linguistic proficiency$"],
    "interests": [r"^interests$", r"^hobbies$", r"^extracurricular activities$"]
}

def identify_sections(text: str) -> Dict[str, str]:
    """Split resume text into sections based on headers."""
    lines = text.split('\n')
    
    sections = {key: "" for key in SECTION_HEADERS.keys()}
    sections["personal_info"] = "" # Everything before the first valid section
    
    current_section = "personal_info"
    
    for line in lines:
        line_lower = line.strip().lower()
        
        # Check if line is a section header (usually short, 1-3 words)
        is_header = False
        if len(line_lower.split()) <= 4:
            for section_key, patterns in SECTION_HEADERS.items():
                for pattern in patterns:
                    if re.match(pattern, line_lower):
                        current_section = section_key
                        is_header = True
                        break
                if is_header:
                    break
        
        if not is_header:
            sections[current_section] += line + "\n"
            
    # Clean up trailing newlines
    for k in sections:
        sections[k] = sections[k].strip()
        
    return sections
