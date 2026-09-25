import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mic,
  Sparkles,
  ShieldCheck,
  Search,
  BarChart3,
  Lock,
  ArrowRight,
  Database,
  Cpu,
  BrainCircuit,
  Smile,
  Volume2,
} from "lucide-react";
import { Navbar } from "../components/layout/Navbar";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-sentora-500/15 dark:bg-sentora-600/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-violet-400/10 dark:bg-violet-600/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-sentora-100/80 dark:bg-sentora-950/80 border border-sentora-200 dark:border-sentora-800 text-sentora-800 dark:text-sentora-300 text-xs sm:text-sm font-semibold shadow-xs animate-fade-in">
            <Sparkles className="w-4 h-4 text-sentora-600 dark:text-sentora-400" />
            <span>Voice-First • Sentora AI • Local IndexedDB Privacy</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
            Your thoughts. Your voice. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sentora-600 via-violet-600 to-purple-600 dark:from-sentora-400 dark:via-violet-400 dark:to-purple-300 bg-clip-text text-transparent">
              Your private space.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Capture your thoughts through voice, organize your memories with AI, and rediscover moments that matter.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/app/record")}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-sentora-600 hover:bg-sentora-700 text-white font-semibold text-base shadow-lg shadow-sentora-600/25 hover:shadow-xl hover:shadow-sentora-600/30 active:scale-98 transition-all flex items-center justify-center gap-2.5 group"
            >
              <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Start Journaling</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/app/timeline")}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-base border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
            >
              View Timeline
            </button>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xs">
              <Mic className="w-5 h-5 text-sentora-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Voice-First</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Speak freely with instant Web Speech transcription.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xs">
              <BrainCircuit className="w-5 h-5 text-violet-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Sentora AI Insights</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Structured emotion, mood, topic & keyword extraction.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">100% Local DB</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Stored securely in your browser's IndexedDB.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xs">
              <Search className="w-5 h-5 text-amber-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Smart Search</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Local hybrid search with synonym expansion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How Sentora Works Section */}
      <section className="py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-sentora-600 dark:text-sentora-400">
              Workflow
            </span>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              How Sentora Works
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              A frictionless 3-step journey from raw spoken words to organized personal insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-2xl bg-sentora-100 dark:bg-sentora-950/60 text-sentora-600 dark:text-sentora-400 flex items-center justify-center font-bold text-lg mb-4 border border-sentora-200 dark:border-sentora-800">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Speak your thoughts
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Hit record and talk naturally. MediaRecorder captures high-fidelity audio while the Web Speech API creates a real-time editable transcript.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-lg mb-4 border border-violet-200 dark:border-violet-800">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Sentora converts & understands
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Sentora AI safely summarizes your entry, evaluates 8 distinct emotional intensities, and extracts key topics and searchable keywords.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-4 border border-emerald-200 dark:border-emerald-800">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Rediscover your memories
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Browse chronological timelines, explore emotional patterns with interactive Recharts, and search past memories with synonym intelligence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy First Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-sentora-900 via-indigo-950 to-slate-950 text-white shadow-2xl relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-sentora-600/20 blur-3xl rounded-full pointer-events-none" />

            <div className="relative max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-4">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Cloud Database Storage</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
                Your journal is stored locally on your device.
              </h2>

              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                Sentora follows a local-first philosophy. Your audio blobs, transcripts, and AI analysis are stored exclusively in your browser's IndexedDB via Dexie.js. No central database collects your personal reflections.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-sentora-400" />
                  <span>IndexedDB Local Storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-violet-400" />
                  <span>Web Crypto PIN Lock</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>On-Demand Sentora AI Processing</span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/app/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors shadow-md"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
            <Mic className="w-4 h-4 text-sentora-600" />
            <span>SENTORA Voice AI Journal</span>
          </div>
          <p>A Privacy-First, Voice-First AI Journaling University Project</p>
        </div>
      </footer>
    </div>
  );
};
