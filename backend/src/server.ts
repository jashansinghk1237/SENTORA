import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import journalRoutes from "./routes/journalAnalysisRoutes";

// Load environment variables from backend/.env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy for cloud deployments (Render, Railway, Fly.io, AWS)
app.set("trust proxy", 1);

// Security & Middleware
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(
  cors({
    origin: corsOrigin === "*" ? "*" : corsOrigin.split(",").map((o: string) => o.trim()),
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

// Candidate paths for frontend production build
const candidateDistPaths = [
  path.resolve(__dirname, "../../frontend/dist"),
  path.resolve(__dirname, "../frontend/dist"),
  path.resolve(__dirname, "public"),
  path.resolve(process.cwd(), "frontend/dist"),
  path.resolve(process.cwd(), "../frontend/dist"),
];

const frontendDist = candidateDistPaths.find((p) => fs.existsSync(path.join(p, "index.html")));

if (frontendDist) {
  console.log(`[Sentora Server] Serving frontend static assets from: ${frontendDist}`);
  app.use(express.static(frontendDist));

  // SPA fallback for client-side React routes
  app.get("*", (req: Request, res: Response) => {
    if (req.originalUrl.startsWith("/api")) {
      return res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
    }
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  // Root route for API-only mode
  app.get("/", (_req: Request, res: Response) => {
    res.json({
      message: "Welcome to SENTORA API - A Privacy-First, Voice-First AI Journaling Backend",
      mode: "API Only (Frontend not built in static directory)",
      endpoints: {
        health: "GET /api/health",
        analyze: "POST /api/analyze-journal",
        embed: "POST /api/embed-journal",
      },
    });
  });
}

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
