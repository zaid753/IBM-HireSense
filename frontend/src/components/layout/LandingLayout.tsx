import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { LoginModal } from "@/components/auth/LoginModal";
import { BrainCircuit } from "lucide-react";

export function LandingLayout({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
      {/* Sticky Transparent Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background/50 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight font-heading text-white">
              HireSense<span className="text-primary">AI</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">How it Works</a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Testimonials</a>
          </nav>

          <div className="flex items-center space-x-4">
            {token ? (
              <Button asChild className="rounded-full px-6 bg-white text-black hover:bg-white/90">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <LoginModal>
                  <Button variant="ghost" className="hidden md:inline-flex text-muted-foreground hover:text-white cursor-pointer">
                    Sign In
                  </Button>
                </LoginModal>
                <LoginModal>
                  <Button className="rounded-full px-6 bg-white text-black hover:bg-white/90 cursor-pointer">
                    Get Started Free
                  </Button>
                </LoginModal>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20">
        {children}
      </main>
    </div>
  );
}
