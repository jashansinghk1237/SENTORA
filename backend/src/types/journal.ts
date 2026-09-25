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

export interface JournalAnalysisResponse {
  summary: string;
  primaryEmotion: EmotionType;
  emotionScores: EmotionScores;
  topics: string[];
  keywords: string[];
}

export interface AnalyzeJournalRequest {
  text: string;
}

export interface EmbeddingRequest {
  text: string;
}

export interface EmbeddingResponse {
  embedding: number[];
}
