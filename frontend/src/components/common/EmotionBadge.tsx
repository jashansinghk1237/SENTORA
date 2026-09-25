import React from "react";
import { EmotionType } from "../../types";
import { EMOTION_METADATA } from "../../utils/constants";

interface EmotionBadgeProps {
  emotion: EmotionType;
  size?: "sm" | "md" | "lg";
  showEmoji?: boolean;
}

export const EmotionBadge: React.FC<EmotionBadgeProps> = ({
  emotion,
  size = "md",
  showEmoji = true,
}) => {
  const meta = EMOTION_METADATA[emotion] || EMOTION_METADATA.neutral;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3.5 py-1.5 text-sm font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm transition-all ${meta.bgLight} ${meta.bgDark} ${meta.borderLight} ${meta.borderDark} ${sizeClasses[size]}`}
    >
      {showEmoji && <span className="text-xs">{meta.emoji}</span>}
      <span className="capitalize">{meta.label}</span>
    </span>
  );
};
