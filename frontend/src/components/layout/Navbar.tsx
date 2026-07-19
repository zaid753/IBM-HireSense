import { useState, useRef, useEffect } from "react";
import { Search, User, Menu, Settings, FileText, UploadCloud, Users, ChevronRight, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/uiStore";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import { Link, useNavigate } from "react-router";

export function Navbar() {
  const { toggleSidebar } = useUIStore();
  const [showProfile, setShowProfile] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const profileRef = useRef<HTMLDivElement>(null);


  const { theme, setTheme } = useThemeStore();
  
  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme === 'dark' ? 'light' : 'dark');
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 rounded-2xl glass border border-white/10 sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden text-muted-foreground hover:text-white">
          <Menu className="w-5 h-5" />
        </Button>
        {/* Search Bar */}
        <div className="hidden md:flex max-w-md items-center relative group">
          <Search className="w-4 h-4 absolute left-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            type="search" 
            placeholder="Search candidates, jobs..." 
            className="pl-9 bg-black/20 border-white/10 focus-visible:ring-primary focus-visible:border-primary w-64 md:w-80 rounded-xl placeholder:text-muted-foreground/70 transition-all duration-300 focus:w-96"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl">
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>
        <div className="flex items-center space-x-3 pl-4 border-l border-white/10 relative" ref={profileRef}>
          <div className="hidden md:block text-right cursor-pointer" onClick={() => setShowProfile(!showProfile)}>
            <p className="text-sm font-medium leading-none text-white hover:text-primary transition-colors">{user?.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground mt-1">{user?.role || 'Recruiter'}</p>
          </div>
          <div 
            onClick={() => setShowProfile(!showProfile)}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-secondary/80 to-primary/80 flex items-center justify-center border border-white/20 cursor-pointer shadow-lg hover:shadow-primary/20 transition-all hover:scale-105"
          >
            <User className="w-5 h-5 text-white" />
          </div>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-56 glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden p-1"
              >
                <div className="p-3 border-b border-white/5 mb-1 bg-white/5 rounded-xl">
                  <p className="text-sm font-bold text-white">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Link to="/settings" onClick={() => setShowProfile(false)} className="w-full flex items-center space-x-3 p-2 rounded-xl text-sm text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <Link to="/settings" onClick={() => setShowProfile(false)} className="w-full flex items-center space-x-3 p-2 rounded-xl text-sm text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <div className="h-px bg-white/10 my-1"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
