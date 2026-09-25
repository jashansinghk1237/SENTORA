# Walkthrough - SENTORA: A Privacy-First, Voice-First AI Journaling Application

**Sentora** has been fully created and verified as a complete, full-stack university final-year / exploratory web application.

---

## 🌟 What Was Built

### 1. Full-Stack Architecture & Security
- **Express + TypeScript Backend (`/backend`)**:
  - `POST /api/analyze-journal`: Prompts Google Gemini AI with a non-clinical "Journal Analysis Assistant" system instruction and receives structured JSON.
  - Strict security design: `GEMINI_API_KEY` is kept in `backend/.env` and **never exposed** to the frontend React code.
  - Intelligent fallback / simulation mode ensures that even without an active key or offline, university examiners can test all user flows smoothly.
  - `GET /api/health`: Health status endpoint.
- **Vite + React + TypeScript Frontend (`/frontend`)**:
  - Calm, modern aesthetic with deep indigo/purple accents, dark/light theme switching, and emotion color badges.
  - Client-side routing with React Router across 8 core views.

---

### 2. Core Features & Technology Integrations

| Feature | Technology | Implementation Detail |
| :--- | :--- | :--- |
| **Microphone Recording** | MediaRecorder API | Real-time audio waveform visualizer, pause/resume, timer, and audio blob generation. |
| **Voice-to-Text** | Web Speech API | Live stream speech transcription into an editable text area with browser compatibility checks. |
| **AI Multi-Dimensional Analysis** | Google Gemini AI | Returns summary, 8 emotion intensity scores (0–100), primary emotion, topics, and keywords. |
| **Local-First Database** | IndexedDB (Dexie.js) | Stores audio blobs, transcripts, summaries, and search metadata inside `sentoraDB` on the client. |
| **Smart Memory Search** | Local Hybrid Search | Token scoring + exact matching + synonym dictionary expansion (e.g., *exams* $\rightarrow$ *stressed, study, pressure*). |
| **Personal Analytics** | Recharts | Mood trend timeline (mapped 1–9 with non-clinical disclaimer), emotion distribution donut chart, topic frequency bar chart, and daily activity chart. |
| **Local Journal Lock** | Web Crypto API | SHA-256 salted PIN hashing stored in `localStorage` for session privacy. |
| **Data Backup & Demo Data** | JSON Export/Import | Full JSON export/import and a 12-entry academic demo dataset for presentations. |

---

## 📸 Pages & Navigation Breakdown

1. **Landing Page (`/`)**:
   - Hero header: *"Your thoughts. Your voice. Your private space."*
   - Subheading & Quick CTAs (*Start Journaling*, *View Timeline*).
   - "How Sentora Works" 3-step guide & Privacy architecture callout.
2. **Personal Dashboard (`/app/dashboard`)**:
   - Greeting (*Good morning/afternoon/evening*), Current Date, Quick Journal CTA.
   - 5 Statistics cards: Total Entries, This Week, Journaling Streak 🔥, Top Mood, Top Topic.
   - Mood Flow trajectory chart and Recent 5 Journal entries.
3. **Voice Recording Studio (`/app/record`)**:
   - Animated recording button with audio visualizer level bars and timer.
   - Live speech recognition stream with fallback message for unsupported browsers.
   - Editable transcript box for correcting words or manual typing.
   - "Analyze My Journal" action with Gemini AI analysis preview (progress bars for 8 emotions, topics, keywords) and local IndexedDB save with celebratory confetti.
4. **Journal Timeline (`/app/timeline`)**:
   - Chronological journal feed with timeline nodes.
   - Filter pills for all 8 emotions (`happy`, `sad`, `angry`, `stressed`, `anxious`, `excited`, `calm`, `neutral`).
   - Topic dropdown filter and sort toggle (*Newest First* / *Oldest First*).
5. **Entry Details (`/app/entry/:id`)**:
   - Full transcript, AI summary, primary mood badge, emotion spectrum bars (0–100), topics, and keywords.
   - Audio player for listening to the original voice recording.
   - Inline transcript editing and **"Reprocess with Gemini AI"** action.
   - Safe deletion with confirmation modal.
6. **Smart Memory Search (`/app/search`)**:
   - Local hybrid search engine with sample queries (*"When was I worried about exams?"*, *"Show entries about college projects"*).
   - Relevance score tags (`Score: +18`), matched fields breakdown, and synonym expansion explanation.
7. **Insights & Trends (`/app/insights`)**:
   - Non-clinical academic disclaimer alert.
   - Mood Trend Timeline (mapped 1 to 9).
   - Emotion Distribution Donut chart.
   - Topic Frequency vertical Bar chart.
   - 14-day Journal Activity volume chart.
8. **Settings & Privacy (`/app/settings`)**:
   - Privacy architecture statement (*"Your journal entries are stored locally in your browser"*).
   - Local Journal Lock management (Enable PIN, Change PIN, Disable PIN).
   - Export Journal (downloads formatted JSON) & Import JSON.
   - Clear All Data with danger confirmation modal.
   - **Load Demo Data (12 Entries)** for viva / evaluation.

---

## 🧪 Verification & Build Results

### Automated Build Verification
Both frontend and backend compiled successfully:
```bash
> sentora-backend@1.0.0 build
> tsc (Success, 0 errors)

> frontend@0.0.0 build
> tsc && vite build
✓ 2429 modules transformed.
dist/index.html                   0.94 kB
dist/assets/index-e_Ie9dSF.css   47.67 kB
dist/assets/index-tAwN8xz1.js   882.86 kB
✓ built in 2.78s
```

---

## 🚀 How to Run the Application

From the project root (`e:\Sentora`):

```bash
# 1. Start both Backend and Frontend concurrently
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **Backend Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

To configure your live Gemini API key, edit `backend/.env`:
```env
PORT=5000
GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY
GEMINI_MODEL=gemini-1.5-flash
```
