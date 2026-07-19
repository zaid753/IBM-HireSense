import { motion } from "framer-motion";
import { Users, FileText, Briefcase, Zap, ArrowRight, MoreHorizontal, Plus, Clock, AlertCircle } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { ChartCard } from "@/components/shared/ChartCard";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data;
    }
  });

  const { data: candidates, isLoading: isCandidatesLoading } = useQuery({
    queryKey: ['candidates', 'top'],
    queryFn: async () => {
      const res = await api.get('/candidate?limit=4');
      return res.data;
    }
  });

  const { data: chartsData, isLoading: isChartsLoading } = useQuery({
    queryKey: ['analytics', 'charts'],
    queryFn: async () => {
      const res = await api.get('/analytics/charts');
      return res.data;
    }
  });

  if (isDashboardLoading || isCandidatesLoading || isChartsLoading) {
    return (
      <div className="space-y-8 pb-8 animate-pulse">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const { kpis, insights } = dashboardData || {};
  const aiInsight = insights?.[0] || null;
  
  // Format pipeline data for chart
  const pipelineData = chartsData?.monthly_applications ? chartsData.monthly_applications.map((item: any) => ({
    name: item.month,
    candidates: item.count
  })) : [];

  const displayCandidates = candidates || [];

  const activities = [
    { id: 1, text: "Dashboard data synced securely", time: "Just now", type: "system" },
    ...(insights?.slice(1, 4).map((text: string, i: number) => ({
      id: i + 2,
      text,
      time: "Recent",
      type: "ai"
    })) || [])
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-8"
    >
      {/* Welcome Section & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2 glass-panel p-8 rounded-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-3xl font-bold font-heading mb-2 text-white">Welcome back, {user?.full_name?.split(' ')[0] || 'User'} 👋</h1>
            <p className="text-muted-foreground max-w-xl">
              You have <strong className="text-white">{kpis?.total_candidates || 0} total candidates</strong> in your pipeline. The AI has identified several exceptional matches for your active jobs.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Button variant="gradient" className="shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-shadow" asChild>
                <Link to="/ai">Review Top Matches</Link>
              </Button>
              <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10" asChild>
                <Link to="/candidates">View All Candidates</Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* AI Insights Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card rounded-3xl p-6 relative overflow-hidden border-primary/20 flex flex-col justify-between"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-warning/20 blur-2xl rounded-full pointer-events-none" />
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-white">AI Insight</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {aiInsight}
            </p>
          </div>
          <Button variant="ghost" className="w-full mt-4 text-primary hover:bg-primary/10 hover:text-primary">
            Adjust Job Description <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Candidates", value: kpis?.total_candidates || 0, icon: Users, trend: { value: 12, isPositive: true }, delay: 0.2 },
          { title: "Active Jobs", value: kpis?.active_jobs || 0, icon: Briefcase, trend: { value: 2, isPositive: true }, delay: 0.3 },
          { title: "Shortlisted", value: kpis?.shortlisted || 0, icon: FileText, trend: { value: 8, isPositive: true }, delay: 0.4 },
          { title: "Avg ATS Score", value: `${kpis?.avg_ats_score || 0}%`, icon: Zap, trend: { value: 5, isPositive: true }, delay: 0.5 },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: stat.delay }}
          >
            <StatsCard {...stat} className="glass-card hover:bg-white/[0.04] transition-colors" />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:col-span-2"
        >
          <ChartCard 
            title="Candidate Pipeline" 
            subtitle="Number of candidates added over the last 7 days"
            className="glass-card rounded-3xl h-full"
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="candidates" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorCandidates)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        {/* Top Candidates & Activity */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="glass-card rounded-3xl p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-bold text-white">Top Candidates</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white"><MoreHorizontal className="w-4 h-4" /></Button>
            </div>
            <div className="flex-1 space-y-3">
              {displayCandidates.map((candidate: any, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + (i * 0.1) }}
                  key={candidate.id} 
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-white group-hover:text-primary transition-colors">{candidate.full_name || 'Unknown'}</span>
                    <span className="text-xs text-muted-foreground">{candidate.email || 'No Email'}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-warning fill-warning" />
                      <span className="font-bold text-sm text-white">{candidate.experience_years || 0} yrs</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-primary hover:text-primary hover:bg-primary/10 transition-colors" asChild>
              <Link to="/candidates">
                View Leaderboard <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Activity Timeline */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="glass-card rounded-3xl p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-bold text-white">Recent Activity</h3>
            </div>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {activities.map((act, i) => (
                <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-4 h-4 rounded-full border border-background bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${act.type === 'ai' ? 'bg-primary' : act.type === 'upload' ? 'bg-success' : 'bg-white/20'}`} />
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1rem)] px-2 py-1">
                    <p className="text-sm font-medium text-white">{act.text}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center mt-0.5"><Clock className="w-3 h-3 mr-1" /> {act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
