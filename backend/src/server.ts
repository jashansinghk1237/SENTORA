import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import journalRoutes from "./routes/journalAnalysisRoutes";

// Load environment variables from backend/.env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(
  cors({
    origin: "*", // Allows local React dev server (e.g. http://localhost:5173)
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logger for academic viva/debugging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use("/api", journalRoutes);

// Root route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Welcome to SENTORA API - A Privacy-First, Voice-First AI Journaling Backend",
    endpoints: {
      health: "GET /api/health",
      analyze: "POST /api/analyze-journal",
      embed: "POST /api/embed-journal",
    },
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Sentora Server Error]:", err);
  res.status(500).json({
    success: false,
    error: err?.message || "Internal Server Error",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 SENTORA Backend Server is running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🧠 AI Analyze Endpoint: POST http://localhost:${PORT}/api/analyze-journal`);
  console.log(`=======================================================`);
});
