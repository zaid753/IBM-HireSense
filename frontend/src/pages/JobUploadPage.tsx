import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Save, LayoutTemplate, UploadCloud, Clock, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";

export function JobUploadPage() {
  const [jdText, setJdText] = useState("");
  const [title, setTitle] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: jobs, isLoading: isJobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res = await api.get('/job');
      return res.data;
    }
  });

  const createJobMutation = useMutation({
    mutationFn: async (newJob: { title: string, description: string }) => {
      const res = await api.post('/job', newJob);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      setJdText("");
      setTitle("");
    }
  });

  const handleTemplateSelect = () => {
    setTitle("Senior Frontend Engineer");
    setJdText("## Role Overview\n\nWe are looking for a Senior Frontend Engineer...\n\n## Responsibilities\n- Build scalable React components\n- Optimize for web performance\n\n## Requirements\n- 5+ years of React\n- TypeScript expertise");
  };

  const handleSave = () => {
    if (!title || !jdText) return;
    createJobMutation.mutate({ title, description: jdText });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Automatically set title from filename (without extension) if title is empty
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setJdText(text);
      }
    };
    reader.readAsText(file);
    
    // Reset file input so same file can be uploaded again if cleared
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-6 pb-8 flex flex-col lg:flex-row gap-8"
    >
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-heading mb-2 text-white">Create Job Description</h1>
          <p className="text-muted-foreground">Upload or paste your job description to establish the baseline for AI matching.</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button variant="outline" onClick={handleTemplateSelect} className="glass-panel hover:border-primary/50 transition-colors group">
            <LayoutTemplate className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
            Use Template
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".txt,.md,.csv" 
          />
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="glass-panel hover:border-primary/50 transition-colors group"
          >
            <UploadCloud className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
            Upload Document
          </Button>
        </div>

        <div className="space-y-4">
          <Input 
            placeholder="Job Title (e.g. Senior Frontend Engineer)" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50 h-12 text-lg focus:border-primary/50"
          />

        <Card className="glass-card rounded-3xl overflow-hidden border-white/10 shadow-2xl relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
          <CardContent className="p-0">
            <div className="border-b border-white/10 bg-black/40 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white">
                <FileText className="w-5 h-5 text-primary" />
                <span className="font-medium">Job Description Details</span>
              </div>
              <div className="flex items-center space-x-4">
                <AnimatePresence>
                  {isSaved && (
                    <motion.span 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-success flex items-center"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Saved to draft
                    </motion.span>
                  )}
                </AnimatePresence>
                <div className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded">
                  {jdText.length} chars • {jdText.split(/\s+/).filter(w => w.length > 0).length} words
                </div>
              </div>
            </div>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste your job description here, or type from scratch..."
              className="w-full min-h-[400px] p-6 bg-transparent resize-y focus:outline-none focus:ring-0 text-white leading-relaxed placeholder:text-muted-foreground/50 selection:bg-primary/30 relative z-10"
            />
          </CardContent>
        </Card>
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="ghost" className="hover:bg-white/5" onClick={() => { setTitle(""); setJdText(""); }}>Clear</Button>
          <Button 
            variant="outline" 
            onClick={handleSave} 
            disabled={createJobMutation.isPending || !title || !jdText}
            className="border-white/10 bg-white/5 hover:bg-white/10"
          >
            {createJobMutation.isPending ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Job
          </Button>
        </div>
      </div>

      {/* Sidebar - Recent Drafts */}
      <div className="w-full lg:w-80 space-y-6 pt-16">
        <h3 className="font-heading font-bold text-lg text-white">Active Jobs</h3>
        <div className="space-y-3">
          {isJobsLoading ? (
            <div className="text-muted-foreground text-sm">Loading jobs...</div>
          ) : jobs?.length > 0 ? (
            jobs.map((job: any, i: number) => (
              <motion.div 
                key={job.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-4 rounded-2xl border-white/5 hover:border-white/20 hover:bg-white/[0.04] cursor-pointer transition-all group"
              >
                <h4 className="font-bold text-white text-sm group-hover:text-primary transition-colors line-clamp-1">{job.title}</h4>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> {new Date(job.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-success/30 text-success bg-success/10">
                    Active
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-muted-foreground text-sm">No jobs created yet.</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
