import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Area
} from "recharts";
import { Users, Briefcase, CheckCircle, XCircle, TrendingUp, Download, Sparkles, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function AnalyticsPage() {
  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data;
    }
  });

  const { data: charts, isLoading: isChartsLoading } = useQuery({
    queryKey: ['analytics', 'charts'],
    queryFn: async () => {
      const res = await api.get('/analytics/charts');
      return res.data;
    }
  });

  const { data: funnel, isLoading: isFunnelLoading } = useQuery({
    queryKey: ['analytics', 'funnel'],
    queryFn: async () => {
      const res = await api.get('/analytics/funnel');
      return res.data;
    }
  });

  const isLoading = isDashboardLoading || isChartsLoading || isFunnelLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 pb-8 animate-pulse p-4">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-1 h-96 rounded-3xl" />
          <Skeleton className="lg:col-span-2 h-96 rounded-3xl" />
        </div>
      </div>
    );
  }


  const { kpis, insights } = dashboard || {};
  const { monthly_applications, candidate_status, skills_distribution } = charts || {};
  const funnelData = funnel || {};

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading mb-1 text-white">Executive Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into your recruitment pipeline.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="glass-panel hover:bg-white/10 transition-colors border-white/10">
            <Filter className="w-4 h-4 mr-2" /> Filter Data
          </Button>
          <Button variant="outline" className="glass-panel hover:bg-white/10 transition-colors border-white/10">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 group-hover:bg-primary transition-colors" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Candidates</p>
              <p className="text-3xl font-bold text-white mt-1">{kpis?.total_candidates || 0}</p>
            </div>
            <Users className="w-8 h-8 text-primary/40" />
          </div>
        </div>
        
        <div className="glass-card rounded-2xl p-5 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50 group-hover:bg-indigo-500 transition-colors" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Active Jobs</p>
              <p className="text-3xl font-bold text-white mt-1">{kpis?.active_jobs || 0}</p>
            </div>
            <Briefcase className="w-8 h-8 text-indigo-500/40" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Shortlisted</p>
              <p className="text-3xl font-bold text-white mt-1">{kpis?.shortlisted || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500/40" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/50 group-hover:bg-yellow-500 transition-colors" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Avg ATS Score</p>
              <p className="text-3xl font-bold text-white mt-1">{kpis?.avg_ats_score || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-500/40" />
          </div>
        </div>
      </div>

      {/* AI Insights & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Insights Panel */}
        <div className="lg:col-span-1 glass-card rounded-3xl p-6 border-white/10 shadow-2xl flex flex-col">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            AI Insights
          </h2>
          <div className="space-y-4 flex-1">
            {insights?.length > 0 ? insights.map((insight: string, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-100 text-sm">
                {insight}
              </div>
            )) : <p className="text-sm text-muted-foreground">No insights generated yet.</p>}
          </div>
        </div>

        {/* Funnel Chart */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border-white/10 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Hiring Funnel</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white">Applied</span>
              <span className="text-muted-foreground">{funnelData.total_applied}</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-2 mb-4">
              <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-white">Shortlisted</span>
              <span className="text-muted-foreground">{funnelData.shortlisted}</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-2 mb-4">
              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(funnelData.shortlisted / funnelData.total_applied) * 100}%` }}></div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-white">Interviewed</span>
              <span className="text-muted-foreground">{funnelData.interviewed}</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-2 mb-4">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(funnelData.interviewed / funnelData.total_applied) * 100}%` }}></div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-white">Offered</span>
              <span className="text-muted-foreground">{funnelData.offered}</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-2 mb-4">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(funnelData.offered / funnelData.total_applied) * 100}%` }}></div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-white">Hired</span>
              <span className="text-muted-foreground">{funnelData.hired}</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(funnelData.hired / funnelData.total_applied) * 100}%` }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Applications (Area Chart) */}
        <div className="glass-card rounded-3xl p-6 border-white/10 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Application Trends</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly_applications} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Candidate Status (Donut Chart) */}
        <div className="glass-card rounded-3xl p-6 border-white/10 shadow-2xl flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6">Candidate Status</h2>
          <div className="h-72 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={candidate_status}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {candidate_status?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center -mt-4">
              <p className="text-3xl font-bold text-white">{kpis?.total_candidates || 0}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Total</p>
            </div>
          </div>
        </div>

        {/* Top Skills (Bar Chart) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border-white/10 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Top Skill Demands</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skills_distribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="skill" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40}>
                  {skills_distribution?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
