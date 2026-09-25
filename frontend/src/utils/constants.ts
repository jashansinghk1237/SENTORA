import { EmotionMeta, EmotionType } from "../types";

export const EMOTION_METADATA: Record<EmotionType, EmotionMeta> = {
  excited: {
    label: "Excited",
    color: "#eab308", // yellow-500
    bgLight: "bg-yellow-50 text-yellow-800",
    bgDark: "dark:bg-yellow-950/40 dark:text-yellow-300",
    borderLight: "border-yellow-200",
    borderDark: "dark:border-yellow-800",
    chartValue: 9,
    emoji: "⚡",
  },
  happy: {
    label: "Happy",
    color: "#10b981", // emerald-500
    bgLight: "bg-emerald-50 text-emerald-800",
    bgDark: "dark:bg-emerald-950/40 dark:text-emerald-300",
    borderLight: "border-emerald-200",
    borderDark: "dark:border-emerald-800",
    chartValue: 8,
    emoji: "✨",
  },
  calm: {
    label: "Calm",
    color: "#14b8a6", // teal-500
    bgLight: "bg-teal-50 text-teal-800",
    bgDark: "dark:bg-teal-950/40 dark:text-teal-300",
    borderLight: "border-teal-200",
    borderDark: "dark:border-teal-800",
    chartValue: 7,
    emoji: "🌿",
  },
  neutral: {
    label: "Neutral",
    color: "#64748b", // slate-500
    bgLight: "bg-slate-100 text-slate-800",
    bgDark: "dark:bg-slate-800/60 dark:text-slate-300",
    borderLight: "border-slate-200",
    borderDark: "dark:border-slate-700",
    chartValue: 5,
    emoji: "☁️",
  },
  anxious: {
    label: "Anxious",
    color: "#a855f7", // purple-500
    bgLight: "bg-purple-50 text-purple-800",
    bgDark: "dark:bg-purple-950/40 dark:text-purple-300",
    borderLight: "border-purple-200",
    borderDark: "dark:border-purple-800",
    chartValue: 4,
    emoji: "🌀",
  },
  stressed: {
    label: "Stressed",
    color: "#f97316", // orange-500
    bgLight: "bg-orange-50 text-orange-800",
    bgDark: "dark:bg-orange-950/40 dark:text-orange-300",
    borderLight: "border-orange-200",
    borderDark: "dark:border-orange-800",
    chartValue: 3,
    emoji: "🔥",
  },
  sad: {
    label: "Sad",
    color: "#60a5fa", // blue-400
    bgLight: "bg-blue-50 text-blue-800",
    bgDark: "dark:bg-blue-950/40 dark:text-blue-300",
    borderLight: "border-blue-200",
    borderDark: "dark:border-blue-800",
    chartValue: 2,
    emoji: "🌧️",
  },
  angry: {
    label: "Angry",
    color: "#f43f5e", // rose-500
    bgLight: "bg-rose-50 text-rose-800",
    bgDark: "dark:bg-rose-950/40 dark:text-rose-300",
    borderLight: "border-rose-200",
    borderDark: "dark:border-rose-800",
    chartValue: 1,
    emoji: "💥",
  },
};

export const ALL_EMOTIONS: EmotionType[] = [
  "happy",
  "sad",
  "angry",
  "stressed",
  "anxious",
  "excited",
  "calm",
  "neutral",
];

// Rich synonym dictionary for Smart Memory Search hybrid expansion
export const SYNONYM_DICTIONARY: Record<string, string[]> = {
  stressed: ["stress", "worried", "pressure", "deadline", "overwhelmed", "panic", "hectic", "tension", "burden", "exhausted"],
  college: ["university", "class", "exam", "assignment", "project", "course", "professor", "homework", "study", "presentation", "semester", "campus", "lecture"],
  exams: ["exam", "test", "finals", "midterms", "quiz", "grades", "studying", "revision"],
  friends: ["friend", "friends", "buddy", "people", "hangout", "group", "mate", "crew", "roommates", "social"],
  happy: ["good", "great", "joy", "excited", "enjoyed", "wonderful", "fun", "glad", "smiling", "thrilled", "content", "delighted"],
  sad: ["down", "upset", "cry", "lonely", "unhappy", "grief", "blue", "sorrow", "tears", "depressed", "disappointed", "hurt"],
  angry: ["mad", "frustrated", "annoyed", "irritating", "hate", "rage", "pissed", "argument", "conflict", "furious"],
  calm: ["relax", "relaxed", "peace", "peaceful", "serene", "chill", "quiet", "zen", "rest", "tranquil", "coffee", "breeze"],
  anxious: ["nervous", "scared", "fear", "uneasy", "doubtful", "apprehensive", "overthinking", "jittery", "uncertain"],
  health: ["workout", "gym", "sleep", "diet", "running", "walk", "sick", "tired", "energy", "fitness", "wellness"],
  work: ["job", "internship", "interview", "office", "boss", "career", "salary", "resume", "task", "meeting"],
  project: ["code", "coding", "software", "development", "feature", "bug", "sentora", "app", "demo", "repo"],
};
