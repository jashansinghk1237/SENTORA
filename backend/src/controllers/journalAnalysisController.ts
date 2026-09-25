import { Request, Response } from "express";
import { z } from "zod";
import { geminiService } from "../services/geminiService";

const analyzeJournalSchema = z.object({
  text: z.string().min(1, "Journal text cannot be empty").max(10000, "Journal text is too long (maximum 10,000 characters)"),
});

export const analyzeJournalController = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = analyzeJournalSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.errors[0]?.message || "Invalid input data",
      });
      return;
    }

    const { text } = parseResult.data;
    const analysis = await geminiService.analyzeJournal(text);

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    console.error("[Controller Error - analyzeJournal]:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze journal entry. Please try again.",
    });
  }
};

export const embedJournalController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      res.status(400).json({ success: false, error: "Text is required for embedding generation" });
      return;
    }

    const embedding = await geminiService.generateEmbedding(text);
    res.status(200).json({
      success: true,
      data: { embedding },
    });
  } catch (error: any) {
    console.error("[Controller Error - embedJournal]:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate embedding.",
    });
  }
};

export const healthCheckController = (req: Request, res: Response): void => {
  const status = geminiService.getStatus();
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Sentora Backend API",
    gemini: {
      configured: status.isConfigured,
      model: status.model,
    },
  });
};
