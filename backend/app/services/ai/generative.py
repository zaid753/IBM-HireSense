import json
import logging
from typing import Dict, Any, List
from app.core.config import settings

logger = logging.getLogger(__name__)

class GenerativeAIEngine:
    """
    Integrates with Google Gemini to provide generative AI features.
    (Currently mocked since API Key is not provided)
    """
    
    def __init__(self):
        pass

    def generate_recruiter_insights(self, resume_data: Dict[str, Any], job_desc: Dict[str, Any]) -> Dict[str, Any]:
        """Generates AI insights on a candidate's fit for a role."""
        return {
            "strengths": [
                "Strong background in React and frontend architecture.",
                "Experience with modern state management libraries.",
                "Proven track record of delivering scalable applications."
            ],
            "weaknesses": [
                "Limited backend or database experience.",
                "Could improve on CI/CD pipeline knowledge."
            ],
            "summary": "This candidate is a strong fit for the frontend role, bringing extensive React experience. They may need some ramp-up time for full-stack tasks."
        }

    def generate_resume_improvements(self, resume_data: Dict[str, Any]) -> List[str]:
        """Provides AI suggestions to improve the resume."""
        return [
            "Quantify your achievements with metrics (e.g., 'improved performance by 20%').",
            "Highlight your open-source contributions more prominently.",
            "Condense older experience to focus on more relevant recent roles."
        ]

    def generate_interview_questions(self, role: str, skills: List[str]) -> Dict[str, List[str]]:
        """Generates contextual interview questions."""
        return {
            "technical_easy": [
                "Can you explain the virtual DOM in React?",
                "How do you manage state in a complex application?"
            ],
            "technical_medium": [
                "Describe a time you optimized the performance of a web app.",
                "How do you handle asynchronous operations in React?"
            ],
            "technical_hard": [
                "Design a scalable frontend architecture for a real-time collaborative tool.",
                "Explain how you would implement custom React hooks for complex state logic."
            ],
            "hr": [
                "Tell me about a time you had a disagreement with a team member and how you resolved it.",
                "Where do you see your technical skills growing in the next two years?"
            ]
        }

    def copilot_chat(self, query: str) -> str:
        """Simulates conversational AI for the recruiter dashboard."""
        query_lower = query.lower()
        if "hi" in query_lower or "hello" in query_lower:
            return "Hello there! I'm your HireSense AI Copilot. I can help you search for candidates, analyze resumes, or identify skill gaps. What would you like to do?"
        elif "candidate" in query_lower:
            return "I've analyzed the recent applicants. Would you like me to highlight the top matches for the Senior Frontend Engineer role?"
        elif "rank" in query_lower or "match" in query_lower:
            return "Based on my semantic analysis, Sarah Jenkins is your top candidate with a 96% match. Should I draft an outreach email to her?"
        else:
            return "I can certainly help with that. Could you provide a bit more detail on what you're looking for?"

generative_engine = GenerativeAIEngine()
