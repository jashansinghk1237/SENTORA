import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Flame,
  Smile,
  Tag,
  BookOpen,
  PieChart as PieIcon,
  TrendingUp,
  Activity,
  ShieldAlert,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { JournalEntry, JournalStats, EmotionType } from "../types";
import { storageService } from "../services/storageService";
import { EmotionBadge } from "../components/common/EmotionBadge";
import { ALL_EMOTIONS, EMOTION_METADATA } from "../utils/constants";

export const InsightsPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const allEntries = await storageService.getAllEntries();
        setEntries(allEntries);
        const computedStats = await storageService.calculateStats();
        setStats(computedStats);
      } catch (err) {
        console.error("Failed to load insights data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 1. Mood Trend Timeline Data (Mapped scale 1 - 9)
  const moodTrendData = entries
    .slice(0, 15)
    .reverse()
    .map((entry) => {
      const meta = EMOTION_METADATA[entry.primaryEmotion] || EMOTION_METADATA.neutral;
      return {
        date: new Date(entry.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        score: meta.chartValue,
        emotion: meta.label,
        summary: entry.summary.slice(0, 35) + "...",
      };
    });

  // 2. Emotion Distribution Donut Data
  const emotionCounts: Record<EmotionType, number> = {
    happy: 0,
    excited: 0,
    calm: 0,
    neutral: 0,
    anxious: 0,
    stressed: 0,
    sad: 0,
    angry: 0,
  };

  entries.forEach((e) => {
    if (emotionCounts[e.primaryEmotion] !== undefined) {
      emotionCounts[e.primaryEmotion]++;
    }
  });

  const emotionDistributionData = (Object.keys(emotionCounts) as EmotionType[])
    .filter((k) => emotionCounts[k] > 0)
    .map((k) => ({
      name: EMOTION_METADATA[k].label,
      value: emotionCounts[k],
      color: EMOTION_METADATA[k].color,
      emoji: EMOTION_METADATA[k].emoji,
    }));

  // 3. Topic Frequency Bar Chart Data
  const topicCounts: Record<string, number> = {};
  entries.forEach((e) => {
    (e.topics || []).forEach((t) => {
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    });
  });

  const topicFrequencyData = Object.entries(topicCounts)
    .map(([topic, count]) => ({
      topic,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // 4. Journal Activity by Date (Last 14 days)
  const activityMap: Record<string, number> = {};
  const last14Days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    last14Days.push(key);
    activityMap[key] = 0;
  }

  entries.forEach((e) => {
    const key = new Date(e.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (activityMap[key] !== undefined) {
      activityMap[key]++;
    }
  });

  const activityData = last14Days.map((day) => ({
    day,
    entries: activityMap[day] || 0,
  }));

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-sentora-100 dark:bg-sentora-950/60 text-sentora-700 dark:text-sentora-300 text-xs font-semibold">
          <BarChart3 className="w-3.5 h-3.5 text-sentora-600 dark:text-sentora-400" />
          <span>Personal Analytics & Recharts</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Insights & Trends
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Understand your emotional rhythms, core topics, and journaling habits over time.
        </p>
      </div>

      {/* Academic / Non-clinical Disclaimer Alert */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3 text-indigo-900 dark:text-indigo-200 text-xs leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Academic Project Disclaimer: </span>
          Visualization is based on journal mood classification and is not a psychological assessment. Mood analysis reflects text features extracted for personal reflection only.
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Entries */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Entries</span>
            <BookOpen className="w-4 h-4 text-sentora-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {stats?.totalEntries || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Recorded voice memories</p>
        </div>

        {/* Journaling Streak */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-amber-500 flex items-baseline gap-1">
            <span>{stats?.currentStreak || 0}</span>
            <span className="text-sm font-normal text-slate-400">days</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Consistency habit</p>
        </div>

        {/* Most Common Mood */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Predominant Mood</span>
            <Smile className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-1">
            {stats?.mostCommonMood ? (
              <EmotionBadge emotion={stats.mostCommonMood} size="md" />
            ) : (
              <span className="text-sm text-slate-400">No data</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Classified by Sentora AI</p>
        </div>

        {/* Most Discussed Topic */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Top Theme</span>
            <Tag className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {stats?.mostDiscussedTopic || "None"}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Frequent reflection area</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Mood Trend Timeline Area Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sentora-600 dark:text-sentora-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Mood Trend Timeline
              </h2>
            </div>
            <span className="text-xs text-slate-400">Mapped 1 (Angry) to 9 (Excited)</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chronological emotional trajectory across your journal entries.
          </p>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodTrendData}>
                <defs>
                  <linearGradient id="insightsMoodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 10]} ticks={[1, 3, 5, 7, 9]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-slate-900 text-white rounded-xl text-xs shadow-xl border border-slate-800 space-y-1">
                          <p className="font-semibold">{data.date}</p>
                          <p className="text-sentora-300 font-medium">Mood: {data.emotion}</p>
                          <p className="text-slate-400 text-[11px]">{data.summary}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#insightsMoodGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Emotion Distribution Donut Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Emotion Distribution
              </h2>
            </div>
            <span className="text-xs text-slate-400">Total Classified</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Proportional breakdown of primary emotions across all journals.
          </p>

          <div className="h-64 w-full pt-2 flex items-center justify-center">
            {emotionDistributionData.length === 0 ? (
              <p className="text-xs text-slate-400">No journal entries to display</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emotionDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {emotionDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} entries`, name]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 3. Top Topic Frequency Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Topic Frequency
              </h2>
            </div>
            <span className="text-xs text-slate-400">Top Themes</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Most frequent topics automatically extracted by Sentora AI.
          </p>

          <div className="h-64 w-full pt-2">
            {topicFrequencyData.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-20">No topic data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicFrequencyData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="topic"
                    stroke="#94a3b8"
                    fontSize={11}
                    width={110}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${value} entries`, "Count"]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 4. Journal Activity Over Time (14 Days) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Journal Activity
              </h2>
            </div>
            <span className="text-xs text-slate-400">Last 14 Days</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daily voice journaling volume and consistency.
          </p>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} reflections`, "Entries"]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="entries" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
