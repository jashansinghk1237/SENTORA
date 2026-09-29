import { JournalAnalysisResponse } from "../types";

// Base API URL:
// In production unified mode (Render single-service) or local dev proxy, defaults to "/api".
// In decoupled mode (e.g. Vercel frontend + Render backend), reads VITE_API_BASE_URL.
const rawApiBase = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");
const API_BASE = rawApiBase ? (rawApiBase.endsWith("/api") ? rawApiBase : `${rawApiBase}/api`) : "/api";

export const geminiApiService = {
  async analyzeJournal(text: string): Promise<JournalAnalysisResponse> {
    if (!text || text.trim().length === 0) {
      throw new Error("Journal transcript cannot be empty.");
    }

    try {
      const response = await fetch(`${API_BASE}/analyze-journal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      return data.data as JournalAnalysisResponse;
    } catch (error: any) {
      console.error("[geminiApiService error]:", error);
      throw new Error(
        error.message || "Could not connect to Sentora backend. Make sure the backend server is running."
      );
    }
  },

  async getHealth(): Promise<{ status: string; gemini: { configured: boolean; model: string } }> {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (!response.ok) throw new Error("Health check failed");
      return await response.json();
    } catch (err: any) {
      return {
        status: "offline",
        gemini: { configured: false, model: "disconnected" },
      };
    }
  },
};
