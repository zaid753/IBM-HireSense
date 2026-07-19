import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  const { isSidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar Area */}
      <Sidebar />

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out",
          isSidebarOpen ? "ml-64" : "ml-20"
        )}
      >
        <div className="p-4 md:p-6 pb-0 z-20">
          <Navbar />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-6 z-10 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
