import json
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.resume import ATSResult, RankingResult, Resume
from app.models.job import JobDescription

class RankingEngine:
    """
    Modular engine for Candidate Ranking.
    Currently utilizes weighted rules. Can be upgraded to LLMs later.
    """
    
    # Weight settings
    WEIGHTS = {
        "ats_score": 0.60,
        "skills": 0.15,
        "experience": 0.10,
        "education": 0.05,
        "projects": 0.05,
        "confidence": 0.05
    }

    @staticmethod
    def get_status_and_recommendation(ats_score: float) -> Tuple[str, str]:
        if ats_score >= 90:
            return "Excellent Match", "Shortlist (YES)"
        elif ats_score >= 80:
            return "Strong Match", "Shortlist (YES)"
        elif ats_score >= 70:
            return "Potential Match", "Manual Review"
        else:
            return "Not Suitable", "Reject"

    @staticmethod
    def generate_explanation(ats_score: float, final_score: float, status: str, ats_json: Dict[str, Any]) -> str:
        """Generates explainability for why this candidate was ranked."""
        reasons = []
        
        if ats_score >= 90:
            reasons.append("Highest ATS score.")
        
        if ats_json.get("experience_score", 0) >= 80:
            reasons.append("Strong experience match.")
            
        if ats_json.get("education_score", 0) >= 90:
            reasons.append("Excellent education match.")
            
        if ats_json.get("project_score", 0) >= 80:
            reasons.append("Relevant projects.")
            
        matched_skills = ats_json.get("matched_skills", [])
        if len(matched_skills) > 5:
            reasons.append("Matches majority of required technologies.")
            
        return "\n".join(reasons) if reasons else "Average match across parameters."

    def calculate_final_score(self, ats_record: ATSResult) -> Tuple[float, str, str, str]:
        """
        Parses ATS results and applies the final ranking weights.
        Returns (Final Score, Status, Recommendation, Explanation)
        """
        ats_score = ats_record.score
        
        # Default sub-scores in case parsing fails
        sub_scores = {
            "skills": 0, "experience": 0, "education": 0, "projects": 0, "confidence": 0
        }
        
        ats_json = {}
        if ats_record.explanation:
            try:
                ats_json = json.loads(ats_record.explanation)
                sub_scores["skills"] = (ats_json.get("skill_score", ats_score) if "skill_score" in ats_json else (len(ats_json.get("matched_skills", [])) * 10))
                # clamp skills just in case
                sub_scores["skills"] = min(100.0, sub_scores["skills"])
                
                sub_scores["experience"] = ats_json.get("experience_score", 0)
                sub_scores["education"] = ats_json.get("education_score", 0)
                sub_scores["projects"] = ats_json.get("project_score", 0)
                sub_scores["confidence"] = ats_json.get("confidence", 0)
            except Exception:
                pass
                
        # If we couldn't parse sub_scores, just lean heavily on ATS score
        final_score = (
            (ats_score * self.WEIGHTS["ats_score"]) +
            (sub_scores["skills"] * self.WEIGHTS["skills"]) +
            (sub_scores["experience"] * self.WEIGHTS["experience"]) +
            (sub_scores["education"] * self.WEIGHTS["education"]) +
            (sub_scores["projects"] * self.WEIGHTS["projects"]) +
            (sub_scores["confidence"] * self.WEIGHTS["confidence"])
        )
        
        status, rec = self.get_status_and_recommendation(ats_score)
        explanation = self.generate_explanation(ats_score, final_score, status, ats_json)
        
        return round(final_score, 2), status, rec, explanation

    def generate_rankings(self, db: Session, job_id: int):
        """
        Calculates ranking for all candidates applied to a job.
        Stores them in RankingResult table.
        """
        # Fetch all ATS Results for this job
        ats_results = db.query(ATSResult).filter(ATSResult.job_id == job_id).all()
        if not ats_results:
            return False
            
        candidate_scores = []
        for ats in ats_results:
            final_score, status, rec, exp = self.calculate_final_score(ats)
            
            # Extract confidence if available
            conf = 0.0
            if ats.explanation:
                try:
                    conf = json.loads(ats.explanation).get("confidence", 0.0)
                except: pass
                
            candidate_scores.append({
                "resume_id": ats.resume_id,
                "final_score": final_score,
                "status": status,
                "recommendation": rec,
                "explanation": exp,
                "confidence": conf
            })
            
        # Sort descending by final score
        candidate_scores.sort(key=lambda x: x["final_score"], reverse=True)
        
        # Clear old rankings for this job
        db.query(RankingResult).filter(RankingResult.job_id == job_id).delete()
        
        # Save new rankings
        for rank, cand in enumerate(candidate_scores, 1):
            ranking_record = RankingResult(
                job_id=job_id,
                resume_id=cand["resume_id"],
                rank=rank,
                final_score=cand["final_score"],
                status=cand["status"],
                recommendation=cand["recommendation"],
                explanation=cand["explanation"],
                confidence=cand["confidence"]
            )
            db.add(ranking_record)
            
        db.commit()
        return True

ranking_engine = RankingEngine()
