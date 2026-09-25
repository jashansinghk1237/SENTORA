import React from "react";
import { Sparkles } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Processing with Sentora AI...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-sentora-100 dark:border-slate-800 border-t-sentora-600 animate-spin" />
        <Sparkles className="w-6 h-6 text-sentora-600 dark:text-sentora-400 absolute animate-pulse" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{message}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Generating summary, mood classification & topics...
        </p>
      </div>
    </div>
  );
};
