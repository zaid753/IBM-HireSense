import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { LoginModal } from "@/components/auth/LoginModal";
import { 
  ArrowRight, 
  CheckCircle2, 
  BrainCircuit, 
  FileSearch, 
  TrendingUp, 
  Users, 
  Zap, 
  ShieldCheck,
  Star,
  ChevronDown,
  UploadCloud,
  BarChart,
  LayoutDashboard
} from "lucide-react";

export function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full min-h-[100vh] flex flex-col items-center justify-center pt-24 pb-32 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 -z-10 bg-background overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -50, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-60" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -60, 0],
              y: [0, 60, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] opacity-50" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              x: [0, 30, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 left-1/3 w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[140px] opacity-40" 
          />
        </div>

        <div className="container mx-auto px-6 flex flex-col items-center text-center z-10 relative">


          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-6xl md:text-8xl lg:text-9xl font-black font-heading tracking-tighter mb-6 max-w-6xl leading-[1.1] text-white"
          >
            Hire Smarter.<br />
            <span className="text-muted-foreground">Screen Faster.</span><br />
            <span className="text-gradient">Rank with AI.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl leading-relaxed font-light"
          >
            The world's most advanced AI-powered ATS. Upload resumes, instantly compare against job descriptions, and let AI surface your top candidates in seconds.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto"
          >
            {localStorage.getItem('auth-storage') && JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token ? (
              <Button size="lg" variant="gradient" className="w-full sm:w-auto text-lg px-8 h-14 rounded-full shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] transition-shadow" asChild>
                <Link to="/dashboard">
                  Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            ) : (
              <LoginModal>
                <Button size="lg" variant="gradient" className="w-full sm:w-auto text-lg px-8 h-14 rounded-full shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] transition-shadow cursor-pointer">
                  Start for free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </LoginModal>
            )}
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 h-14 rounded-full bg-white/5 hover:bg-white/10 border-white/10 text-white backdrop-blur-md" asChild>
              <a href="#how-it-works">See how it works</a>
            </Button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-8 flex items-center space-x-4 text-sm text-muted-foreground"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                </div>
              ))}
            </div>
            <span>Join 10,000+ recruiters</span>
          </motion.div>
        </div>

        {/* Dashboard Mockup - Floating Browser */}
        <motion.div 
          initial={{ opacity: 0, y: 150 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, type: "spring", damping: 20 }}
          className="mt-24 w-full max-w-7xl px-4 relative z-10 perspective-1000"
        >
          {/* Floating decorative elements around the mockup */}
          <motion.div 
            animate={{ y: [0, -20, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-12 top-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ y: [0, 20, 0] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -right-12 bottom-1/4 w-40 h-40 bg-accent/20 rounded-full blur-3xl"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", opacity: { duration: 1, delay: 1.5 } }}
            className="absolute -right-4 top-1/3 glass-panel px-4 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center space-x-3 z-20"
          >
            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center border border-success/30">
              <CheckCircle2 className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">99% Match</p>
              <p className="text-[10px] text-muted-foreground">Frontend Engineer</p>
            </div>
          </motion.div>

          <div className="rounded-xl border border-white/10 bg-black/80 backdrop-blur-3xl overflow-hidden shadow-[0_20px_100px_-20px_rgba(37,99,235,0.5)] transform-gpu rotate-x-12 scale-95 hover:rotate-x-0 hover:scale-100 transition-all duration-700 ease-out group">
            <div className="h-12 bg-white/5 border-b border-white/10 flex items-center px-4 space-x-2 relative">
              <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
              <div className="mx-auto bg-white/5 rounded-md px-4 py-1 text-xs text-muted-foreground font-mono group-hover:bg-white/10 transition-colors">
                hiresense.ai/dashboard
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
            <div className="relative aspect-[16/9] w-full bg-background overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
                alt="Dashboard"
                className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-1000"
              />
              {/* Overlay Mock UI */}
              <div className="absolute inset-0 p-8 flex gap-6">
                <div className="w-64 h-full bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4 space-y-4">
                  <div className="w-full h-8 bg-white/10 rounded-lg animate-pulse"></div>
                  <div className="w-3/4 h-4 bg-white/5 rounded"></div>
                  <div className="w-1/2 h-4 bg-white/5 rounded"></div>
                  <div className="w-5/6 h-4 bg-white/5 rounded"></div>
                  <div className="mt-8 space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                        <div className="w-6 h-6 rounded-full bg-white/10"></div>
                        <div className="w-24 h-3 bg-white/5 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-1 h-32 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col justify-end group-hover:bg-white/[0.05] transition-colors">
                       <div className="text-3xl font-bold text-white mb-2">1,248</div>
                       <div className="text-sm text-muted-foreground">Total Candidates</div>
                    </div>
                    <div className="flex-1 h-32 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col justify-end group-hover:bg-white/[0.05] transition-colors">
                       <div className="text-3xl font-bold text-white mb-2">94%</div>
                       <div className="text-sm text-muted-foreground">Placement Rate</div>
                    </div>
                    <div className="flex-1 h-32 bg-primary/20 backdrop-blur-md rounded-2xl border border-primary/30 p-6 flex flex-col justify-end relative overflow-hidden">
                       <div className="absolute inset-0 bg-primary/10 animate-pulse pointer-events-none" />
                       <div className="text-3xl font-bold text-primary mb-2 relative z-10">32</div>
                       <div className="text-sm text-primary/80 relative z-10">New AI Matches</div>
                    </div>
                  </div>
                  <div className="w-full h-64 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
                    {/* Mock Chart Lines */}
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <motion.path 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                        d="M0 100 Q 25 50, 50 80 T 100 20" 
                        fill="none" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth="1" 
                        vectorEffect="non-scaling-stroke"
                      />
                      <motion.path 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2.5, delay: 1.2, ease: "easeOut" }}
                        d="M0 100 Q 30 80, 60 40 T 100 60" 
                        fill="none" 
                        stroke="hsl(var(--secondary))" 
                        strokeWidth="1" 
                        strokeDasharray="4 4"
                        vectorEffect="non-scaling-stroke"
                        opacity="0.5"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>



      {/* Bento Grid Workflow */}
      <section id="how-it-works" className="w-full py-32 relative bg-black/20 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6 text-white tracking-tight">Automate the boring parts.</h2>
            <p className="text-xl text-muted-foreground">Our AI engine handles the heavy lifting so you can focus on building relationships with top talent.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Bento Item 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="md:col-span-2 glass-card rounded-[40px] p-8 md:p-12 border border-white/10 relative overflow-hidden group flex flex-col justify-between min-h-[400px] shadow-2xl"
            >
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 blur-[80px] group-hover:bg-primary/30 transition-colors pointer-events-none" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-6 shadow-inner">
                  <UploadCloud className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Upload & Parse</h3>
                <p className="text-muted-foreground text-lg max-w-md leading-relaxed">Drag and drop thousands of resumes. We instantly parse PDFs and DOCX files with 99.9% accuracy, turning messy documents into structured profiles.</p>
              </div>
              <div className="mt-8 relative h-32 bg-black/40 rounded-2xl border border-white/5 p-4 overflow-hidden flex items-end justify-center shadow-inner">
                <div className="w-full max-w-xs h-24 bg-white/[0.03] rounded-t-xl border border-white/10 flex flex-col items-center justify-center border-b-0 relative group-hover:translate-y-2 group-hover:bg-white/[0.05] transition-all duration-500">
                  <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-t-xl" />
                  <UploadCloud className="w-8 h-8 text-primary/70 mb-2 relative z-10" />
                  <div className="w-1/2 h-1 bg-white/10 rounded-full relative z-10" />
                </div>
              </div>
            </motion.div>

            {/* Bento Item 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card rounded-[40px] p-8 border border-white/10 relative overflow-hidden group flex flex-col justify-between min-h-[400px] shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-50 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center mb-6 shadow-inner">
                  <BrainCircuit className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">AI Skill Extraction</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">Our LLM understands context, not just keywords. 'React' implies 'JavaScript' experience automatically.</p>
              </div>
              <div className="mt-8 flex gap-2 flex-wrap">
                {['React', 'TypeScript', 'Node.js', 'AWS', 'System Design'].map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-secondary/10 text-secondary border border-secondary/20 shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Bento Item 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card rounded-[40px] p-8 border border-white/10 relative overflow-hidden group flex flex-col justify-between min-h-[400px] shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent opacity-50 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center mb-6 shadow-inner">
                  <BarChart className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">ATS Scoring</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">Match scores from 0-100 based strictly on your job requirements. Zero bias, pure logic.</p>
              </div>
              <div className="mt-8 flex items-end gap-2 h-24 pt-4 border-b border-white/10">
                {[40, 70, 95, 60, 85].map((h, i) => (
                  <div key={i} className="flex-1 bg-accent/20 rounded-t-md relative group-hover:bg-accent/40 transition-colors duration-500" style={{ height: `${h}%` }}>
                    {h > 90 && <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-accent bg-accent/10 px-1.5 py-0.5 rounded">95</div>}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Bento Item 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="md:col-span-2 glass-card rounded-[40px] p-8 md:p-12 border border-white/10 relative overflow-hidden group flex flex-col md:flex-row items-center gap-10 min-h-[400px] shadow-2xl"
            >
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-success/20 blur-[80px] group-hover:bg-success/30 transition-colors pointer-events-none" />
              <div className="flex-1 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-success/20 border border-success/30 flex items-center justify-center mb-6 shadow-inner">
                  <LayoutDashboard className="w-7 h-7 text-success" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Review & Hire</h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md">Top candidates bubble to the top of your dashboard. Schedule interviews with your next great hire in one click.</p>
              </div>
              <div className="flex-1 w-full bg-black/40 rounded-3xl border border-white/5 p-5 space-y-3 relative overflow-hidden shadow-inner">
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 to-transparent z-10 pointer-events-none" />
                {[
                  { name: "Alice Johnson", role: "Frontend Engineer", score: 98 },
                  { name: "Michael Smith", role: "Product Manager", score: 95 },
                  { name: "Emma Davis", role: "UX Designer", score: 92 },
                  { name: "David Kim", role: "Backend Developer", score: 88 },
                ].map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/10 group-hover:bg-white/[0.05] transition-colors duration-500">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white border border-white/20">{c.name.charAt(0)}</div>
                      <div>
                        <div className="text-sm font-bold text-white leading-none mb-1">{c.name}</div>
                        <div className="text-[10px] text-muted-foreground leading-none">{c.role}</div>
                      </div>
                    </div>
                    <div className="text-xs font-black text-success bg-success/10 px-2 py-1 rounded-full border border-success/20 shadow-sm">{c.score}%</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="w-full py-32 relative bg-black/20 border-y border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6 text-white tracking-tight">Supercharge your workflow</h2>
            <p className="text-xl text-muted-foreground">Every tool you need to find the perfect candidate, baked right in.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Semantic Matching", desc: "AI goes beyond keyword matching to find true potential.", icon: FileSearch, color: "text-primary", bg: "bg-primary/10", glow: "group-hover:shadow-[0_0_40px_rgba(37,99,235,0.2)]" },
              { title: "Collaborative Hiring", desc: "Share profiles, leave notes, and make decisions as a team.", icon: Users, color: "text-secondary", bg: "bg-secondary/10", glow: "group-hover:shadow-[0_0_40px_rgba(124,58,237,0.2)]" },
              { title: "Lightning Fast", desc: "Built on a modern React stack, it's ridiculously fast.", icon: Zap, color: "text-accent", bg: "bg-accent/10", glow: "group-hover:shadow-[0_0_40px_rgba(6,182,212,0.2)]" },
              { title: "Enterprise Security", desc: "SOC2 Type II certified. Data encrypted at rest and transit.", icon: ShieldCheck, color: "text-success", bg: "bg-success/10", glow: "group-hover:shadow-[0_0_40px_rgba(34,197,94,0.2)]" },
              { title: "Actionable Insights", desc: "Track skill distributions and sourcing metrics visually.", icon: TrendingUp, color: "text-warning", bg: "bg-warning/10", glow: "group-hover:shadow-[0_0_40px_rgba(245,158,11,0.2)]" },
              { title: "Smart Parsing", desc: "Extract data from messy PDFs with incredible accuracy.", icon: BrainCircuit, color: "text-destructive", bg: "bg-destructive/10", glow: "group-hover:shadow-[0_0_40px_rgba(239,68,68,0.2)]" },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={`glass-card p-8 rounded-3xl hover:bg-white/[0.04] transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden ${feature.glow}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 relative z-10">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed relative z-10">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="w-full py-32 relative">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-12 text-center text-white">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How accurate is the AI matching?", a: "Our AI model is trained on millions of successful hires. It boasts a 98% accuracy rate in skill extraction and semantic matching." },
              { q: "Is candidate data secure?", a: "Yes. We use AES-256 encryption for all data at rest and TLS 1.3 for data in transit. We are fully SOC2 Type II compliant." },
              { q: "Can I integrate with my existing tools?", a: "HireSense offers out-of-the-box integrations with Slack, Microsoft Teams, Workday, and Greenhouse." },
              { q: "How many resumes can I upload at once?", a: "You can upload up to 5,000 resumes in a single batch. Processing takes less than 3 minutes for max batches." }
            ].map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl overflow-hidden border-white/10"
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="text-lg font-bold text-white">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${activeFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-muted-foreground"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-32 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-primary/5" />
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-square bg-primary/20 blur-[120px] rounded-full" 
        />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-black font-heading mb-6 text-white tracking-tight">Ready to hire smarter?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of modern recruiting teams using HireSense AI to build better teams, faster.
          </p>
          {localStorage.getItem('auth-storage') && JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token ? (
            <Button size="lg" variant="gradient" className="text-lg px-10 h-16 rounded-full shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] transition-all hover:scale-105" asChild>
              <Link to="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          ) : (
            <LoginModal>
              <Button size="lg" variant="gradient" className="text-lg px-10 h-16 rounded-full shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] transition-all hover:scale-105 cursor-pointer">
                Get Started for Free
              </Button>
            </LoginModal>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-black/80 border-t border-white/5 pt-20 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
            <div className="col-span-2 lg:col-span-2 space-y-6">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black font-heading tracking-tight text-white">
                  HireSense<span className="text-primary">.ai</span>
                </span>
              </Link>
              <p className="text-muted-foreground max-w-sm">
                The world's most advanced AI-powered Applicant Tracking System. Build better teams, faster, with zero bias.
              </p>
              <div className="flex items-center space-x-4">
                <a href="https://www.linkedin.com/in/mohammedjaid" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors group">
                  {/* LinkedIn SVG */}
                  <svg className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a href="https://github.com/zaid753" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors group">
                  {/* GitHub SVG */}
                  <svg className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6">Product</h4>
              <ul className="space-y-4 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6">Company</h4>
              <ul className="space-y-4 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6">Legal</h4>
              <ul className="space-y-4 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} HireSense AI. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              <span className="text-xs text-muted-foreground font-medium">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
