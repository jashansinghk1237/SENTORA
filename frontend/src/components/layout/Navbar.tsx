import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic, Moon, Sun, Lock, ShieldCheck, Menu, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuthLock } from "../../context/AuthLockContext";

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { isPinEnabled, lockNow } = useAuthLock();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 md:hidden rounded-xl"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sentora-700 via-sentora-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-sentora-500/20 group-hover:scale-105 transition-transform">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-sentora-900 to-sentora-600 dark:from-white dark:to-sentora-300 bg-clip-text text-transparent">
              SENTORA
            </span>
            <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-sentora-100 dark:bg-sentora-950/60 text-sentora-700 dark:text-sentora-300 rounded-md border border-sentora-200 dark:border-sentora-800">
              Voice AI
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Local Privacy indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full border border-emerald-200/80 dark:border-emerald-800/60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Local IndexedDB</span>
        </div>

        {/* Quick Record Button */}
        <button
          type="button"
          onClick={() => navigate("/app/record")}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sentora-600 hover:bg-sentora-700 text-white text-xs sm:text-sm font-medium rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sentora-500/50"
        >
          <Mic className="w-4 h-4" />
          <span className="hidden sm:inline">Record Journal</span>
          <span className="sm:hidden">Record</span>
        </button>

        {/* Lock Session Button */}
        {isPinEnabled && (
          <button
            type="button"
            onClick={lockNow}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Lock Sentora Session"
            aria-label="Lock Sentora Session"
          >
            <Lock className="w-4 h-4" />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Dark/Light Mode"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
