import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Mic,
  Calendar,
  Search,
  BarChart3,
  Settings,
  Sparkles,
  Shield,
  Heart,
} from "lucide-react";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const navItems = [
    { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/app/record", label: "Record Journal", icon: Mic, highlight: true },
    { to: "/app/timeline", label: "Journal Timeline", icon: Calendar },
    { to: "/app/search", label: "Smart Search", icon: Search },
    { to: "/app/insights", label: "Insights & Trends", icon: BarChart3 },
    { to: "/app/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="flex flex-col justify-between w-64 h-full p-4 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Journal Space
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-sentora-50 dark:bg-sentora-950/60 text-sentora-700 dark:text-sentora-300 shadow-sm border border-sentora-200/70 dark:border-sentora-800/60"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                    } ${item.highlight ? "text-sentora-600 dark:text-sentora-400 font-semibold" : ""}`
                  }
                >
                  <Icon className={`w-4 h-4 ${item.highlight ? "text-sentora-600 dark:text-sentora-400" : ""}`} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* AI & Local Privacy Banner */}
        <div className="p-3.5 bg-gradient-to-br from-sentora-50 to-violet-50 dark:from-slate-800/60 dark:to-slate-800/40 rounded-2xl border border-sentora-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-sentora-900 dark:text-sentora-300">
            <Sparkles className="w-4 h-4 text-sentora-600 dark:text-sentora-400" />
            <span>Voice + Sentora AI</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Your voice and journal history stay 100% stored in your browser's IndexedDB.
          </p>
        </div>
      </div>

      {/* University Project Viva Info */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Privacy-First Architecture</span>
          </div>
          <span className="font-mono text-[10px]">v1.0.0</span>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center flex items-center justify-center gap-1">
          Made for University Project <Heart className="w-3 h-3 text-rose-400 fill-rose-400 inline" />
        </p>
      </div>
    </aside>
  );
};
