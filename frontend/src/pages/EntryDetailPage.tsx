import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Sparkles,
  Save,
  RotateCcw,
  Volume2,
  Tag,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { JournalEntry, EmotionType, JournalAnalysisResponse } from "../types";
import { storageService } from "../services/storageService";
import { geminiApiService } from "../services/geminiService";
import { EmotionBadge } from "../components/common/EmotionBadge";
import { AudioPlayer } from "../components/common/AudioPlayer";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { EMOTION_METADATA } from "../utils/constants";

export const EntryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState("");
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadEntry = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await storageService.getEntryById(id);
      if (!data) {
        navigate("/app/timeline");
        return;
      }
      setEntry(data);
      setEditedTranscript(data.transcript);
    } catch (err) {
      console.error("Failed to load journal entry:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntry();
  }, [id]);

  const handleReprocess = async () => {
    if (!entry || !editedTranscript.trim()) return;

    setIsReprocessing(true);
    setNotice(null);

    try {
      // 1. Call Gemini to re-analyze updated transcript
      const analysis = await geminiApiService.analyzeJournal(editedTranscript.trim());

      // 2. Update entry in IndexedDB
      await storageService.updateEntry(entry.id, {
        transcript: editedTranscript.trim(),
        summary: analysis.summary,
        primaryEmotion: analysis.primaryEmotion,
        emotionScores: analysis.emotionScores,
        topics: analysis.topics,
        keywords: analysis.keywords,
      });

      // 3. Reload entry
      await loadEntry();
      setIsEditing(false);
      setNotice({ type: "success", text: "Journal entry successfully reprocessed and updated with Sentora AI!" });
    } catch (err: any) {
      console.error("Failed to reprocess journal:", err);
      setNotice({ type: "error", text: err.message || "Failed to reprocess with Sentora AI." });
    } finally {
      setIsReprocessing(false);
    }
  };

  const handleSaveTextOnly = async () => {
    if (!entry || !editedTranscript.trim()) return;

    try {
      await storageService.updateEntry(entry.id, {
        transcript: editedTranscript.trim(),
      });
      await loadEntry();
      setIsEditing(false);
      setNotice({ type: "success", text: "Transcript updated successfully." });
    } catch (err: any) {
      setNotice({ type: "error", text: "Failed to save transcript." });
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    setIsDeleting(true);
    try {
      await storageService.deleteEntry(entry.id);
      navigate("/app/timeline");
    } catch (err) {
      console.error("Failed to delete entry:", err);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner message="Loading journal memory from IndexedDB..." />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Entry not found.</p>
        <Link to="/app/timeline" className="text-sentora-600 hover:underline">
          Return to Timeline
        </Link>
      </div>
    );
  }

  const dateObj = new Date(entry.createdAt);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Back Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/app/timeline"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-sentora-600 dark:text-slate-400 dark:hover:text-sentora-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Timeline</span>
        </Link>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Transcript</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditedTranscript(entry.transcript);
              }}
              className="px-3.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 text-xs font-medium transition-colors"
            >
              Cancel Edit
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
            title="Delete this entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification banner */}
      {notice && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-medium ${
            notice.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Top Card: Title, Date, Mood & Audio */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
              <span>•</span>
              <Clock className="w-3.5 h-3.5" />
              <span>{formattedTime}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
              {entry.summary}
            </h1>
          </div>
          <EmotionBadge emotion={entry.primaryEmotion} size="lg" />
        </div>

        {/* Audio Player (if audio recorded) */}
        {entry.audioBlob && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Voice Recording Playback
            </h3>
            <AudioPlayer audioBlob={entry.audioBlob} title="Original Voice Recording" />
          </div>
        )}

        {/* AI Summary Block */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-sentora-600 dark:text-sentora-400" />
            <span>AI Generated Summary</span>
          </div>
          <p className="p-4 rounded-2xl bg-sentora-50/50 dark:bg-slate-800/50 border border-sentora-100 dark:border-slate-700/60 text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
            "{entry.summary}"
          </p>
        </div>

        {/* Full Transcript Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Original Transcript
            </h3>
            {isEditing && (
              <span className="text-xs text-sentora-600 dark:text-sentora-400 font-medium">
                Editing Mode Active
              </span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <textarea
                rows={6}
                value={editedTranscript}
                onChange={(e) => setEditedTranscript(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-sm leading-relaxed text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sentora-500"
              />
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleSaveTextOnly}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                >
                  Save Text Only
                </button>
                <button
                  type="button"
                  onClick={handleReprocess}
                  disabled={isReprocessing || !editedTranscript.trim()}
                  className="px-4 py-2 rounded-xl bg-sentora-600 hover:bg-sentora-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isReprocessing ? "Reprocessing..." : "Reprocess with Sentora AI"}</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {entry.transcript}
            </p>
          )}
        </div>
      </div>

      {/* Emotion Spectrum & Scores */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Emotional Intensity Distribution
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sentora AI evaluated emotional presence scores (0 - 100) across 8 distinct states.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {(Object.keys(entry.emotionScores || {}) as EmotionType[]).map((emotionKey) => {
            const score = entry.emotionScores[emotionKey] || 0;
            const meta = EMOTION_METADATA[emotionKey] || EMOTION_METADATA.neutral;
            return (
              <div
                key={emotionKey}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 text-xs font-semibold capitalize text-slate-700 dark:text-slate-300">
                  <span>{meta.emoji}</span>
                  <span>{meta.label}</span>
                </div>

                <div className="flex items-center gap-3 flex-1 max-w-[140px]">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${score}%`,
                        backgroundColor: meta.color,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 w-7 text-right">
                    {score}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic pt-1">
          * Non-clinical classification derived solely from text content for personal journaling insights.
        </p>
      </div>

      {/* Topics & Keywords Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Topics */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Tag className="w-3.5 h-3.5 text-sentora-600" />
            <span>Extracted Topics</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {entry.topics && entry.topics.length > 0 ? (
              entry.topics.map((topic, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 text-xs font-semibold"
                >
                  #{topic}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No specific topics</span>
            )}
          </div>
        </div>

        {/* Keywords */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Key className="w-3.5 h-3.5 text-indigo-500" />
            <span>Key Search Terms</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {entry.keywords && entry.keywords.length > 0 ? (
              entry.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                >
                  {kw}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No keywords</span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Journal Entry?"
        message="Are you sure you want to delete this journal memory? This action cannot be undone and will permanently remove the entry and voice recording from your local browser IndexedDB."
        confirmText="Delete Entry"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
