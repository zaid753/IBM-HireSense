import { useState, useRef } from "react";
import { UploadZone } from "@/components/shared/UploadZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, AlertCircle, CheckCircle2, Upload, FileSearch, BarChart3,
  BrainCircuit, ChevronRight, RotateCcw, Zap, GraduationCap,
  Briefcase, FolderKanban, Search, Mail, Phone, MapPin, Globe,
  Link2, Award, Languages, Code2, Database, Cloud,
  Cpu, Users, BookOpen, ExternalLink, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PersonalInfo {
  full_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  linkedin?: string | null;
  github?: string | null;
  portfolio_website?: string | null;
  location?: string | null;
}

interface SkillsDict {
  programming_languages?: string[] | null;
  frameworks?: string[] | null;
  libraries?: string[] | null;
  databases?: string[] | null;
  cloud?: string[] | null;
  devops?: string[] | null;
  ai_ml?: string[] | null;
  soft_skills?: string[] | null;
}

interface ExperienceItem {
  company?: string | null;
  role?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  duration?: string | null;
  responsibilities?: string[] | null;
}

interface EducationItem {
  degree?: string | null;
  college?: string | null;
  university?: string | null;
  branch?: string | null;
  cgpa?: string | null;
  percentage?: string | null;
  passing_year?: string | null;
}

interface ProjectItem {
  project_name?: string | null;
  description?: string | null;
  technology_stack?: string[] | null;
}

interface CertificationItem {
  certificate_name?: string | null;
  organization?: string | null;
  year?: string | null;
}

interface ParsedData {
  personal_info?: PersonalInfo | null;
  summary?: string | null;
  skills?: SkillsDict | null;
  experience?: ExperienceItem[] | null;
  education?: EducationItem[] | null;
  projects?: ProjectItem[] | null;
  certifications?: CertificationItem[] | null;
  achievements?: string[] | null;
  languages?: string[] | null;
  interests?: string[] | null;
}

interface ATSData {
  ats_score: number;
  confidence: number;
  matched_skills: string[];
  missing_skills: string[];
  education_score: number;
  experience_score: number;
  project_score: number;
  keyword_score: number;
  recommendation: string;
  summary: string;
}

interface AnalysisResult {
  resumeId: number;
  candidateProfileId: number | null;
  fileName: string;
  candidateName: string;
  candidateEmail: string;
  parsed: ParsedData;
  ats: ATSData;
}

type ProcessingStep = "uploading" | "parsing" | "scoring" | "done" | "error";

interface FileProcessingState {
  fileName: string;
  step: ProcessingStep;
  errorMessage?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const STEP_LABELS: Record<ProcessingStep, string> = {
  uploading: "Uploading resume…",
  parsing: "Extracting skills & experience…",
  scoring: "Generating ATS score…",
  done: "Analysis complete",
  error: "Failed",
};

const STEP_INDEX: Record<ProcessingStep, number> = {
  uploading: 1,
  parsing: 2,
  scoring: 3,
  done: 4,
  error: -1,
};

function getMatchLabel(score: number) {
  if (score >= 85) return { text: "Excellent Match", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
  if (score >= 70) return { text: "Strong Match", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" };
  if (score >= 50) return { text: "Potential Match", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" };
  return { text: "Needs Improvement", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };
}

function getScoreBarColor(score: number) {
  if (score >= 80) return "from-emerald-500 to-emerald-400";
  if (score >= 60) return "from-blue-500 to-blue-400";
  if (score >= 40) return "from-yellow-500 to-yellow-400";
  return "from-red-500 to-red-400";
}

/** Ensures a value is an array of strings – guards against backend returning a string or null */
function ensureStringArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter((s): s is string => typeof s === "string" && s.length > 1);
  if (typeof val === "string") return val.split(",").map(s => s.trim()).filter(s => s.length > 1);
  return [];
}

/** Flatten the categorized skills dict into a single array */
function flattenSkills(skills?: SkillsDict | null): string[] {
  if (!skills) return [];
  const all: string[] = [];
  for (const key of Object.keys(skills) as (keyof SkillsDict)[]) {
    const arr = skills[key];
    if (Array.isArray(arr)) all.push(...arr.filter(s => s && s.length > 0));
  }
  return [...new Set(all)];
}

/** Get skill category label and icon */
const SKILL_CATEGORIES: { key: keyof SkillsDict; label: string; icon: React.ReactNode }[] = [
  { key: "programming_languages", label: "Languages", icon: <Code2 className="w-3.5 h-3.5" /> },
  { key: "frameworks", label: "Frameworks", icon: <Globe className="w-3.5 h-3.5" /> },
  { key: "libraries", label: "Libraries", icon: <BookOpen className="w-3.5 h-3.5" /> },
  { key: "databases", label: "Databases", icon: <Database className="w-3.5 h-3.5" /> },
  { key: "cloud", label: "Cloud", icon: <Cloud className="w-3.5 h-3.5" /> },
  { key: "devops", label: "DevOps", icon: <Cpu className="w-3.5 h-3.5" /> },
  { key: "ai_ml", label: "AI / ML", icon: <BrainCircuit className="w-3.5 h-3.5" /> },
  { key: "soft_skills", label: "Soft Skills", icon: <Users className="w-3.5 h-3.5" /> },
];

/* ------------------------------------------------------------------ */
/*  Score Breakdown Bar                                                */
/* ------------------------------------------------------------------ */

function ScoreBar({ label, score, icon, delay }: { label: string; score: number; icon: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground font-medium">
          {icon}
          {label}
        </span>
        <span className="font-bold text-white">{score.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(score, 100)}%` }}
          transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${getScoreBarColor(score)}`}
        />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Processing Steps Indicator                                         */
/* ------------------------------------------------------------------ */

function ProcessingSteps({ states }: { states: FileProcessingState[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-3"
    >
      {states.map((s, i) => {
        const stepIdx = STEP_INDEX[s.step];
        const isError = s.step === "error";
        const isDone = s.step === "done";

        return (
          <motion.div
            key={`${s.fileName}-${i}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel rounded-2xl border border-white/10 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white truncate max-w-[250px]">{s.fileName}</p>
              {isError && (
                <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" /> Error
                </Badge>
              )}
              {isDone && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Done
                </Badge>
              )}
              {!isError && !isDone && (
                <span className="text-xs text-primary animate-pulse font-medium">{STEP_LABELS[s.step]}</span>
              )}
            </div>

            {/* Step indicator dots */}
            <div className="flex items-center gap-1">
              {([
                { step: "uploading" as const, icon: <Upload className="w-3 h-3" />, label: "Upload" },
                { step: "parsing" as const, icon: <FileSearch className="w-3 h-3" />, label: "Parse" },
                { step: "scoring" as const, icon: <BarChart3 className="w-3 h-3" />, label: "Score" },
              ]).map((phase, pi) => {
                const phaseIdx = STEP_INDEX[phase.step];
                const active = !isError && stepIdx === phaseIdx;
                const completed = !isError && stepIdx > phaseIdx;

                return (
                  <div key={phase.step} className="flex items-center flex-1">
                    <div className={`
                      flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold transition-all duration-500
                      ${completed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : ""}
                      ${active ? "bg-primary/20 text-primary border border-primary/40 shadow-[0_0_12px_rgba(37,99,235,0.4)] animate-pulse" : ""}
                      ${!active && !completed ? "bg-white/5 text-muted-foreground border border-white/10" : ""}
                    `}>
                      {completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : phase.icon}
                    </div>
                    {pi < 2 && (
                      <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all duration-500 ${completed ? "bg-emerald-500/30" : "bg-white/10"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {isError && s.errorMessage && (
              <p className="text-xs text-red-400 mt-2">{s.errorMessage}</p>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Single Analysis Result Card                                        */
/* ------------------------------------------------------------------ */

function AnalysisResultCard({ result, index }: { result: AnalysisResult; index: number }) {
  const { ats, parsed } = result;
  const [showFullDetails, setShowFullDetails] = useState(false);
  const match = getMatchLabel(ats.ats_score);
  const chartData = [{ name: "Score", value: ats.ats_score, fill: ats.ats_score >= 70 ? "hsl(var(--primary))" : ats.ats_score >= 50 ? "hsl(45, 100%, 55%)" : "hsl(0, 80%, 55%)" }];

  const personalInfo = parsed?.personal_info;
  const skills = parsed?.skills;
  const experience = parsed?.experience || [];
  const education = parsed?.education || [];
  const projects = parsed?.projects || [];
  const certifications = parsed?.certifications || [];
  const achievements = parsed?.achievements || [];

  const matchedSkills = ensureStringArray(ats.matched_skills);
  const missingSkills = ensureStringArray(ats.missing_skills);

  const totalSkillsCount = flattenSkills(skills).length;

  // Profile link — use candidateProfileId if available, otherwise resumeId
  const profileLink = result.candidateProfileId
    ? `/candidate/${result.candidateProfileId}`
    : `/candidate/${result.resumeId}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
    >
      <Card className="glass-card rounded-3xl border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative">
        {/* Glow accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 blur-[80px] pointer-events-none" />

        <CardContent className="p-0 relative z-10">
          {/* ── Header ─────────────────────────────────────────── */}
          <div className="p-6 border-b border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center shadow-lg shrink-0">
                  <span className="text-2xl font-bold text-white">
                    {result.candidateName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-white font-heading">{result.candidateName}</h3>
                  {parsed?.summary && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 max-w-lg">{parsed.summary}</p>
                  )}
                  {/* Contact row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                    {personalInfo?.email && (
                      <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors">
                        <Mail className="w-3 h-3" /> {personalInfo.email}
                      </a>
                    )}
                    {personalInfo?.phone_number && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" /> {personalInfo.phone_number}
                      </span>
                    )}
                    {personalInfo?.location && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {personalInfo.location}
                      </span>
                    )}
                    {personalInfo?.linkedin && (
                      <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        <Link2 className="w-3 h-3" /> LinkedIn
                      </a>
                    )}
                    {personalInfo?.github && (
                      <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors">
                        <ExternalLink className="w-3 h-3" /> GitHub
                      </a>
                    )}
                    {personalInfo?.portfolio_website && (
                      <a href={personalInfo.portfolio_website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                        <Globe className="w-3 h-3" /> Portfolio
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className={`${match.bg} ${match.color} border text-xs px-3 py-1`}>
                  {match.text}
                </Badge>
                <Button variant="outline" size="sm" className="glass-panel border-white/10 hover:bg-white/10 group" asChild>
                  <Link to={profileLink}>
                    View Profile <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">ATS Score</p>
                <p className={`text-2xl font-black mt-1 ${match.color}`}>{ats.ats_score.toFixed(0)}</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Skills Found</p>
                <p className="text-2xl font-black text-white mt-1">{totalSkillsCount}</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Experience</p>
                <p className="text-2xl font-black text-white mt-1">{experience.length} <span className="text-sm font-medium text-muted-foreground">role{experience.length !== 1 ? "s" : ""}</span></p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Confidence</p>
                <p className="text-2xl font-black text-white mt-1">{ats.confidence.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          {/* ── Score Analysis Section ─────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-white/5">
            {/* Left: ATS Score Gauge */}
            <div className="p-6 flex flex-col items-center justify-center">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4 self-start">
                <Zap className="w-4 h-4 text-primary" /> ATS Match Score
              </h4>
              <div className="w-44 h-44 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
                    barSize={14} data={chartData} startAngle={180} endAngle={0}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar
                      background={{ fill: "rgba(255,255,255,0.05)" }}
                      dataKey="value"
                      cornerRadius={10}
                      animationDuration={1500}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center -mt-5">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="text-5xl font-black text-white tracking-tighter"
                  >
                    {ats.ats_score.toFixed(0)}
                  </motion.span>
                  <span className={`text-xs font-semibold uppercase tracking-wider mt-1 ${match.color}`}>
                    {match.text}
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Score Breakdown */}
            <div className="p-6 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-5">
                <BarChart3 className="w-4 h-4 text-primary" /> Score Breakdown
              </h4>
              <ScoreBar label="Keyword Match" score={ats.keyword_score} icon={<Search className="w-3.5 h-3.5" />} delay={0.2} />
              <ScoreBar label="Experience" score={ats.experience_score} icon={<Briefcase className="w-3.5 h-3.5" />} delay={0.3} />
              <ScoreBar label="Education" score={ats.education_score} icon={<GraduationCap className="w-3.5 h-3.5" />} delay={0.4} />
              <ScoreBar label="Projects" score={ats.project_score} icon={<FolderKanban className="w-3.5 h-3.5" />} delay={0.5} />
            </div>

            {/* Right: Job Skills Matching */}
            <div className="p-6 space-y-5">
              <div>
                <p className="text-sm font-bold mb-3 flex items-center text-white">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> Matched Skills ({matchedSkills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matchedSkills.length > 0 ? matchedSkills.map((skill, i) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.04 }}
                    >
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs hover:bg-emerald-500/20 transition-colors cursor-default capitalize">
                        {skill}
                      </Badge>
                    </motion.div>
                  )) : (
                    <span className="text-muted-foreground text-xs">No matching skills detected</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold mb-3 flex items-center text-white">
                  <AlertCircle className="w-4 h-4 mr-2 text-red-400" /> Missing Skills ({missingSkills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {missingSkills.length > 0 ? missingSkills.map((skill, i) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.04 }}
                    >
                      <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-xs hover:bg-red-500/20 transition-colors cursor-default capitalize">
                        {skill}
                      </Badge>
                    </motion.div>
                  )) : (
                    <span className="text-muted-foreground text-xs">No skill gaps — great match!</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── AI Summary & Recommendation ───────────────────── */}
          <div className="p-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-black/20 rounded-2xl p-5 border border-white/5"
            >
              <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" /> AI Summary
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{ats.summary}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-primary/5 rounded-2xl p-5 border border-primary/10"
            >
              <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <BrainCircuit className="w-4 h-4 text-primary" /> Recommendation
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{ats.recommendation}</p>
            </motion.div>
          </div>

          {/* ── Detailed Breakdown Toggle ─────────────────────── */}
          <div className="border-t border-white/5">
            <button
              onClick={() => setShowFullDetails(prev => !prev)}
              className="w-full px-6 py-4 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 hover:bg-white/[0.02] transition-colors"
            >
              {showFullDetails ? "Hide" : "Show"} Full Resume Details
              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${showFullDetails ? "rotate-90" : ""}`} />
            </button>

            <AnimatePresence>
              {showFullDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 space-y-6">

                    {/* ── All Skills by Category ── */}
                    {skills && Object.values(skills).some(v => v && v.length > 0) && (
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                          <Code2 className="w-4 h-4 text-primary" /> All Skills
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {SKILL_CATEGORIES.map(cat => {
                            const catSkills = skills[cat.key];
                            if (!catSkills || catSkills.length === 0) return null;
                            return (
                              <div key={cat.key} className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                  {cat.icon} {cat.label}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {catSkills.map(skill => (
                                    <Badge key={skill} variant="outline" className="bg-white/5 text-white/80 border-white/10 text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ── Experience ── */}
                    {experience.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                          <Briefcase className="w-4 h-4 text-primary" /> Experience
                        </h4>
                        <div className="space-y-3">
                          {experience.map((exp, i) => (
                            <div key={i} className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold text-white text-sm">{exp.role || "Role not specified"}</p>
                                  <p className="text-xs text-primary mt-0.5">{exp.company || "Company not specified"}</p>
                                </div>
                                <span className="text-[11px] text-muted-foreground shrink-0">
                                  {exp.start_date || "?"} – {exp.end_date || "Present"}
                                  {exp.duration && ` · ${exp.duration}`}
                                </span>
                              </div>
                              {exp.responsibilities && exp.responsibilities.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                  {exp.responsibilities.slice(0, 3).map((r, ri) => (
                                    <li key={ri} className="text-xs text-muted-foreground flex items-start gap-2">
                                      <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                                      {r}
                                    </li>
                                  ))}
                                  {exp.responsibilities.length > 3 && (
                                    <li className="text-xs text-primary">+{exp.responsibilities.length - 3} more</li>
                                  )}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Education ── */}
                    {education.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                          <GraduationCap className="w-4 h-4 text-primary" /> Education
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {education.map((edu, i) => (
                            <div key={i} className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                              <p className="font-semibold text-white text-sm">{edu.degree || "Degree not specified"}</p>
                              <p className="text-xs text-primary mt-0.5">
                                {edu.college || edu.university || "Institution not specified"}
                                {edu.branch && ` · ${edu.branch}`}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                {edu.passing_year && <span>Year: {edu.passing_year}</span>}
                                {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                                {edu.percentage && <span>Percentage: {edu.percentage}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Projects ── */}
                    {projects.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                          <FolderKanban className="w-4 h-4 text-primary" /> Projects
                        </h4>
                        <div className="space-y-3">
                          {projects.map((proj, i) => (
                            <div key={i} className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                              <p className="font-semibold text-white text-sm">{proj.project_name || `Project ${i + 1}`}</p>
                              {proj.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{proj.description}</p>
                              )}
                              {proj.technology_stack && proj.technology_stack.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {proj.technology_stack.map(tech => (
                                    <Badge key={tech} variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px]">
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Certifications ── */}
                    {certifications.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                          <Award className="w-4 h-4 text-primary" /> Certifications
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {certifications.map((cert, i) => (
                            <div key={i} className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                              <p className="font-semibold text-white text-sm">{cert.certificate_name || "Certificate"}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {cert.organization || "Organization not specified"}
                                {cert.year && ` · ${cert.year}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Achievements ── */}
                    {achievements.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                          <Award className="w-4 h-4 text-yellow-400" /> Achievements
                        </h4>
                        <ul className="space-y-2">
                          {achievements.map((a, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2 bg-white/[0.02] rounded-lg p-3 border border-white/5">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export function ResumeUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [processingStates, setProcessingStates] = useState<FileProcessingState[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);

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

  const updateFileStep = (index: number, step: ProcessingStep, errorMessage?: string) => {
    setProcessingStates(prev => {
      const next = [...prev];
      next[index] = { ...next[index], step, errorMessage };
      return next;
    });
  };

  const handleProcess = async (jobId: string, files: File[]) => {
    if (!jobId) {
      setError("Please select a job first.");
      return;
    }
    setError(null);
    setIsProcessing(true);
    setAnalysisResults([]);

    const initialStates: FileProcessingState[] = files.map(f => ({
      fileName: f.name,
      step: "uploading",
    }));
    setProcessingStates(initialStates);

    const results: AnalysisResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // 1. Upload
        updateFileStep(i, "uploading");
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await api.post('/resume/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const resumeId = uploadRes.data.id;

        // 2. Parse
        updateFileStep(i, "parsing");
        const parseRes = await api.post(`/resume/parse/${resumeId}`);
        const parsedData: ParsedData = parseRes.data;

        // 3. ATS Score
        updateFileStep(i, "scoring");
        const atsRes = await api.post('/ats/calculate', {
          resume_id: resumeId,
          job_id: parseInt(jobId)
        });
        const atsData: ATSData = atsRes.data;

        // 4. Try to fetch the CandidateProfile ID for the "View Profile" link
        let candidateProfileId: number | null = null;
        try {
          const candidatesRes = await api.get('/candidate');
          const profiles = candidatesRes.data;
          const matched = profiles.find((p: any) => p.resume_id === resumeId);
          if (matched) candidateProfileId = matched.id;
        } catch {
          // Non-critical — we can still link via resume_id fallback
        }

        // 5. Done
        updateFileStep(i, "done");

        const personalInfo = parsedData?.personal_info;
        const candidateName = personalInfo?.full_name
          || file.name.replace(/\.(pdf|docx?)$/i, "").replace(/[_-]/g, " ");

        results.push({
          resumeId,
          candidateProfileId,
          fileName: file.name,
          candidateName,
          candidateEmail: personalInfo?.email || "",
          parsed: parsedData,
          ats: atsData,
        });

        setAnalysisResults([...results]);

      } catch (err: any) {
        updateFileStep(i, "error", err.response?.data?.detail || "Processing failed.");
      }
    }

    setIsProcessing(false);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  const handleReset = () => {
    setUploadedFiles([]);
    setAnalysisResults([]);
    setProcessingStates([]);
    setError(null);
    setIsProcessing(false);
  };

  const handleDownloadResume = async (resumeId: number, fileName: string) => {
    try {
      const res = await api.get(`/resume/download/${resumeId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download resume:", error);
    }
  };

  const hasResults = analysisResults.length > 0;
  const isFinished = !isProcessing && hasResults;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-6 pb-8"
    >
      <div>
        <h1 className="text-3xl font-bold font-heading mb-2 text-white">Upload Resumes</h1>
        <p className="text-muted-foreground">Upload candidate resumes to rank them against the active job description.</p>
      </div>

      {/* Job Selector */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-white">Select Job</label>
        {jobs && jobs.length === 0 ? (
          <div className="bg-black/40 border border-white/10 rounded-lg p-6 text-center">
            <p className="text-white mb-4">You need to create a job description before uploading resumes.</p>
            <Button asChild>
              <Link to="/job-description">Create a Job</Link>
            </Button>
          </div>
        ) : (
          <>
            <select
              className="bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={selectedJobId}
              onChange={handleJobSelect}
              disabled={isJobsLoading || isProcessing}
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

      {/* Upload Zone */}
      <AnimatePresence mode="wait">
        {!isFinished && (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, height: 0 }}
          >
            <Card className="glass-card rounded-3xl p-2 border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
              <CardContent className="p-0 sm:p-6">
                <UploadZone onUpload={handleUpload} maxFiles={50} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Steps */}
      <AnimatePresence>
        {isProcessing && processingStates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="glass-panel rounded-2xl border border-white/10 p-6 backdrop-blur-xl bg-black/60">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div>
                  <p className="font-bold text-white">AI Analysis Pipeline</p>
                  <p className="text-xs text-muted-foreground">Processing {processingStates.length} resume{processingStates.length > 1 ? "s" : ""}</p>
                </div>
              </div>
              <ProcessingSteps states={processingStates} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Results */}
      <div ref={resultsRef}>
        <AnimatePresence>
          {hasResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Results Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h2 className="text-2xl font-bold font-heading text-white flex items-center gap-3">
                    <BrainCircuit className="w-7 h-7 text-primary" />
                    Analysis Results
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {analysisResults.length} resume{analysisResults.length > 1 ? "s" : ""} analyzed successfully
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {analysisResults.length === 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="glass-panel border-white/10 hover:bg-white/10"
                      onClick={() => handleDownloadResume(analysisResults[0].resumeId, analysisResults[0].fileName)}
                    >
                      <Download className="w-4 h-4 mr-2" /> Download Resume
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="glass-panel border-white/10 hover:bg-white/10"
                    onClick={handleReset}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" /> Upload More
                  </Button>
                  <Button variant="gradient" className="shadow-[0_0_20px_rgba(37,99,235,0.3)]" asChild>
                    <Link to="/candidates">
                      View All Candidates <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </motion.div>

              {/* Result Cards */}
              {analysisResults.map((result, i) => (
                <AnalysisResultCard key={result.resumeId} result={result} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
