import { Router } from "express";
import {
  analyzeJournalController,
  embedJournalController,
  healthCheckController,
} from "../controllers/journalAnalysisController";

const router = Router();

// Health and status
router.get("/health", healthCheckController);

// AI Journal Analysis (Summary, Mood, Topics, Keywords)
router.post("/analyze-journal", analyzeJournalController);

// Semantic Embedding (Optional)
router.post("/embed-journal", embedJournalController);

export default router;
