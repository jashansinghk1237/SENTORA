import Dexie, { Table } from "dexie";
import { EmotionType, ExportDataPayload, JournalEntry, JournalStats } from "../types";

export class SentoraDatabase extends Dexie {
  public journalEntries!: Table<JournalEntry, string>;

  constructor() {
    super("sentoraDB");

    this.version(1).stores({
      journalEntries: "id, createdAt, updatedAt, primaryEmotion, *topics, *keywords",
    });
  }
}

export const db = new SentoraDatabase();

export const storageService = {
  async getAllEntries(): Promise<JournalEntry[]> {
    return await db.journalEntries.orderBy("createdAt").reverse().toArray();
  },

  async getEntryById(id: string): Promise<JournalEntry | undefined> {
    return await db.journalEntries.get(id);
  },

  async saveEntry(entry: JournalEntry): Promise<string> {
    // Ensure searchText is computed
    const searchTokens = [
      entry.transcript,
      entry.summary,
      ...(entry.topics || []),
      ...(entry.keywords || []),
      entry.primaryEmotion,
    ].join(" ").toLowerCase();

    const preparedEntry: JournalEntry = {
      ...entry,
      searchText: searchTokens,
      updatedAt: new Date().toISOString(),
    };

    await db.journalEntries.put(preparedEntry);
    return preparedEntry.id;
  },

  async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<void> {
    const existing = await db.journalEntries.get(id);
    if (!existing) throw new Error(`Journal entry ${id} not found.`);

    const merged: JournalEntry = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const searchTokens = [
      merged.transcript,
      merged.summary,
      ...(merged.topics || []),
      ...(merged.keywords || []),
      merged.primaryEmotion,
    ].join(" ").toLowerCase();

    merged.searchText = searchTokens;

    await db.journalEntries.put(merged);
  },

  async deleteEntry(id: string): Promise<void> {
    await db.journalEntries.delete(id);
  },

  async clearAllData(): Promise<void> {
    await db.journalEntries.clear();
  },

  async calculateStats(): Promise<JournalStats> {
    const entries = await this.getAllEntries();

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        entriesThisWeek: 0,
        currentStreak: 0,
        mostCommonMood: null,
        mostDiscussedTopic: null,
      };
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Entries this week
    const entriesThisWeek = entries.filter((e) => new Date(e.createdAt) >= oneWeekAgo).length;

    // Mood frequency
    const moodCounts: Partial<Record<EmotionType, number>> = {};
    const topicCounts: Record<string, number> = {};

    entries.forEach((e) => {
      moodCounts[e.primaryEmotion] = (moodCounts[e.primaryEmotion] || 0) + 1;
      (e.topics || []).forEach((t) => {
        topicCounts[t] = (topicCounts[t] || 0) + 1;
      });
    });

    let mostCommonMood: EmotionType | null = null;
    let maxMoodCount = 0;
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count && count > maxMoodCount) {
        maxMoodCount = count;
        mostCommonMood = mood as EmotionType;
      }
    });

    let mostDiscussedTopic: string | null = null;
    let maxTopicCount = 0;
    Object.entries(topicCounts).forEach(([topic, count]) => {
      if (count > maxTopicCount) {
        maxTopicCount = count;
        mostDiscussedTopic = topic;
      }
    });

    // Calculate journaling streak in days
    const uniqueDates = Array.from(
      new Set(entries.map((e) => new Date(e.createdAt).toISOString().split("T")[0]))
    ).sort().reverse();

    let streak = 0;
    let checkDate = new Date();
    // Allow today or yesterday as start of streak
    const todayStr = checkDate.toISOString().split("T")[0];
    const yesterdayDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

    if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
      let currentCheck = uniqueDates.includes(todayStr) ? checkDate : yesterdayDate;
      for (const dateStr of uniqueDates) {
        const expectedStr = currentCheck.toISOString().split("T")[0];
        if (dateStr === expectedStr) {
          streak++;
          currentCheck = new Date(currentCheck.getTime() - 24 * 60 * 60 * 1000);
        } else if (dateStr < expectedStr) {
          break;
        }
      }
    }

    return {
      totalEntries: entries.length,
      entriesThisWeek,
      currentStreak: Math.max(1, streak),
      mostCommonMood,
      mostDiscussedTopic,
    };
  },

  async exportData(): Promise<string> {
    const entries = await this.getAllEntries();
    const sanitizedEntries = entries.map(({ audioBlob, ...rest }) => rest);
    
    const payload: ExportDataPayload = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      appName: "Sentora Voice AI Journal",
      entries: sanitizedEntries,
    };

    return JSON.stringify(payload, null, 2);
  },

  async importData(jsonString: string): Promise<number> {
    const parsed = JSON.parse(jsonString);
    const entries: JournalEntry[] = (parsed.entries || parsed).map((raw: any) => ({
      ...raw,
      audioBlob: null,
      searchText: [
        raw.transcript || "",
        raw.summary || "",
        ...(raw.topics || []),
        ...(raw.keywords || []),
        raw.primaryEmotion || "",
      ].join(" ").toLowerCase(),
    }));

    if (!Array.isArray(entries) || entries.length === 0) {
      throw new Error("No valid journal entries found in file.");
    }

    await db.journalEntries.bulkPut(entries);
    return entries.length;
  },
};
