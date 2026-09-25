import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Sparkles,
  Zap,
  Filter,
  ArrowRight,
  BookOpen,
  Tag,
  Clock,
  Info,
  HelpCircle,
} from "lucide-react";
import { JournalEntry, SearchResult } from "../types";
import { storageService } from "../services/storageService";
import { searchService } from "../services/searchService";
import { EmotionBadge } from "../components/common/EmotionBadge";
import { ALL_EMOTIONS } from "../utils/constants";

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [query, setQuery] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await storageService.getAllEntries();
      setEntries(data);
    };
    load();
  }, []);

  useEffect(() => {
    const searchResults = searchService.search(entries, query, selectedEmotion);
    setResults(searchResults);
  }, [entries, query, selectedEmotion]);

  const exampleQueries = [
    "When was I worried about exams?",
    "Show entries about college projects.",
    "When was I happy with my friends?",
    "Peaceful morning coffee",
    "Hackathon innovation and coding",
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-200/80 dark:border-amber-800/60">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Local Hybrid Search • Synonym Expansion</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Smart Memory Search
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Ask questions or search memories. Sentora expands queries through emotions, topics, and synonym heuristics.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memories (e.g., 'stressed about exams', 'happy moments', 'internship interview')..."
            className="w-full pl-12 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-sentora-500/50 text-slate-900 dark:text-white"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Example Query Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-medium">Try asking:</span>
          {exampleQueries.map((example, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setQuery(example)}
              className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sentora-50 hover:text-sentora-700 dark:hover:bg-sentora-950/60 dark:hover:text-sentora-300 text-slate-600 dark:text-slate-400 text-xs transition-all border border-slate-200/60 dark:border-slate-700/60"
            >
              "{example}"
            </button>
          ))}
        </div>

        {/* Emotion Filter & Algorithm Info Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Emotion Filter:</span>
            <select
              value={selectedEmotion}
              onChange={(e) => setSelectedEmotion(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none capitalize"
            >
              <option value="all">All Emotions</option>
              {ALL_EMOTIONS.map((em) => (
                <option key={em} value={em} className="capitalize">
                  {em}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowExplanation((prev) => !prev)}
            className="text-xs font-semibold text-sentora-600 dark:text-sentora-400 hover:underline flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showExplanation ? "Hide Scoring Formula" : "How Scoring Works"}</span>
          </button>
        </div>

        {/* Academic Scoring Explanation Callout */}
        {showExplanation && (
          <div className="p-4 rounded-2xl bg-sentora-50/70 dark:bg-slate-800/70 border border-sentora-200 dark:border-slate-700 text-xs space-y-2 text-slate-700 dark:text-slate-300 animate-fade-in">
            <p className="font-bold text-sentora-900 dark:text-sentora-200">
              🎓 University Project Scoring Breakdown:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                Exact Phrase: <span className="font-bold text-emerald-600">+5 pts</span>
              </div>
              <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                Summary Match: <span className="font-bold text-emerald-600">+4 pts</span>
              </div>
              <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                Topic Match: <span className="font-bold text-emerald-600">+4 pts</span>
              </div>
              <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                Keyword Match: <span className="font-bold text-emerald-600">+3 pts</span>
              </div>
              <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                Primary Mood Match: <span className="font-bold text-emerald-600">+3 pts</span>
              </div>
              <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                Synonym Expansion: <span className="font-bold text-emerald-600">+2 pts</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
        <span>Found {results.length} relevant journal memories</span>
        {query && <span className="font-mono">Ranked by relevance score</span>}
      </div>

      {/* Results List */}
      {results.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No matching memories found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try a different search keyword or select another emotion category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {results.map(({ entry, score, matchedFields, matchedKeywords, synonymMatches }) => {
            const dateObj = new Date(entry.createdAt);
            const dateStr = dateObj.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={entry.id}
                onClick={() => navigate(`/app/entry/${entry.id}`)}
                className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-sentora-300 dark:hover:border-sentora-700 hover:shadow-lg transition-all cursor-pointer space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{dateStr}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {query && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                        Score: +{score}
                      </span>
                    )}
                    <EmotionBadge emotion={entry.primaryEmotion} size="sm" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sentora-600 dark:group-hover:text-sentora-400 transition-colors leading-snug">
                  {entry.summary}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {entry.transcript}
                </p>

                {/* Match Badges Breakdown */}
                {query && matchedFields.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px]">
                    <span className="text-slate-400">Matches:</span>
                    {matchedFields.map((field, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-sentora-50 dark:bg-sentora-950/50 text-sentora-700 dark:text-sentora-300 font-medium border border-sentora-200/60 dark:border-sentora-800/60"
                      >
                        {field}
                      </span>
                    ))}

                    {synonymMatches.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-medium border border-amber-200/60 dark:border-amber-800/60">
                        Synonym: {synonymMatches.join(", ")}
                      </span>
                    )}
                  </div>
                )}

                {/* Topics Footer */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-wrap gap-1.5">
                    {entry.topics &&
                      entry.topics.map((t, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-sentora-600 dark:text-sentora-400 group-hover:translate-x-1 transition-transform">
                    <span>View Memory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
