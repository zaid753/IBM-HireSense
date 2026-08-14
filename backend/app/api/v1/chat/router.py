from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List
import json
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.models.chat import CandidateNote
from app.models.resume import CandidateProfile, Resume
from app.models.recruiter import Recruiter
from app.dependencies.auth import get_current_user
from app.core.firebase import verify_token

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Maps candidate_id to a list of active websocket connections
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, candidate_id: int):
        await websocket.accept()
        if candidate_id not in self.active_connections:
            self.active_connections[candidate_id] = []
        self.active_connections[candidate_id].append(websocket)

    def disconnect(self, websocket: WebSocket, candidate_id: int):
        if candidate_id in self.active_connections:
            self.active_connections[candidate_id].remove(websocket)
            if not self.active_connections[candidate_id]:
                del self.active_connections[candidate_id]

    async def broadcast(self, message: str, candidate_id: int):
        if candidate_id in self.active_connections:
            for connection in self.active_connections[candidate_id]:
                await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/{candidate_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    candidate_id: int,
    db: Session = Depends(get_db),
):
    token = websocket.query_params.get("token")
    decoded = verify_token(token) if token else None
    email = decoded.get("email") if decoded else None
    recruiter = db.query(Recruiter).filter(Recruiter.email == email).first() if email else None
    candidate = db.query(CandidateProfile).join(Resume).filter(
        CandidateProfile.id == candidate_id,
        Resume.recruiter_id == recruiter.id if recruiter else False,
    ).first()
    if not recruiter or not candidate:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, candidate_id)
    
    # Send history
    history = db.query(CandidateNote).filter(CandidateNote.candidate_id == candidate_id).order_by(CandidateNote.created_at.asc()).all()
    for note in history:
        await websocket.send_text(json.dumps({
            "id": note.id,
            "content": note.content,
            "recruiter_id": note.recruiter_id,
            "created_at": note.created_at.isoformat()
        }))

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            recruiter_id = recruiter.id
            content = payload.get("content", "")
            
            if content:
                new_note = CandidateNote(
                    candidate_id=candidate_id,
                    recruiter_id=recruiter_id,
                    content=content
                )
                db.add(new_note)
                db.commit()
                db.refresh(new_note)
                
                message = json.dumps({
                    "id": new_note.id,
                    "content": new_note.content,
                    "recruiter_id": new_note.recruiter_id,
                    "created_at": new_note.created_at.isoformat()
                })
                await manager.broadcast(message, candidate_id)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, candidate_id)
