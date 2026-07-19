from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List
import json
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.models.chat import CandidateNote
from app.models.recruiter import Recruiter
from app.dependencies.auth import get_current_user

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
    db: Session = Depends(get_db)
):
    # In a real app, we would authenticate the WebSocket connection using a token passed in query params
    # For now, we will assume the connection is authorized for simplicity, or we can parse a token if sent in the first message.
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
            
            # Expecting payload to contain { token, content }
            # Validate token (simplified)
            # We would decode JWT here and get recruiter_id
            
            # For simplicity in this demo, let's assume the payload just has recruiter_id and content
            # since full WebSocket auth with Depends is complex and often requires passing token in URI or first message.
            
            recruiter_id = payload.get("recruiter_id", 1) # Default to 1 if not provided
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
