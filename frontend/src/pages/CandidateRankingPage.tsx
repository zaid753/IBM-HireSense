import { useState, useEffect } from "react";
import { Link } from "react-router";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Trophy, Medal, ChevronRight, Download, CheckCircle, AlertCircle, XCircle, Sparkles, RefreshCw, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";


// Backend matching format

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Excellent Match': return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><CheckCircle className="w-3 h-3 mr-1"/> {status}</Badge>;
    case 'Strong Match': return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20"><CheckCircle className="w-3 h-3 mr-1"/> {status}</Badge>;
    case 'Potential Match': return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20"><AlertCircle className="w-3 h-3 mr-1"/> {status}</Badge>;
    case 'Not Suitable': return <Badge className="bg-red-500/10 text-red-400 border-red-500/20"><XCircle className="w-3 h-3 mr-1"/> {status}</Badge>;
    default: return <Badge variant="outline" className="text-muted-foreground">{status}</Badge>;
  }
};

const getTrophyColor = (rank: number) => {
  if (rank === 1) return 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]';
  if (rank === 2) return 'text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.5)]';
  if (rank === 3) return 'text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]';
  return 'text-muted-foreground';
};

export function CandidateRankingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading: isJobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res = await api.get('/job');
      return res.data;
    }
  });

  // Default to first job if not selected
  useEffect(() => {
    if (jobs && jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id.toString());
    }
  }, [jobs]);

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!selectedJobId) return;
    try {
      const res = await api.get(`/ranking/export/${selectedJobId}/${format}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rankings_job_${selectedJobId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Failed to export ${format}:`, error);
    }
  };

  const { data: rankingData, isLoading: isRankingsLoading } = useQuery({
    queryKey: ['rankings', selectedJobId],
    queryFn: async () => {
      const res = await api.get(`/ranking/${selectedJobId}`);
      return res.data;
    },
    enabled: !!selectedJobId
  });

  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ['candidates', 'search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return null;
      const res = await api.post('/ai/search', { query: debouncedSearch });
      return res.data;
    },
    enabled: !!debouncedSearch
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      await api.post('/ranking/generate', { job_id: parseInt(selectedJobId) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rankings', selectedJobId] });
    }
  });

  const candidates = rankingData?.rankings || [];

  // Filter candidates based on smart search results if available, else show all
  const filteredCandidates = candidates.filter((c: any) => {
    if (debouncedSearch && searchResults?.results) {
      // If we have semantic search results, only show candidates returned in the AI response
      return searchResults.results.some((res: any) => res.id === c.resume_id);
    }
    return true; // If no search, show all
  });

  const avgAtsScore = candidates.length > 0 
    ? (candidates.reduce((sum: number, c: any) => sum + c.ats_score, 0) / candidates.length).toFixed(1)
    : 0;
  const shortlistedCount = candidates.filter((c: any) => c.status === 'Excellent Match' || c.status === 'Strong Match').length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading mb-1 text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            AI Candidate Rankings
          </h1>
          <div className="flex items-center gap-4 mt-2">
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
            <p className="text-muted-foreground text-sm">Rankings generated based on AI analysis.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="gradient" 
            className="shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-shadow"
            onClick={() => generateMutation.mutate()}
            disabled={!selectedJobId || generateMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
            Generate Rankings
          </Button>
          <Button variant="outline" className="glass-panel hover:bg-white/10 transition-colors border-white/10" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button variant="gradient" className="shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-shadow" onClick={() => handleExport('pdf')}>
            <FileText className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Analytics Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 group-hover:bg-primary transition-colors" />
          <p className="text-muted-foreground text-sm font-medium">Total Candidates</p>
          <p className="text-3xl font-bold text-white mt-1">{candidates.length}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50 group-hover:bg-indigo-500 transition-colors" />
          <p className="text-muted-foreground text-sm font-medium">Avg ATS Score</p>
          <p className="text-3xl font-bold text-indigo-400 mt-1">{avgAtsScore}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors" />
          <p className="text-muted-foreground text-sm font-medium">Shortlisted</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">
            {shortlistedCount}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-5 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/50 group-hover:bg-yellow-500 transition-colors" />
          <p className="text-muted-foreground text-sm font-medium">Top Match</p>
          <p className="text-3xl font-bold text-white mt-1 truncate">{rankingData?.top_candidate || (candidates.length > 0 ? candidates[0].name : 'N/A')}</p>
        </div>
      </div>

      {/* Main Board */}
      <div className="glass-card rounded-3xl p-6 border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-96 group">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Smart Search: e.g. Python dev with AWS from NYC..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-black/20 border-indigo-500/30 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all placeholder:text-muted-foreground/70"
            />
          </div>
          <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40 relative">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="w-[80px] text-muted-foreground">Rank</TableHead>
                <TableHead className="w-[250px] text-muted-foreground">Candidate</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-muted-foreground">ATS Score</TableHead>
                <TableHead className="text-right text-muted-foreground">Final Score</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isRankingsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Loading rankings...
                  </TableCell>
                </TableRow>
              ) : filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No rankings found. Try generating them.
                  </TableCell>
                </TableRow>
              ) : filteredCandidates.map((candidate: any, i: number) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={candidate.resume_id} 
                  className="group hover:bg-white/[0.04] transition-colors border-white/5 cursor-pointer"
                  onClick={() => window.location.href = `/candidate/${candidate.resume_id}`}
                >
                  <TableCell>
                    <div className="flex items-center space-x-2 py-2">
                      <span className={`font-bold text-xl ${getTrophyColor(candidate.rank)}`}>
                        #{candidate.rank}
                      </span>
                      {candidate.rank <= 3 && <Medal className={`w-5 h-5 ${getTrophyColor(candidate.rank)}`} />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-white group-hover:text-primary transition-colors">{candidate.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{candidate.explanation ? candidate.explanation.split('\n')[0] : ''}</div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(candidate.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-muted-foreground">{candidate.ats_score.toFixed(1)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <div className="w-24 h-1.5 bg-black/60 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.final_score}%` }}
                          transition={{ duration: 1, delay: 0.3 + (i * 0.1) }}
                          className={`h-full rounded-full ${candidate.final_score > 90 ? 'bg-primary' : candidate.final_score > 75 ? 'bg-indigo-500' : 'bg-muted-foreground'}`} 
                        />
                      </div>
                      <span className="font-bold text-white w-10 text-right">{candidate.final_score.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-white hover:bg-white/10">
                        <Link to={`/candidate/${candidate.resume_id}`} onClick={(e) => e.stopPropagation()}>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </motion.div>
  );
}
