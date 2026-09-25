export type EmotionType =
  | "happy"
  | "sad"
  | "angry"
  | "stressed"
  | "anxious"
  | "excited"
  | "calm"
  | "neutral";

export interface EmotionScores {
  happy: number;
  sad: number;
  angry: number;
  stressed: number;
  anxious: number;
  excited: number;
  calm: number;
  neutral: number;
}

export interface JournalEntry {
  id: string;
  createdAt: string;
  updatedAt: string;
  transcript: string;
  summary: string;
  primaryEmotion: EmotionType;
  emotionScores: EmotionScores;
  topics: string[];
  keywords: string[];
  audioBlob: Blob | null;
  searchText: string;
  embedding: number[] | null;
}

export interface JournalAnalysisResponse {
  summary: string;
  primaryEmotion: EmotionType;
  emotionScores: EmotionScores;
  topics: string[];
  keywords: string[];
}

export interface JournalStats {
  totalEntries: number;
  entriesThisWeek: number;
  currentStreak: number;
  mostCommonMood: EmotionType | null;
  mostDiscussedTopic: string | null;
}

export interface SearchResult {
  entry: JournalEntry;
  score: number;
  matchedFields: string[];
  matchedKeywords: string[];
  synonymMatches: string[];
}

export interface EmotionMeta {
  label: string;
  color: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  chartValue: number; // 1 to 9 mapped scale for visualization
  emoji: string;
}

export interface ExportDataPayload {
  version: string;
  exportDate: string;
  appName: string;
  entries: Omit<JournalEntry, "audioBlob">[];
}
