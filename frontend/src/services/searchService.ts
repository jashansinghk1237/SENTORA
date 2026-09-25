import { JournalEntry, SearchResult, EmotionType } from "../types";
import { ALL_EMOTIONS, SYNONYM_DICTIONARY } from "../utils/constants";

export const searchService = {
  /**
   * Performs a local hybrid search across all journal entries using exact matching,
   * token matching, topic/keyword matching, emotion detection, and synonym expansion.
   */
  search(entries: JournalEntry[], query: string, filterEmotion?: string): SearchResult[] {
    if (!query.trim() && !filterEmotion) {
      return entries.map((entry) => ({
        entry,
        score: 1,
        matchedFields: ["all"],
        matchedKeywords: [],
        synonymMatches: [],
      }));
    }

    const rawTerms = query
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1);

    // Expand search terms with synonym dictionary
    const expandedSynonyms: Record<string, string[]> = {};
    const allSearchTerms = new Set<string>(rawTerms);

    rawTerms.forEach((term) => {
      // Direct lookup in dictionary
      if (SYNONYM_DICTIONARY[term]) {
        SYNONYM_DICTIONARY[term].forEach((syn) => {
          allSearchTerms.add(syn.toLowerCase());
          expandedSynonyms[syn.toLowerCase()] = [term];
        });
      }

      // Check reverse mappings
      Object.entries(SYNONYM_DICTIONARY).forEach(([base, list]) => {
        if (list.includes(term) || base === term) {
          list.forEach((syn) => {
            allSearchTerms.add(syn.toLowerCase());
            expandedSynonyms[syn.toLowerCase()] = [base];
          });
          allSearchTerms.add(base);
        }
      });
    });

    const results: SearchResult[] = [];

    entries.forEach((entry) => {
      // If emotion filter active
      if (filterEmotion && filterEmotion !== "all" && entry.primaryEmotion !== filterEmotion) {
        return;
      }

      let score = 0;
      const matchedFields = new Set<string>();
      const matchedKeywords = new Set<string>();
      const synonymMatches = new Set<string>();

      const transcriptLower = entry.transcript.toLowerCase();
      const summaryLower = entry.summary.toLowerCase();
      const topicsLower = (entry.topics || []).map((t) => t.toLowerCase());
      const keywordsLower = (entry.keywords || []).map((k) => k.toLowerCase());
      const emotionLower = entry.primaryEmotion.toLowerCase();

      // 1. Exact phrase match in transcript or summary (+5)
      const cleanQuery = query.toLowerCase().trim();
      if (cleanQuery.length > 3) {
        if (transcriptLower.includes(cleanQuery)) {
          score += 5;
          matchedFields.add("Transcript (Exact)");
        }
        if (summaryLower.includes(cleanQuery)) {
          score += 5;
          matchedFields.add("Summary (Exact)");
        }
      }

      // 2. Emotion matching (+3)
      if (rawTerms.includes(emotionLower)) {
        score += 3;
        matchedFields.add("Primary Mood");
        matchedKeywords.add(entry.primaryEmotion);
      }

      // Check each search term (original & synonym expanded)
      allSearchTerms.forEach((term) => {
        const isSynonym = !rawTerms.includes(term);

        // Topic Match (+4 for direct, +2 for synonym)
        const matchedTopic = topicsLower.some((t) => t.includes(term));
        if (matchedTopic) {
          score += isSynonym ? 2 : 4;
          matchedFields.add("Topics");
          if (isSynonym) synonymMatches.add(term);
          else matchedKeywords.add(term);
        }

        // Summary Match (+4 for direct, +2 for synonym)
        if (summaryLower.includes(term)) {
          score += isSynonym ? 2 : 4;
          matchedFields.add("Summary");
          if (isSynonym) synonymMatches.add(term);
          else matchedKeywords.add(term);
        }

        // Keywords Match (+3 for direct, +2 for synonym)
        const matchedKw = keywordsLower.some((k) => k.includes(term));
        if (matchedKw) {
          score += isSynonym ? 2 : 3;
          matchedFields.add("Keywords");
          if (isSynonym) synonymMatches.add(term);
          else matchedKeywords.add(term);
        }

        // Transcript Token Match (+1)
        if (transcriptLower.includes(term)) {
          score += isSynonym ? 1 : 2;
          matchedFields.add("Transcript");
          if (isSynonym) synonymMatches.add(term);
          else matchedKeywords.add(term);
        }
      });

      if (score > 0 || !query.trim()) {
        results.push({
          entry,
          score: Math.min(100, score),
          matchedFields: Array.from(matchedFields),
          matchedKeywords: Array.from(matchedKeywords),
          synonymMatches: Array.from(synonymMatches),
        });
      }
    });

    // Sort by relevance score descending
    return results.sort((a, b) => b.score - a.score);
  },

  /**
   * Helper to calculate cosine similarity between two vector embeddings
   */
  calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  },
};
