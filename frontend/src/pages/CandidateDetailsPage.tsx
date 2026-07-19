import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Mail, Phone, Link as LinkIcon, Download, 
  Briefcase, GraduationCap, CheckCircle2, AlertCircle, Zap, 
  Calendar as CalendarIcon, Loader2, X, BrainCircuit 
} from "lucide-react";
import { Link, useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CollaborationPanel } from "@/components/chat/CollaborationPanel";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";

export function CandidateDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // Fetch Candidate Profile
  const { data: candidateProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['candidate', id],
    queryFn: async () => {
      const res = await api.get(`/candidate/${id}`);
      return res.data;
    }
  });

  const resumeId = candidateProfile?.resume_id;

  // Fetch Parsed Resume Data
  const { data: parsedResume, isLoading: isParsedLoading } = useQuery({
    queryKey: ['resume', 'parsed', resumeId],
    queryFn: async () => {
      const res = await api.get(`/resume/parsed/${resumeId}`);
      return res.data;
    },
    enabled: !!resumeId
  });

  // Fetch ATS Results
  const { data: atsResults, isLoading: isAtsLoading } = useQuery({
    queryKey: ['ats', resumeId],
    queryFn: async () => {
      const res = await api.get(`/ats/${resumeId}`);
      return res.data;
    },
    enabled: !!resumeId
  });

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const scheduleMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post(`/candidate/${id}/schedule`, data);
      return res.data;
    },
    onSuccess: () => {
      setIsScheduleModalOpen(false);
      alert("Interview scheduled successfully! An email has been sent.");
    },
    onError: (err: any) => {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to schedule interview.");
    }
  });

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleMutation.mutate({
      scheduled_time: new Date(scheduleTime).toISOString(),
      duration_minutes: 60,
      meeting_link: meetingLink
    });
  };

  const handleDownloadCV = async () => {
    if (!resumeId) return;
    try {
      const res = await api.get(`/resume/download/${resumeId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${candidateName.replace(/\\s+/g, '_')}_Resume.pdf`); 
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download CV:", error);
    }
  };

  if (isProfileLoading || isParsedLoading || isAtsLoading) {
    return (
      <div className="space-y-8 pb-8 animate-pulse p-8">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }
  // Derived data
  const candidateName = candidateProfile?.full_name || "Unknown Candidate";
  const candidateEmail = candidateProfile?.email || "No Email";
  const candidatePhone = candidateProfile?.phone || "No Phone";
  
  const initials = candidateName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || "AJ";
  
  // Latest ATS result
  const atsResult = atsResults?.[0] || null;
  const atsScore = atsResult?.ats_score || 0;
  const matchedSkills = atsResult?.matched_skills || [];
  const missingSkills = atsResult?.missing_skills || [];
  const recommendations = atsResult?.recommendations || ["No recommendations available yet."];
  
  const parsed = parsedResume || {};
  const experience = parsed.experience || [];
  const education = parsed.education || [];
  
  const chartData = [{ name: 'Score', value: atsScore, fill: 'hsl(var(--success))' }];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-6 pb-8"
    >
      {/* Header Navigation */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-white/10 bg-white/5 border border-white/10 text-white">
          <Link to="/candidates">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-heading text-white">Candidate Profile</h1>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="glass-panel hover:bg-white/10 transition-colors group" onClick={handleDownloadCV}>
            <Download className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" /> Download CV
          </Button>
          <Button 
            variant="gradient" 
            className="shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-shadow"
            onClick={() => setIsScheduleModalOpen(true)}
          >
            <CalendarIcon className="w-4 h-4 mr-2" /> Schedule Interview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & AI Analysis */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card rounded-3xl overflow-hidden border-white/10 shadow-2xl relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] pointer-events-none" />
              <div className="h-28 bg-gradient-to-r from-primary/30 to-accent/30 relative border-b border-white/10">
                <div className="absolute -bottom-10 left-6 w-24 h-24 rounded-2xl bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)]">
                  <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">{initials}</span>
                </div>
              </div>
              <CardContent className="pt-14 pb-6 px-6 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{candidateName}</h2>
                    <p className="text-primary font-medium">{parsed.summary?.slice(0, 50) || "Candidate Profile"}...</p>
                  </div>
                  <Badge variant="success" className="bg-success/10 text-success border-success/20 px-3 py-1">Active</Badge>
                </div>
                
                <div className="space-y-4">
                  <a href={`mailto:${candidateEmail}`} className="flex items-center text-sm text-muted-foreground hover:text-white transition-colors p-2 -mx-2 rounded-lg hover:bg-white/5">
                    <Mail className="w-4 h-4 mr-3 text-muted-foreground" /> {candidateEmail}
                  </a>
                  <a href={`tel:${candidatePhone}`} className="flex items-center text-sm text-muted-foreground hover:text-white transition-colors p-2 -mx-2 rounded-lg hover:bg-white/5">
                    <Phone className="w-4 h-4 mr-3 text-muted-foreground" /> {candidatePhone}
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Score Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card rounded-3xl relative overflow-hidden border-white/10 shadow-2xl">
              <CardContent className="p-6">
                <h3 className="font-heading font-bold text-lg mb-6 flex items-center text-white">
                  <Zap className="w-5 h-5 mr-2 text-warning fill-warning" /> 
                  AI Match Analysis
                </h3>
                
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="w-48 h-48 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart 
                        cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" 
                        barSize={15} data={chartData} startAngle={180} endAngle={0}
                      >
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar
                          background={{ fill: 'rgba(255,255,255,0.05)' }}
                          dataKey="value"
                          cornerRadius={10}
                          animationDuration={1500}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center -mt-6">
                      <span className="text-5xl font-black text-white tracking-tighter">{atsScore}</span>
                      <span className="text-sm font-medium text-success uppercase tracking-wider mt-1">{atsScore >= 80 ? 'Excellent Match' : atsScore >= 60 ? 'Good Match' : 'Potential Match'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-bold mb-3 flex items-center text-white">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-success" /> Matched Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {matchedSkills.map((skill: string, i: number) => (
                        <motion.div 
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + (i * 0.05) }}
                        >
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs hover:bg-success/20 hover:scale-105 transition-all cursor-default">
                            {skill}
                          </Badge>
                        </motion.div>
                      ))}
                      {matchedSkills.length === 0 && <span className="text-muted-foreground text-xs">No matched skills</span>}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-bold mb-3 flex items-center text-white">
                      <AlertCircle className="w-4 h-4 mr-2 text-destructive" /> Missing Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {missingSkills.map((skill: string, i: number) => (
                        <motion.div 
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + (i * 0.05) }}
                        >
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs hover:bg-destructive/20 hover:scale-105 transition-all cursor-default">
                            {skill}
                          </Badge>
                        </motion.div>
                      ))}
                      {missingSkills.length === 0 && <span className="text-muted-foreground text-xs">No missing skills</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Recommendations */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-card rounded-3xl border-primary/30 relative overflow-hidden shadow-[0_0_40px_rgba(37,99,235,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
              <CardContent className="p-6">
                <h3 className="font-heading font-bold text-lg mb-4 text-white flex items-center">
                  <BrainCircuit className="w-5 h-5 mr-2 text-primary" /> AI Recommendations
                </h3>
                <ul className="space-y-4">
                  {recommendations.map((rec: string, i: number) => (
                    <motion.li 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      key={i} 
                      className="flex items-start bg-black/20 p-4 rounded-2xl border border-white/5"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-4 shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-white leading-relaxed text-sm">{rec}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="glass-card rounded-3xl h-full border-white/10">
                <CardContent className="p-6">
                  <h3 className="font-heading font-bold text-lg mb-6 flex items-center text-white">
                    <Briefcase className="w-5 h-5 mr-2 text-primary" /> 
                    Experience
                  </h3>
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                    {experience.length > 0 ? experience.map((exp: any, i: number) => (
                      <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-background bg-primary text-primary-foreground shadow-[0_0_10px_rgba(37,99,235,0.5)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] glass-panel p-5 rounded-2xl border border-white/10 hover:border-primary/30 transition-colors group-hover:bg-white/[0.04]">
                          <div className="flex flex-col mb-2">
                            <span className="font-bold text-white text-base">{exp.job_title}</span>
                            <span className="text-xs font-medium text-primary mt-1">{exp.company} • {exp.start_date} - {exp.end_date || 'Present'}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{exp.description}</p>
                        </div>
                      </div>
                    )) : <p className="text-muted-foreground text-sm">No experience data available.</p>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="glass-card rounded-3xl h-full border-white/10">
                <CardContent className="p-6">
                  <h3 className="font-heading font-bold text-lg mb-6 flex items-center text-white">
                    <GraduationCap className="w-5 h-5 mr-2 text-primary" /> 
                    Education & Certs
                  </h3>
                  <div className="space-y-4">
                    {education.length > 0 ? education.map((edu: any, i: number) => (
                      <div key={i} className="glass-panel p-5 rounded-2xl border border-white/10 hover:bg-white/[0.04] transition-colors">
                        <h4 className="font-bold text-white text-sm">{edu.degree}</h4>
                        <p className="text-sm text-muted-foreground mt-2">{edu.institution}</p>
                        <p className="text-xs font-medium text-primary mt-1">{edu.graduation_date}</p>
                      </div>
                    )) : <p className="text-muted-foreground text-sm">No education data available.</p>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            {id && <CollaborationPanel candidateId={parseInt(id)} />}
          </motion.div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsScheduleModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-background border border-white/10 rounded-3xl p-6 shadow-2xl glass-card z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-heading text-white">Schedule Interview</h2>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-white" onClick={() => setIsScheduleModalOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <form onSubmit={handleSchedule} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="datetime" className="text-white">Date & Time</Label>
                  <Input 
                    id="datetime" 
                    type="datetime-local" 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="link" className="text-white">Meeting Link</Label>
                  <Input 
                    id="link" 
                    type="url" 
                    placeholder="https://meet.google.com/..."
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                
                <div className="pt-4 flex justify-end space-x-3">
                  <Button type="button" variant="ghost" onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="gradient" disabled={scheduleMutation.isPending}>
                    {scheduleMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Send Invite
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
