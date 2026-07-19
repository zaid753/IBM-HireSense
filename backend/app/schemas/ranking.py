from pydantic import BaseModel
from typing import List, Optional

class RankedCandidateSchema(BaseModel):
    rank: int
    name: str
    ats_score: float
    final_score: float
    status: str
    recommendation: str
    confidence: float
    explanation: Optional[str] = None
    resume_id: int

class RankingListResponse(BaseModel):
    job_id: int
    total_candidates: int
    top_candidate: Optional[str] = None
    rankings: List[RankedCandidateSchema]

class RankingGenerateRequest(BaseModel):
    job_id: int
