import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Filter,
  ArrowUpDown,
  Search,
  Sparkles,
  Volume2,
  ArrowRight,
  Clock,
  BookOpen,
} from "lucide-react";
import { JournalEntry, EmotionType } from "../types";
import { storageService } from "../services/storageService";
import { EmotionBadge } from "../components/common/EmotionBadge";
import { ALL_EMOTIONS, EMOTION_METADATA } from "../utils/constants";

export const TimelinePage: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEntries = async () => {
      setIsLoading(true);
      try {
        const data = await storageService.getAllEntries();
        setEntries(data);

        // Gather unique topics
        const topicsSet = new Set<string>();
        data.forEach((e) => {
          (e.topics || []).forEach((t) => topicsSet.add(t));
        });
        setAvailableTopics(Array.from(topicsSet));
      } catch (err) {
        console.error("Failed to load timeline entries:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();
  }, []);

  // Filter and Sort logic
  useEffect(() => {
    let result = [...entries];

    // Filter by emotion
    if (selectedEmotion !== "all") {
      result = result.filter((e) => e.primaryEmotion === selectedEmotion);
    }

    // Filter by topic
    if (selectedTopic !== "all") {
      result = result.filter((e) => e.topics && e.topics.includes(selectedTopic));
    }

    // Filter by inline search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.summary.toLowerCase().includes(q) ||
          e.transcript.toLowerCase().includes(q) ||
          (e.keywords && e.keywords.some((k) => k.toLowerCase().includes(q))) ||
          (e.topics && e.topics.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Sort
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

    setFilteredEntries(result);
  }, [entries, selectedEmotion, selectedTopic, sortOrder, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Journal Timeline
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Chronological journey through your voice memories and emotions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/app/record")}
          className="px-4 py-2.5 rounded-xl bg-sentora-600 hover:bg-sentora-700 text-white font-medium text-xs sm:text-sm transition-all self-start sm:self-auto"
        >
          + Record New Entry
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        {/* Search & Sort Controls */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick filter timeline keywords, summaries, topics..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sentora-500/50 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {/* Topic Filter Dropdown */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Topics</option>
              {availableTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>

            {/* Sort Toggle */}
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))}
              className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === "newest" ? "Newest First" : "Oldest First"}</span>
            </button>
          </div>
        </div>

        {/* Emotion Filter Pills */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by Emotion</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedEmotion("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedEmotion === "all"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All ({entries.length})
            </button>
            {ALL_EMOTIONS.map((emotion) => {
              const meta = EMOTION_METADATA[emotion];
              const isSelected = selectedEmotion === emotion;
              const count = entries.filter((e) => e.primaryEmotion === emotion).length;
              return (
                <button
                  key={emotion}
                  type="button"
                  onClick={() => setSelectedEmotion(emotion)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? `${meta.bgLight} ${meta.bgDark} ${meta.borderLight} ${meta.borderDark} border shadow-xs font-semibold ring-2 ring-sentora-500/40`
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{meta.emoji}</span>
                  <span className="capitalize">{meta.label}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Entries Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
        <span>Showing {filteredEntries.length} memories</span>
        {(selectedEmotion !== "all" || selectedTopic !== "all" || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedEmotion("all");
              setSelectedTopic("all");
              setSearchQuery("");
            }}
            className="text-sentora-600 dark:text-sentora-400 hover:underline font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Timeline List */}
      {filteredEntries.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No matching journal entries found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or emotion filter.
          </p>
        </div>
      ) : (
        <div className="relative pl-4 sm:pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
          {filteredEntries.map((entry) => {
            const dateObj = new Date(entry.createdAt);
            const dateStr = dateObj.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const timeStr = dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={entry.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[25px] sm:-left-[33px] top-6 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-4 border-sentora-500 group-hover:scale-125 transition-transform" />

                <div
                  onClick={() => navigate(`/app/entry/${entry.id}`)}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-sentora-300 dark:hover:border-sentora-700 hover:shadow-lg transition-all cursor-pointer space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span>{timeStr}</span>
                    </div>
                    <EmotionBadge emotion={entry.primaryEmotion} size="sm" />
                  </div>

                  {/* Summary / Transcript */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sentora-600 dark:group-hover:text-sentora-400 transition-colors leading-snug">
                    {entry.summary}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                    {entry.transcript}
                  </p>

                  {/* Footer Meta: Topics, Audio Tag, View Button */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {entry.audioBlob && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sentora-50 dark:bg-sentora-950/50 text-sentora-700 dark:text-sentora-300 text-[11px] font-medium border border-sentora-200/60 dark:border-sentora-800/60">
                          <Volume2 className="w-3 h-3 text-sentora-500" />
                          <span>Voice Recording</span>
                        </span>
                      )}

                      {entry.topics &&
                        entry.topics.slice(0, 3).map((topic, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium"
                          >
                            #{topic}
                          </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-sentora-600 dark:text-sentora-400 group-hover:translate-x-1 transition-transform">
                      <span>View Entry</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
