import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  Square,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Save,
  Trash2,
  Edit3,
  AlertCircle,
  Volume2,
  CheckCircle2,
  ArrowRight,
  Shield,
  HelpCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { geminiApiService } from "../services/geminiService";
import { storageService } from "../services/storageService";
import { EmotionBadge } from "../components/common/EmotionBadge";
import { AudioPlayer } from "../components/common/AudioPlayer";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { JournalAnalysisResponse, JournalEntry, EmotionType } from "../types";
import { EMOTION_METADATA } from "../utils/constants";

export const RecordPage: React.FC = () => {
  const navigate = useNavigate();

  // Voice recording hook
  const {
    isRecording,
    isPaused,
    recordingDuration,
    audioBlob,
    audioUrl,
    audioLevel,
    error: recorderError,
    startRecording: startAudioRecord,
    pauseRecording: pauseAudioRecord,
    resumeRecording: resumeAudioRecord,
    stopRecording: stopAudioRecord,
    resetRecording: resetAudioRecord,
  } = useAudioRecorder();

  // Speech Recognition hook
  const {
    transcript: liveTranscript,
    interimTranscript,
    isListening,
    isSupported: isSpeechSupported,
    errorMessage: speechError,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  } = useSpeechRecognition();

  // Local state for the editable transcript
  const [editableTranscript, setEditableTranscript] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<JournalAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Synchronize live speech transcript with editable transcript
  useEffect(() => {
    if (liveTranscript) {
      setEditableTranscript(liveTranscript);
    }
  }, [liveTranscript]);

  const handleStartRecording = async () => {
    setErrorMessage(null);
    setAnalysisResult(null);
    setIsSaved(false);
    await startAudioRecord();
    if (isSpeechSupported) {
      startListening();
    }
  };

  const handlePauseRecording = () => {
    pauseAudioRecord();
    stopListening();
  };

  const handleResumeRecording = () => {
    resumeAudioRecord();
    if (isSpeechSupported) {
      startListening();
    }
  };

  const handleStopRecording = () => {
    stopAudioRecord();
    stopListening();
  };

  const handleResetAll = () => {
    resetAudioRecord();
    resetTranscript();
    setEditableTranscript("");
    setAnalysisResult(null);
    setErrorMessage(null);
    setIsSaved(false);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnalyzeJournal = async () => {
    const textToAnalyze = editableTranscript.trim();
    if (!textToAnalyze) {
      setErrorMessage("Please speak or type a journal entry before analyzing.");
      return;
    }

    if (isRecording) {
      handleStopRecording();
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await geminiApiService.analyzeJournal(textToAnalyze);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error("AI Analysis failed:", err);
      setErrorMessage(
        err.message || "Failed to analyze journal with Sentora AI. Please check your backend connection."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveEntry = async () => {
    if (!analysisResult) return;

    const newId = `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newEntry: JournalEntry = {
      id: newId,
      createdAt: nowIso,
      updatedAt: nowIso,
      transcript: editableTranscript.trim(),
      summary: analysisResult.summary,
      primaryEmotion: analysisResult.primaryEmotion,
      emotionScores: analysisResult.emotionScores,
      topics: analysisResult.topics,
      keywords: analysisResult.keywords,
      audioBlob: audioBlob,
      searchText: "",
      embedding: null,
    };

    try {
      await storageService.saveEntry(newEntry);
      setIsSaved(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });

      setTimeout(() => {
        navigate(`/app/entry/${newId}`);
      }, 1200);
    } catch (err: any) {
      console.error("Failed to save entry locally:", err);
      setErrorMessage("Could not save to local IndexedDB. Please try again.");
    }
  };

  const wordCount = editableTranscript.trim() ? editableTranscript.trim().split(/\s+/).length : 0;
  const charCount = editableTranscript.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-sentora-100 dark:bg-sentora-950/60 text-sentora-700 dark:text-sentora-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-sentora-600 dark:text-sentora-400" />
          <span>Voice Recording & AI Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Record Your Journal
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Speak your thoughts freely. Sentora will transcribe and extract meaningful emotional reflections.
        </p>
      </div>

      {/* Browser Speech API Warning / Info Banner */}
      {!isSpeechSupported && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3 text-amber-800 dark:text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold">Voice transcription is not supported in this browser.</p>
            <p className="text-amber-700 dark:text-amber-300">
              You can still record audio blobs with your microphone and type or edit your transcript manually in the box below.
            </p>
          </div>
        </div>
      )}

      {/* Recorder Error Banner */}
      {recorderError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Microphone Access Error</p>
            <p className="mt-0.5">{recorderError}</p>
          </div>
        </div>
      )}

      {/* General Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Notice</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Voice Recording Control Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-center relative overflow-hidden">
        {/* Recording Visual Wave Background */}
        {isRecording && !isPaused && (
          <div className="absolute inset-0 bg-sentora-500/5 dark:bg-sentora-500/10 pointer-events-none animate-pulse" />
        )}

        <div className="relative z-10 flex flex-col items-center">
          {/* Main Record Button with Pulse Waves */}
          <div className="relative mb-6">
            {isRecording && !isPaused && (
              <div
                className="absolute inset-0 rounded-full bg-sentora-500/30 animate-ping pointer-events-none"
                style={{ transform: `scale(${1 + (audioLevel / 100) * 0.5})` }}
              />
            )}

            <button
              type="button"
              onClick={
                isRecording
                  ? handleStopRecording
                  : handleStartRecording
              }
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 focus:outline-none ${
                isRecording
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30"
                  : "bg-gradient-to-tr from-sentora-700 to-violet-500 hover:from-sentora-800 hover:to-violet-600 text-white shadow-sentora-600/30"
              }`}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? (
                <Square className="w-8 h-8 fill-current" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>
          </div>

          {/* Recording Timer & Status */}
          <div className="space-y-1">
            <div className="font-mono text-3xl font-bold text-slate-900 dark:text-white">
              {formatTimer(recordingDuration)}
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isRecording
                ? isPaused
                  ? "Recording Paused"
                  : "Listening & Recording..."
                : audioBlob
                ? "Audio Captured • Ready to Analyze"
                : "Click microphone to start recording"}
            </p>
          </div>

          {/* Realtime Audio Level Bars */}
          {isRecording && (
            <div className="flex items-center gap-1.5 h-6 my-4">
              {[...Array(12)].map((_, i) => {
                const heightPercent = isPaused
                  ? 15
                  : Math.max(15, Math.min(100, audioLevel * (0.5 + ((i % 4) + 1) * 0.2)));
                return (
                  <span
                    key={i}
                    className="w-1.5 rounded-full bg-sentora-600 dark:bg-sentora-400 transition-all duration-75"
                    style={{ height: `${heightPercent}%` }}
                  />
                );
              })}
            </div>
          )}

          {/* Control Actions (Pause/Resume, Stop, Reset) */}
          <div className="flex items-center justify-center gap-3 mt-4">
            {isRecording && (
              <>
                <button
                  type="button"
                  onClick={isPaused ? handleResumeRecording : handlePauseRecording}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isPaused ? "Resume" : "Pause"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="px-4 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Finish</span>
                </button>
              </>
            )}

            {(audioBlob || editableTranscript) && !isRecording && (
              <button
                type="button"
                onClick={handleResetAll}
                className="px-3 py-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 text-xs flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Recording</span>
              </button>
            )}
          </div>

          {/* Audio Player Preview */}
          {audioBlob && !isRecording && (
            <div className="w-full max-w-md mt-6">
              <AudioPlayer audioBlob={audioBlob} title="Captured Voice Audio" />
            </div>
          )}
        </div>
      </div>

      {/* Editable Transcript Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-sentora-600 dark:text-sentora-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Editable Transcript
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Transcribed live as you speak. You can freely edit, fix spelling, or type additional notes before running AI analysis.
        </p>

        <div className="relative">
          <textarea
            rows={6}
            value={editableTranscript}
            onChange={(e) => setEditableTranscript(e.target.value)}
            placeholder="Your spoken transcript will appear here automatically. Or, you can type your journal entry manually..."
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-sentora-500/50 resize-y"
          />
          {interimTranscript && (
            <div className="mt-1 px-2 text-xs italic text-sentora-500 dark:text-sentora-400 animate-pulse">
              Streaming: "{interimTranscript}"
            </div>
          )}
        </div>

        {/* Analyze CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Shield className="w-3.5 h-3.5 text-sentora-500" />
            <span>Only the current text is sent to Sentora AI for analysis.</span>
          </div>

          <button
            type="button"
            onClick={handleAnalyzeJournal}
            disabled={isAnalyzing || !editableTranscript.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-sentora-600 hover:bg-sentora-700 disabled:opacity-50 text-white font-medium text-sm shadow-md shadow-sentora-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAnalyzing ? "Analyzing..." : "Analyze My Journal"}</span>
          </button>
        </div>
      </div>

      {/* Loading Spinner State */}
      {isAnalyzing && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <LoadingSpinner message="Sentora AI is analyzing your thoughts & emotional spectrum..." />
        </div>
      )}

      {/* AI Analysis Preview & Save Section */}
      {analysisResult && !isAnalyzing && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-sentora-300 dark:border-sentora-700 shadow-xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sentora-600 dark:text-sentora-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  SENTORA AI ANALYSIS
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Personalized insights from your journal
              </p>
            </div>
            <EmotionBadge emotion={analysisResult.primaryEmotion} size="lg" />
          </div>

          {/* AI Summary */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Concise Summary
            </h4>
            <p className="p-4 rounded-2xl bg-sentora-50/50 dark:bg-slate-800/50 border border-sentora-100 dark:border-slate-700/60 text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              "{analysisResult.summary}"
            </p>
          </div>

          {/* Emotion Spectrum Scores (8 emotions) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Emotion Intensity Scores (0 - 100)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(analysisResult.emotionScores) as EmotionType[]).map((emotionKey) => {
                const score = analysisResult.emotionScores[emotionKey] || 0;
                const meta = EMOTION_METADATA[emotionKey] || EMOTION_METADATA.neutral;
                return (
                  <div
                    key={emotionKey}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3"
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
            <p className="text-[11px] text-slate-400 italic">
              * Non-clinical classification derived from text analysis for personal reflection.
            </p>
          </div>

          {/* Topics & Keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Extracted Topics
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.topics.map((topic, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/70 text-xs font-medium"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Keywords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons: Save, Edit Again, Discard */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAnalysisResult(null)}
              className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-medium transition-colors"
            >
              Edit Again
            </button>
            <button
              type="button"
              onClick={handleResetAll}
              className="px-4 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium transition-colors"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSaveEntry}
              disabled={isSaved}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center gap-2"
            >
              {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? "Saved to IndexedDB!" : "Save Journal"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
