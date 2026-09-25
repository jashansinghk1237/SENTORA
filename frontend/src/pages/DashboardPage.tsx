import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mic,
  Calendar,
  Flame,
  Smile,
  Tag,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { JournalEntry, JournalStats } from "../types";
import { storageService } from "../services/storageService";
import { EmotionBadge } from "../components/common/EmotionBadge";
import { EMOTION_METADATA } from "../utils/constants";
import { SAMPLE_DEMO_ENTRIES } from "../data/demoData";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allEntries = await storageService.getAllEntries();
      setEntries(allEntries);
      const computedStats = await storageService.calculateStats();
      setStats(computedStats);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLoadDemoData = async () => {
    try {
      for (const item of SAMPLE_DEMO_ENTRIES) {
        await storageService.saveEntry(item);
      }
      await loadData();
    } catch (err) {
      console.error("Failed to seed demo data:", err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formattedCurrentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Prepare mood pattern chart data (last 7 entries)
  const chartData = entries
    .slice(0, 10)
    .reverse()
    .map((entry) => {
      const meta = EMOTION_METADATA[entry.primaryEmotion] || EMOTION_METADATA.neutral;
      return {
        date: new Date(entry.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        moodScore: meta.chartValue,
        moodLabel: meta.label,
        summary: entry.summary.slice(0, 30) + "...",
      };
    });

  const recentEntries = entries.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sentora-600 dark:text-sentora-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formattedCurrentDate}</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {getGreeting()}, Explorer
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back to your private voice journaling sanctuary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/app/record")}
            className="px-5 py-3 rounded-2xl bg-sentora-600 hover:bg-sentora-700 text-white font-medium text-sm shadow-md shadow-sentora-600/20 active:scale-98 transition-all flex items-center gap-2"
          >
            <Mic className="w-4 h-4" />
            <span>Quick Record</span>
          </button>
        </div>
      </div>

      {/* 5 Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Entries */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Entries</span>
            <BookOpen className="w-4 h-4 text-sentora-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {stats?.totalEntries || 0}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Saved locally</p>
        </div>

        {/* Entries This Week */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">This Week</span>
            <Calendar className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {stats?.entriesThisWeek || 0}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Last 7 days</p>
        </div>

        {/* Journaling Streak */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-500 flex items-center gap-1">
            <span>{stats?.currentStreak || 0}</span>
            <span className="text-sm font-normal text-slate-400">days</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Consistency score</p>
        </div>

        {/* Most Common Mood */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Top Mood</span>
            <Smile className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-1">
            {stats?.mostCommonMood ? (
              <EmotionBadge emotion={stats.mostCommonMood} size="sm" />
            ) : (
              <span className="text-sm text-slate-400">No data</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">Classified by AI</p>
        </div>

        {/* Most Discussed Topic */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Top Topic</span>
            <Tag className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {stats?.mostDiscussedTopic || "None yet"}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Primary theme</p>
        </div>
      </div>

      {/* Mood Trend Pattern Overview */}
      {entries.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sentora-600 dark:text-sentora-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Mood Flow Pattern
              </h2>
            </div>
            <Link
              to="/app/insights"
              className="text-xs font-medium text-sentora-600 dark:text-sentora-400 hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            Recent emotional trajectory across your latest voice reflections.
          </p>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="dashboardMoodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis hide domain={[0, 10]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-slate-900 text-white rounded-xl text-xs shadow-lg border border-slate-800">
                          <p className="font-semibold">{data.date}</p>
                          <p className="text-sentora-300">Mood: {data.moodLabel}</p>
                          <p className="text-slate-400 text-[10px] mt-0.5">{data.summary}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="moodScore"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#dashboardMoodGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent 5 Journals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Journals
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your latest captured voice reflections.
            </p>
          </div>
          <Link
            to="/app/timeline"
            className="text-xs font-semibold text-sentora-600 dark:text-sentora-400 hover:underline flex items-center gap-1"
          >
            <span>View All ({entries.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-sentora-100 dark:bg-sentora-950/60 text-sentora-600 dark:text-sentora-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No Journal Memories Yet
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Start speaking your thoughts with voice recording, or load sample demo entries to explore Sentora.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/app/record")}
                className="px-4 py-2 rounded-xl bg-sentora-600 hover:bg-sentora-700 text-white text-xs font-medium transition-colors"
              >
                Record First Entry
              </button>
              <button
                type="button"
                onClick={handleLoadDemoData}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
              >
                Load Demo Data (12 Entries)
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => navigate(`/app/entry/${entry.id}`)}
                className="group p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-sentora-300 dark:hover:border-sentora-700 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <EmotionBadge emotion={entry.primaryEmotion} size="sm" />
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                      {new Date(entry.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-sentora-600 dark:group-hover:text-sentora-400 transition-colors leading-relaxed line-clamp-2">
                    {entry.summary || entry.transcript}
                  </p>

                  {entry.topics && entry.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {entry.topics.map((topic, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-sentora-600 dark:text-sentora-400 group-hover:translate-x-1 transition-transform self-end sm:self-center shrink-0">
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
