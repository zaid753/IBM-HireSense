import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/store/auth";

interface Note {
  id: number;
  content: string;
  recruiter_id: number;
  created_at: string;
}

export function CollaborationPanel({ candidateId }: { candidateId: number }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [message, setMessage] = useState("");
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    // In a real app, use wss:// and pass auth token if needed
    ws.current = new WebSocket(`ws://localhost:8000/api/v1/chat/${candidateId}`);

    ws.current.onmessage = (event) => {
      const newNote = JSON.parse(event.data);
      setNotes((prev) => {
        // Prevent duplicate appending if id matches (history load logic)
        if (prev.some((n) => n.id === newNote.id)) return prev;
        return [...prev, newNote];
      });
    };

    return () => {
      ws.current?.close();
    };
  }, [candidateId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && ws.current) {
      ws.current.send(
        JSON.stringify({
          recruiter_id: user?.id || 1,
          content: message,
        })
      );
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-[500px] glass-card rounded-3xl border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-black/20 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2 text-primary" />
        <h3 className="font-bold text-white">Recruiter Notes (Live)</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {notes.length === 0 ? (
          <div className="text-center text-muted-foreground mt-10">
            No notes yet. Start the conversation!
          </div>
        ) : (
          notes.map((note, i) => {
            const isMine = note.recruiter_id === user?.id;
            return (
              <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${isMine ? 'bg-primary text-white rounded-br-sm' : 'bg-white/10 text-white rounded-bl-sm'}`}>
                  <p className="text-sm">{note.content}</p>
                  <span className="text-[10px] opacity-70 mt-1 block">
                    {new Date(note.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10 bg-black/20">
        <form onSubmit={sendMessage} className="flex space-x-2">
          <Input 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a note..."
            className="flex-1 bg-white/5 border-white/10 text-white"
          />
          <Button type="submit" size="icon" variant="gradient">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
