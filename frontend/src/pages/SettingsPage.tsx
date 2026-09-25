import React, { useState, useEffect, useRef } from "react";
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Lock,
  Unlock,
  Download,
  Upload,
  Trash2,
  Sparkles,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Database,
  RefreshCw,
  Info,
} from "lucide-react";
import { useAuthLock } from "../context/AuthLockContext";
import { storageService } from "../services/storageService";
import { SAMPLE_DEMO_ENTRIES } from "../data/demoData";
import { ConfirmModal } from "../components/common/ConfirmModal";

export const SettingsPage: React.FC = () => {
  const { isPinEnabled, enablePin, disablePin, changePin } = useAuthLock();

  // Local state for PIN setup
  const [pinInput, setPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [oldPinInput, setOldPinInput] = useState("");
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);

  // Modals & File Ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleEnablePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinSuccess(null);

    if (pinInput.length < 4) {
      setPinError("PIN must be at least 4 digits.");
      return;
    }

    if (pinInput !== confirmPinInput) {
      setPinError("PINs do not match.");
      return;
    }

    try {
      await enablePin(pinInput);
      setPinInput("");
      setConfirmPinInput("");
      setPinSuccess("Local Journal Lock enabled successfully!");
    } catch (err: any) {
      setPinError(err.message || "Failed to set PIN.");
    }
  };

  const handleDisablePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinSuccess(null);

    if (!oldPinInput) {
      setPinError("Enter your current PIN to disable.");
      return;
    }

    const success = await disablePin(oldPinInput);
    if (success) {
      setOldPinInput("");
      setPinSuccess("Local Journal Lock disabled.");
    } else {
      setPinError("Incorrect current PIN.");
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinSuccess(null);

    if (pinInput.length < 4) {
      setPinError("New PIN must be at least 4 digits.");
      return;
    }

    if (pinInput !== confirmPinInput) {
      setPinError("New PINs do not match.");
      return;
    }

    const success = await changePin(oldPinInput, pinInput);
    if (success) {
      setOldPinInput("");
      setPinInput("");
      setConfirmPinInput("");
      setIsChangingPin(false);
      setPinSuccess("PIN updated successfully.");
    } else {
      setPinError("Incorrect current PIN.");
    }
  };

  const handleExportData = async () => {
    setStatusMessage(null);
    try {
      const jsonStr = await storageService.exportData();
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sentora-journal-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMessage({ type: "success", text: "Journal data exported successfully as JSON." });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "Failed to export journal data." });
    }
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const count = await storageService.importData(content);
        setStatusMessage({ type: "success", text: `Successfully imported ${count} journal entries!` });
      } catch (err: any) {
        setStatusMessage({ type: "error", text: err.message || "Failed to import JSON file." });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleLoadDemoData = async () => {
    setStatusMessage(null);
    try {
      for (const item of SAMPLE_DEMO_ENTRIES) {
        await storageService.saveEntry(item);
      }
      setStatusMessage({
        type: "success",
        text: `Loaded 12 realistic academic demo entries spanning 30 days! Check your Timeline and Insights.`,
      });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "Failed to load demo dataset." });
    }
  };

  const handleClearAllData = async () => {
    setIsClearing(true);
    setStatusMessage(null);
    try {
      await storageService.clearAllData();
      setStatusMessage({ type: "success", text: "All local journal memories cleared." });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "Failed to clear data." });
    } finally {
      setIsClearing(false);
      setShowClearModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-sentora-100 dark:bg-sentora-950/60 text-sentora-700 dark:text-sentora-300 text-xs font-semibold">
          <SettingsIcon className="w-3.5 h-3.5 text-sentora-600 dark:text-sentora-400" />
          <span>Application Settings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings & Privacy
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your local browser storage, PIN security, data backup, and demo datasets.
        </p>
      </div>

      {/* Status feedback message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-medium ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 1. Privacy Statement Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Privacy Architecture
            </h2>
            <p className="text-xs text-slate-400">Local-First Storage Philosophy</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed space-y-2">
          <p className="font-semibold text-emerald-950 dark:text-emerald-100">
            "Your journal entries are stored locally in your browser."
          </p>
          <p>
            Sentora uses IndexedDB via Dexie.js to store all your audio recordings, transcripts, summaries, and search metadata directly on your device.
          </p>
          <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
            * AI analysis processes only the active journal text using Sentora AI when you explicitly click "Analyze My Journal". Your saved journal history remains stored locally in your browser.
          </p>
        </div>
      </div>

      {/* 2. Local Journal Lock (PIN) Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sentora-100 dark:bg-sentora-950/50 text-sentora-600 dark:text-sentora-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Local Journal Lock
              </h2>
              <p className="text-xs text-slate-400">
                Client-side PIN protection using Web Crypto API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isPinEnabled
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {isPinEnabled ? "Lock Enabled" : "Lock Disabled"}
            </span>
          </div>
        </div>

        {/* PIN Feedback alert */}
        {pinError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{pinError}</span>
          </div>
        )}
        {pinSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{pinSuccess}</span>
          </div>
        )}

        {/* PIN Form State */}
        {!isPinEnabled ? (
          <form onSubmit={handleEnablePin} className="space-y-4 max-w-md">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Create a 4-digit PIN to lock your Sentora session when away from your computer.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Create PIN (4+ digits)
                </label>
                <input
                  type="password"
                  maxLength={8}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sentora-500 font-mono tracking-widest text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  maxLength={8}
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sentora-500 font-mono tracking-widest text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-sentora-600 hover:bg-sentora-700 text-white rounded-xl text-xs font-medium shadow-sm transition-all flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Enable Local Journal Lock</span>
            </button>
          </form>
        ) : isChangingPin ? (
          <form onSubmit={handleChangePin} className="space-y-4 max-w-md">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Current PIN
                </label>
                <input
                  type="password"
                  value={oldPinInput}
                  onChange={(e) => setOldPinInput(e.target.value)}
                  placeholder="Current PIN"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sentora-500 font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    New PIN
                  </label>
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="New PIN"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sentora-500 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Confirm New PIN
                  </label>
                  <input
                    type="password"
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value)}
                    placeholder="Confirm"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sentora-500 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-sentora-600 hover:bg-sentora-700 text-white rounded-xl text-xs font-medium transition-all"
              >
                Save New PIN
              </button>
              <button
                type="button"
                onClick={() => setIsChangingPin(false)}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 max-w-md">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your local journal session is protected by a PIN.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsChangingPin(true)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition-all"
              >
                Change PIN
              </button>
            </div>

            {/* Disable PIN form */}
            <form onSubmit={handleDisablePin} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Disable PIN (Enter current PIN):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={oldPinInput}
                  onChange={(e) => setOldPinInput(e.target.value)}
                  placeholder="Enter current PIN"
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-300 rounded-xl text-xs font-medium border border-rose-200 dark:border-rose-900 transition-colors"
                >
                  Disable Lock
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-[11px] text-slate-400 dark:text-slate-500 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            Clear label: Local Journal Lock protects this browser session from casual inspection. It does not claim military-grade or remote cloud security.
          </span>
        </div>
      </div>

      {/* 3. Data Management Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Data Management & Backup
            </h2>
            <p className="text-xs text-slate-400">Export, import, or wipe your local IndexedDB memories</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Export Button */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-sentora-600" />
                <span>Export Journal</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Download a clean JSON archive of all your transcripts, summaries, and topics.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              className="w-full py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-medium transition-colors"
            >
              Export JSON File
            </button>
          </div>

          {/* Import Button */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-violet-600" />
                <span>Import Journal</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Restore previously exported JSON files into this browser.
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleImportFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-medium transition-colors"
              >
                Choose JSON File
              </button>
            </div>
          </div>

          {/* Clear All Data */}
          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-2 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Clear All Data</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Permanently erase all journal entries and recordings from IndexedDB.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors shadow-sm"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* 4. Demo Data Generator for Viva Presentation */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Academic Demo Dataset
              </h2>
              <p className="text-xs text-slate-400">
                Instantly populate Sentora with realistic journal entries for presentation
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Injects 12 realistic university student journal entries across 30 days featuring varied emotions (excited, stressed, calm, happy, anxious, angry), academic themes, and topics to demonstrate timeline filters, smart synonym search, and analytics charts.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleLoadDemoData}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Data (12 Entries)</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearModal}
        title="Clear All Journal Data?"
        message="Are you sure you want to permanently delete all journal memories, audio blobs, and metadata from IndexedDB? This action is irreversible."
        confirmText="Yes, Clear All Data"
        isDanger={true}
        onConfirm={handleClearAllData}
        onCancel={() => setShowClearModal(false)}
      />
    </div>
  );
};
