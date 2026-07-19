import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Bot, Search, BrainCircuit, Users, Target, Send, ChevronRight, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

export function AIDashboard() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "ai", content: "I'm your HireSense AI Copilot. How can I help you source candidates or analyze metrics today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  const { data: jobs, isLoading: isJobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res = await api.get('/job');
      return res.data;
    }
  });

  useEffect(() => {
    if (jobs && jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id.toString());
    }
  }, [jobs]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsLoading(true);

    try {
      // Calls the generative mock engine
      const res = await api.post("/ai/copilot", { query: userMsg });
      setMessages(prev => [...prev, { role: "ai", content: res.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I'm having trouble connecting to the AI brain." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const { data: recommendations, isLoading: isRecLoading } = useQuery({
    queryKey: ['ai-recommendations', selectedJobId],
    queryFn: async () => {
      const res = await api.post(`/ai/recommend?job_id=${selectedJobId}`);
      return res.data;
    },
    enabled: !!selectedJobId
  });

  const topMatch = recommendations?.top_candidates?.[0];
  const hiddenTalent = recommendations?.hidden_talent?.[0];
  const hiringStrategy = recommendations?.hiring_strategy;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col space-y-6 pb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading mb-1 text-white flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-primary" />
            AI Intelligence Hub
          </h1>
          <p className="text-muted-foreground mt-1">Leverage deep learning to surface the best talent.</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            disabled={isJobsLoading}
          >
            <option value="" disabled>Select a Job</option>
            {jobs?.map((job: any) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Left Column: AI Highlights & Recommendations */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Top Match */}
            <div className="glass-card rounded-2xl p-6 border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Top Match</h3>
              </div>
              <p className="text-sm text-indigo-200/70 mb-4">
                Sarah Jenkins has a 96% semantic match for the role.
              </p>
              <Button variant="outline" size="sm" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white" asChild>
                <Link to={`/candidates`}>View Candidate</Link>
              </Button>
            </div>

            {/* Hidden Talent */}
            <div className="glass-card rounded-2xl p-6 border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Hidden Talent</h3>
              </div>
              <p className="text-sm text-emerald-200/70 mb-4">
                Michael Chen comes from a non-traditional background but matches 92% of core competencies.
              </p>
              <Button variant="outline" size="sm" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white" asChild>
                <Link to={`/candidates`}>Review Profile</Link>
              </Button>
            </div>
          </div>

          {/* Activity Timeline / AI Summary */}
          <div className="glass-card rounded-3xl p-6 border-white/10 flex-1">
             <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Hiring Strategy Insights
             </h3>
             <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-white font-medium mb-2">Skill Gap Detected</h4>
                  <p className="text-sm text-muted-foreground">No candidates found with Rust experience for this job. Consider lowering the requirement to 'willing to learn' to increase the talent pool.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-white font-medium mb-2">Interview Optimization</h4>
                  <p className="text-sm text-muted-foreground">Candidates scored lower on system design questions this week. Use the AI Interview Generator to standardize your technical assessments.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: AI Copilot Chat */}
        <div className="lg:col-span-1 glass-card rounded-3xl border-white/10 flex flex-col overflow-hidden h-[600px] lg:h-auto">
          <div className="p-4 border-b border-white/10 bg-black/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Recruiter Copilot</h3>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
              </p>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-sm' 
                      : 'bg-white/10 text-slate-200 border border-white/5 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-3 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-75" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-150" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-white/10 bg-black/20">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="relative flex items-center"
            >
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Copilot..." 
                className="pr-12 bg-black/40 border-white/10 focus-visible:ring-primary rounded-xl"
              />
              <Button 
                type="submit" 
                size="icon" 
                variant="ghost" 
                className="absolute right-1 hover:bg-transparent text-primary"
                disabled={isLoading || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
