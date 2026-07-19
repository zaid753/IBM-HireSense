import { useState } from "react";
import { UploadZone } from "@/components/shared/UploadZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";

export function ResumeUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: jobs, isLoading: isJobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res = await api.get('/job');
      return res.data;
    }
  });

  const handleUpload = (files: File[]) => {
    setUploadedFiles(files);
    if (selectedJobId) {
      handleProcess(selectedJobId, files);
    }
  };

  const handleJobSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const jobId = e.target.value;
    setSelectedJobId(jobId);
    if (uploadedFiles.length > 0) {
      handleProcess(jobId, uploadedFiles);
    }
  };

  const handleProcess = async (jobId: string, files: File[]) => {
    if (!jobId) {
      setError("Please select a job first.");
      return;
    }
    setError(null);
    setIsProcessing(true);
    
    try {
      for (const file of files) {
        // 1. Upload
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await api.post('/resume/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const resumeId = uploadRes.data.id;

        // 2. Parse
        await api.post(`/resume/parse/${resumeId}`);

        // 3. ATS Score
        await api.post('/ats/calculate', {
          resume_id: resumeId,
          job_id: parseInt(jobId)
        });
      }
      
      // Redirect to candidate list
      navigate('/candidates');
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to process resumes.");
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6 pb-8"
    >
      <div>
        <h1 className="text-3xl font-bold font-heading mb-2 text-white">Upload Resumes</h1>
        <p className="text-muted-foreground">Upload candidate resumes to rank them against the active job description.</p>
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-white">Select Job</label>
        {jobs && jobs.length === 0 ? (
          <div className="bg-black/40 border border-white/10 rounded-lg p-6 text-center">
            <p className="text-white mb-4">You need to create a job description before uploading resumes.</p>
            <Button onClick={() => navigate('/job-description')}>Create a Job</Button>
          </div>
        ) : (
          <>
            <select 
              className="bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={selectedJobId}
              onChange={handleJobSelect}
              disabled={isJobsLoading}
            >
              <option value="" disabled className="bg-gray-900">-- Select a Job --</option>
              {jobs?.map((job: any) => (
                <option key={job.id} value={job.id} className="bg-gray-900">{job.title}</option>
              ))}
            </select>
            {error && <div className="text-destructive text-sm flex items-center mt-2"><AlertCircle className="w-4 h-4 mr-1" /> {error}</div>}
          </>
        )}
      </div>

      <Card className="glass-card rounded-3xl p-2 border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
        <CardContent className="p-0 sm:p-6">
          <UploadZone onUpload={handleUpload} maxFiles={50} />
        </CardContent>
      </Card>

      <AnimatePresence>
        {uploadedFiles.length > 0 && isProcessing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col justify-center items-center p-6 glass-panel rounded-2xl border border-white/10 mt-6 sticky bottom-6 z-20 shadow-2xl backdrop-blur-xl bg-black/60"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-white">Analyzing in real-time...</p>
                <p className="text-xs text-muted-foreground">Extracting skills and generating ATS scores</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
