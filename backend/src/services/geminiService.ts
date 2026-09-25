import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { EmotionScores, EmotionType, JournalAnalysisResponse } from "../types/journal";

const VALID_EMOTIONS: EmotionType[] = [
  "happy",
  "sad",
  "angry",
  "stressed",
  "anxious",
  "excited",
  "calm",
  "neutral",
];

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName: string;
  private isConfigured: boolean = false;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    if (apiKey && apiKey !== "PASTE_API_KEY_HERE" && apiKey.trim().length > 5) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.isConfigured = true;
      console.log(`[GeminiService] Initialized with model: ${this.modelName}`);
    } else {
      console.warn("[GeminiService] GEMINI_API_KEY is not configured or placeholder. Using intelligent fallback mode for viva/demo.");
    }
  }

  public getStatus() {
    return {
      isConfigured: this.isConfigured,
      model: this.modelName,
    };
  }

  public async analyzeJournal(text: string): Promise<JournalAnalysisResponse> {
    if (!text || text.trim().length === 0) {
      throw new Error("Journal text cannot be empty.");
    }

    if (this.genAI && this.isConfigured) {
      try {
        return await this.callGeminiAPI(text);
      } catch (error: any) {
        console.error("[GeminiService] Gemini API call failed, switching to fallback analysis:", error?.message || error);
        // Fallback to intelligent local analysis if API key is invalid/quota exceeded
        return this.fallbackAnalysis(text);
      }
    }

    return this.fallbackAnalysis(text);
  }

  private async callGeminiAPI(text: string): Promise<JournalAnalysisResponse> {
    if (!this.genAI) throw new Error("Gemini client not initialized");

    const systemInstruction = `You are a journal analysis assistant for Sentora, a privacy-first journaling application.
Analyze the user's journal entry and extract meaningful structure.

CRITICAL GUIDELINES:
1. Do not provide medical diagnosis.
2. Do not claim that the user has a mental health condition.
3. Do not infer serious psychological conditions.
4. Mood analysis is strictly non-clinical and based solely on the text.
5. Primary emotion MUST be one of: "happy", "sad", "angry", "stressed", "anxious", "excited", "calm", "neutral".
6. Emotion scores must each be an integer between 0 and 100 representing emotional presence.
7. Return up to 5 concise relevant topics.
8. Return up to 10 meaningful keywords.
9. Return ONLY valid JSON matching the exact schema. No markdown formatting.`;

    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const prompt = `Analyze this journal entry:\n\n"""\n${text}\n"""\n\nReturn structured JSON with keys: summary, primaryEmotion, emotionScores, topics, keywords.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const parsed = JSON.parse(responseText);

    return this.validateAndNormalizeResponse(parsed, text);
  }

  private validateAndNormalizeResponse(parsed: any, originalText: string): JournalAnalysisResponse {
    let primaryEmotion: EmotionType = "neutral";
    if (parsed.primaryEmotion && VALID_EMOTIONS.includes(parsed.primaryEmotion.toLowerCase())) {
      primaryEmotion = parsed.primaryEmotion.toLowerCase() as EmotionType;
    }

    const emotionScores: EmotionScores = {
      happy: 0,
      sad: 0,
      angry: 0,
      stressed: 0,
      anxious: 0,
      excited: 0,
      calm: 0,
      neutral: 0,
    };

    if (parsed.emotionScores && typeof parsed.emotionScores === "object") {
      VALID_EMOTIONS.forEach((emotion) => {
        const val = Number(parsed.emotionScores[emotion]);
        emotionScores[emotion] = !isNaN(val) ? Math.min(100, Math.max(0, Math.round(val))) : 0;
      });
    }

    // Ensure primary emotion has a meaningful score
    if (emotionScores[primaryEmotion] === 0) {
      emotionScores[primaryEmotion] = 75;
    }

    const topics = Array.isArray(parsed.topics)
      ? parsed.topics.slice(0, 5).map((t: any) => String(t).trim()).filter(Boolean)
      : ["Personal Reflection"];

    const keywords = Array.isArray(parsed.keywords)
      ? parsed.keywords.slice(0, 10).map((k: any) => String(k).trim()).filter(Boolean)
      : ["journal", "thoughts"];

    const summary = typeof parsed.summary === "string" && parsed.summary.trim().length > 0
      ? parsed.summary.trim()
      : originalText.slice(0, 120) + "...";

    return {
      summary,
      primaryEmotion,
      emotionScores,
      topics,
      keywords,
    };
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    if (this.genAI && this.isConfigured) {
      try {
        const embeddingModel = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await embeddingModel.embedContent(text);
        if (result.embedding && result.embedding.values) {
          return result.embedding.values;
        }
      } catch (err) {
        console.warn("[GeminiService] Embedding API unavailable, using local deterministic embedding representation.");
      }
    }

    return this.generateLocalPseudoEmbedding(text);
  }

  // Deterministic local vector generation for fallback hybrid similarity search
  private generateLocalPseudoEmbedding(text: string, dimensions: number = 64): number[] {
    const vector = new Array(dimensions).fill(0);
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
    
    words.forEach((word) => {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash |= 0;
      }
      const index = Math.abs(hash) % dimensions;
      vector[index] += 1;
    });

    // Normalize vector (L2 norm)
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return vector.map((val) => Number((val / magnitude).toFixed(4)));
    }
    return vector;
  }

  // Intelligent fallback analysis when API key is not present or offline
  private fallbackAnalysis(text: string): JournalAnalysisResponse {
    const lower = text.toLowerCase();

    // Sentiment lexical patterns
    const happyWords = ["happy", "good", "great", "joy", "wonderful", "grateful", "blessed", "proud", "fun", "love", "smile", "success"];
    const excitedWords = ["excited", "amazing", "awesome", "looking forward", "thrilled", "can't wait", "energetic", "celebrate"];
    const calmWords = ["calm", "peace", "peaceful", "quiet", "relax", "relaxed", "rest", "coffee", "breeze", "serene", "chill"];
    const stressedWords = ["stressed", "deadline", "pressure", "overwhelmed", "exam", "exams", "busy", "too much", "hectic", "burden"];
    const anxiousWords = ["anxious", "worried", "nervous", "scared", "fear", "uncertain", "doubt", "panic", "hesitant"];
    const sadWords = ["sad", "unhappy", "cry", "lonely", "miss", "grief", "down", "depressed", "disappointed", "hurt"];
    const angryWords = ["angry", "mad", "annoyed", "frustrated", "irritated", "hate", "unfair", "furious", "upset"];

    const countMatches = (words: string[]) => words.reduce((acc, word) => acc + (lower.includes(word) ? 1 : 0), 0);

    const scores: Record<EmotionType, number> = {
      happy: countMatches(happyWords) * 25,
      excited: countMatches(excitedWords) * 25,
      calm: countMatches(calmWords) * 25,
      stressed: countMatches(stressedWords) * 25,
      anxious: countMatches(anxiousWords) * 25,
      sad: countMatches(sadWords) * 25,
      angry: countMatches(angryWords) * 25,
      neutral: 20,
    };

    // Find highest scoring emotion
    let maxEmotion: EmotionType = "neutral";
    let maxScore = 0;
    (Object.keys(scores) as EmotionType[]).forEach((emotion) => {
      if (scores[emotion] > maxScore) {
        maxScore = scores[emotion];
        maxEmotion = emotion;
      }
    });

    // Normalize scores so primary is dominant (60-90) and others have realistic distributions
    const emotionScores: EmotionScores = {
      happy: Math.min(100, scores.happy || 5),
      excited: Math.min(100, scores.excited || 5),
      calm: Math.min(100, scores.calm || 10),
      stressed: Math.min(100, scores.stressed || 5),
      anxious: Math.min(100, scores.anxious || 5),
      sad: Math.min(100, scores.sad || 5),
      angry: Math.min(100, scores.angry || 5),
      neutral: Math.min(100, scores.neutral || 15),
    };

    if (maxScore > 0 && maxEmotion !== "neutral") {
      (emotionScores as any)[maxEmotion] = Math.max(70, Math.min(95, maxScore * 20));
    } else {
      maxEmotion = "calm";
      emotionScores.calm = 65;
      emotionScores.neutral = 50;
    }

    // Extract topics
    const possibleTopics = [
      { name: "Academics & Exams", words: ["exam", "test", "study", "class", "grade", "assignment", "university", "college", "professor", "course", "lecture"] },
      { name: "Projects & Tech", words: ["project", "code", "coding", "software", "app", "build", "development", "program", "work", "task"] },
      { name: "Friends & Social", words: ["friend", "friends", "hangout", "party", "coffee", "talk", "chat", "dinner", "met", "together"] },
      { name: "Health & Wellness", words: ["walk", "run", "gym", "sleep", "tired", "health", "water", "food", "workout", "routine"] },
      { name: "Personal Growth", words: ["goal", "future", "mind", "learn", "learning", "habit", "reflection", "realize", "progress"] },
      { name: "Family & Home", words: ["family", "mom", "dad", "parents", "home", "sister", "brother", "house"] },
    ];

    const extractedTopics: string[] = [];
    possibleTopics.forEach((t) => {
      if (t.words.some((w) => lower.includes(w))) {
        extractedTopics.push(t.name);
      }
    });

    if (extractedTopics.length === 0) {
      extractedTopics.push("Daily Reflection", "Personal Thoughts");
    }

    // Extract keywords (stop words removal)
    const stopWords = new Set(["the", "and", "a", "to", "in", "is", "it", "of", "that", "this", "for", "with", "on", "was", "my", "i", "me", "we", "at", "as", "be", "so", "but"]);
    const cleanedWords = lower
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));
    
    const wordFreq: Record<string, number> = {};
    cleanedWords.forEach((w) => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });

    const keywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([w]) => w);

    if (keywords.length === 0) {
      keywords.push("journal", "reflection", "thoughts");
    }

    // Generate concise summary
    let summary = text.trim();
    if (summary.length > 140) {
      const firstSentence = summary.split(/[.!?]/)[0];
      summary = firstSentence.length > 30 ? firstSentence + "." : summary.slice(0, 130) + "...";
    }

    return {
      summary,
      primaryEmotion: maxEmotion,
      emotionScores,
      topics: extractedTopics.slice(0, 4),
      keywords,
    };
  }
}

export const geminiService = new GeminiService();
