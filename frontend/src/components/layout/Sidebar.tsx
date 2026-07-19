import { Link, useLocation, useNavigate } from "react-router";
import { 
  Briefcase, 
  Users, 
  LayoutDashboard, 
  Settings, 
  FileText, 
  UploadCloud, 
  BarChart3,
  ChevronLeft,
  BrainCircuit,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/auth";
import { motion } from "framer-motion";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Hub", href: "/ai", icon: BrainCircuit },
  { name: "Post a Job", href: "/job-description", icon: Briefcase },
  { name: "Upload Resume", href: "/upload", icon: UploadCloud },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { logout } = useAuthStore();

  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: isSidebarOpen ? 256 : 80 
      }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-card/60 backdrop-blur-2xl border-r border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.2)]"
    >
      <div className="flex items-center justify-between h-20 px-4">
        <Link to="/" className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold tracking-tight font-heading text-white whitespace-nowrap"
            >
              HireSense<span className="text-primary">AI</span>
            </motion.span>
          )}
        </Link>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              title={!isSidebarOpen ? item.name : undefined}
              className={cn(
                "flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl -z-10"
                />
              )}
              <Icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-white")} />
              
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="whitespace-nowrap"
                >
                  {item.name}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto p-4 border-t border-white/10">
        <button
          onClick={async () => {
            await logout();
            navigate('/');
          }}
          className="flex items-center space-x-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors group"
          title={!isSidebarOpen ? "Log Out" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {isSidebarOpen && (
            <span className="whitespace-nowrap">
              Log Out
            </span>
          )}
        </button>
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-card border border-white/20 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors shadow-lg z-50"
      >
        <ChevronLeft className={cn("w-4 h-4 transition-transform", !isSidebarOpen && "rotate-180")} />
      </button>
    </motion.aside>
  );
}
