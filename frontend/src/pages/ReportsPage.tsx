import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Download, Trash2, FileOutput, Search, Filter, Plus, Calendar, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";

export function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await api.get('/report');
      return res.data;
    }
  });

  const filteredReports = reports.filter((r: any) => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.report_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateMutation = useMutation({
    mutationFn: async () => {
      await api.post('/report/generate?report_type=Executive%20Summary');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/report/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });

  const getBadgeColor = (type: string) => {
    switch(type) {
      case 'Executive Summary': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Hiring Report': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Candidate Ranking': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const handleDownload = async (reportId: number, viewOnly: boolean = false) => {
    try {
      const res = await api.get(`/report/download/${reportId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      
      if (viewOnly) {
        window.open(url, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report_${reportId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error("Failed to download report:", error);
    }
  };

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
            <FileOutput className="w-8 h-8 text-primary" />
            Report Hub
          </h1>
          <p className="text-muted-foreground">Generate, view, and export detailed hiring reports.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="gradient" 
            className="shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <span className="flex items-center">
                <span className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center">
                <Plus className="w-4 h-4 mr-2" /> Generate New Report
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search reports..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-black/20 border-white/10 focus-visible:ring-primary focus-visible:border-primary transition-all"
            />
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white">
              <Calendar className="w-4 h-4 mr-2" /> Date Range
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40 relative">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="w-[400px] text-muted-foreground">Report Details</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Date Generated</TableHead>
                <TableHead className="text-right text-muted-foreground">Size</TableHead>
                <TableHead className="w-[150px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground">
                      <span className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                      <p>Loading reports...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No reports found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : filteredReports.map((report: any, i: number) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={report.id} 
                  className="group hover:bg-white/[0.04] transition-colors border-white/5"
                >
                  <TableCell>
                    <div className="flex items-center space-x-3 py-2">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-white group-hover:text-primary transition-colors cursor-pointer">
                          {report.title}
                        </div>
                        <div className="text-xs text-muted-foreground">ID: #{report.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getBadgeColor(report.report_type)}>{report.report_type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(report.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right text-muted-foreground">1.5 MB</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10" onClick={() => handleDownload(report.id, true)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10" onClick={() => handleDownload(report.id, false)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        onClick={() => deleteMutation.mutate(report.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
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
