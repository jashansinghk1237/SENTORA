import React, { useState } from "react";
import { Lock, KeyRound, AlertCircle, Shield } from "lucide-react";
import { useAuthLock } from "../../context/AuthLockContext";

export const PinModal: React.FC = () => {
  const { isLocked, unlockWithPin } = useAuthLock();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLocked) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 8) {
      setPin((prev) => prev + num);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin("");
    setError(null);
  };

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) {
      setError("Please enter your PIN");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await unlockWithPin(pin);
      if (!success) {
        setError("Incorrect PIN. Please try again.");
        setPin("");
      }
    } catch (err: any) {
      setError("Unlock error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-sentora-100 dark:bg-sentora-950/60 border border-sentora-200 dark:border-sentora-800 flex items-center justify-center text-sentora-600 dark:text-sentora-400">
          <Lock className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sentora is Locked</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enter your 4-digit Local Journal Lock PIN to access your memories.
        </p>

        {error && (
          <div className="mt-3 flex items-center justify-center gap-1.5 p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs rounded-xl border border-rose-200 dark:border-rose-900">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}

        {/* PIN Indicators */}
        <div className="flex justify-center items-center gap-3 my-5">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                pin.length > idx
                  ? "bg-sentora-600 border-sentora-600 scale-110"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto mb-5">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-lg border border-slate-200/80 dark:border-slate-700/80 active:scale-95 transition-all focus:outline-none"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium border border-slate-200/80 dark:border-slate-700/80 active:scale-95 transition-all"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("0")}
            className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-lg border border-slate-200/80 dark:border-slate-700/80 active:scale-95 transition-all"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium border border-slate-200/80 dark:border-slate-700/80 active:scale-95 transition-all"
          >
            ⌫
          </button>
        </div>

        <button
          type="button"
          onClick={() => handleUnlock()}
          disabled={pin.length < 4 || isSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-sentora-600 hover:bg-sentora-700 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-md shadow-sentora-600/20 flex items-center justify-center gap-2"
        >
          <KeyRound className="w-4 h-4" />
          <span>{isSubmitting ? "Verifying..." : "Unlock Journal"}</span>
        </button>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <Shield className="w-3.5 h-3.5 text-sentora-500" />
          <span>Web Crypto Local-First Protection</span>
        </div>
      </div>
    </div>
  );
};
