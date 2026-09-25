# SENTORA: A Privacy-First, Voice-First AI Journaling Application

> **University Final-Year / Capstone Project**  
> **Topic:** Privacy-Preserving Intelligent Voice Systems & Human-Computer Interaction  
> **Technologies:** React, TypeScript, Node.js/Express, Google Gemini AI, IndexedDB (Dexie.js), Web Speech API, MediaRecorder API, Web Crypto API, Recharts, Tailwind CSS.

---

## 📌 1. Project Purpose & Overview

**Sentora** is a privacy-first, voice-first AI journaling web application built to make personal reflection effortless, expressive, and secure. Instead of typing long diary entries, users can simply speak their thoughts.

### Core Capabilities
1. 🎙️ **Voice Recording:** Captures high-fidelity microphone audio using the browser's native **MediaRecorder API**.
2. 🗣️ **Live Voice-to-Text:** Streams speech into an editable transcript in real time using the **Web Speech API** (with browser compatibility fallbacks).
3. ✍️ **Editable Transcripts:** Users retain complete editorial control to refine transcripts, delete text, or add manual notes before AI processing.
4. 🧠 **Gemini AI Analysis:** Sends the journal text to a secure backend that prompts Google Gemini AI for structured emotional and thematic analysis.
5. 📊 **Multi-Dimensional Reflection:**
   - Concise 1–2 sentence journal summary
   - Primary emotional classification (from 8 distinct emotions: `happy`, `sad`, `angry`, `stressed`, `anxious`, `excited`, `calm`, `neutral`)
   - Emotion intensity presence scores (0–100)
   - Extracted thematic topics (e.g., `#Academics & Exams`, `#Projects & Tech`)
   - Meaningful searchable keywords
6. 💾 **100% Local Storage:** Stores transcripts, summaries, and audio blobs exclusively inside **IndexedDB** using **Dexie.js**. No cloud database is required.
7. 🔍 **Smart Memory Search:** Local hybrid search engine utilizing exact keyword matching, token scoring, and an expanded **Synonym Dictionary**.
8. 📈 **Personal Analytics & Trends:** Interactive charts rendered with **Recharts** displaying mood trajectories, emotion distributions, and activity heatmaps.
9. 🔐 **Local Journal Lock:** PIN-protected session lock built with the **Web Crypto API** (SHA-256 salted hashing).
10. 📦 **Data Portability & Demo Data:** JSON export/import utilities and a 12-entry academic demo dataset for presentations.

---

## 🏛️ 2. System Architecture

```
                                  SENTORA ARCHITECTURE
                                  
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                               REACT FRONTEND (Vite + TS)                        │
 │                                                                                 │
 │  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────────────────────┐ │
 │  │ MediaRecorder   │    │ Web Speech API  │    │ Recharts Visualizations      │ │
 │  │ Voice Recording │    │ Realtime Speech │    │ Trends, Donut & Bar Charts   │ │
 │  └────────┬────────┘    └────────┬────────┘    └──────────────────────────────┘ │
 │           │                      │                                              │
 │           ▼                      ▼                                              │
 │    [Audio Blob]         [Editable Transcript]                                   │
 │           │                      │                                              │
 │           │             ┌────────┴────────────────────────────┐                 │
 │           │             │ POST /api/analyze-journal           │                 │
 │           │             └────────┬────────────────────────────┘                 │
 │           │                      │                                              │
 │           ▼                      ▼                                              │
 │  ┌─────────────────────────────────────────────────────────────┐                │
 │  │ IndexedDB (Dexie.js - sentoraDB / journalEntries)           │                │
 │  │ - Local Hybrid Search Engine (Synonym expansion + scoring)  │                │
 │  │ - Web Crypto PIN Session Lock                               │                │
 │  │ - Export / Import JSON & Demo Dataset Generator             │                │
 │  └─────────────────────────────────────────────────────────────┘                │
 └──────────────────────────────────┬──────────────────────────────────────────────┘
                                    │ HTTP JSON Request
                                    ▼
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                       EXPRESS BACKEND (Node.js + TS)                            │
 │                                                                                 │
 │  ┌─────────────────────────┐         ┌────────────────────────────────────────┐ │
 │  │ journalAnalysisRoutes   │ ──────► │ journalAnalysisController              │ │
 │  └─────────────────────────┘         └──────────────────┬─────────────────────┘ │
 │                                                         │                       │
 │                                                         ▼                       │
 │                                      ┌────────────────────────────────────────┐ │
 │                                      │ geminiService (Google Generative AI)   │ │
 │                                      │ - Structured JSON Schema output        │ │
 │                                      │ - Non-clinical Emotion Classification  │ │
 │                                      │ - Topic & Keyword Extraction           │ │
 │                                      └──────────────────┬─────────────────────┘ │
 └─────────────────────────────────────────────────────────┼───────────────────────┘
                                                           │ HTTPS Secure Call
                                                           ▼
                                            ┌─────────────────────────────┐
                                            │      Google Gemini API      │
                                            └─────────────────────────────┘
```

---

## 🚀 3. Quick Start & Setup Guide

### Prerequisites
- **Node.js**: v18.0.0 or later (v22 recommended)
- **npm**: v9.0.0 or later

### Step 1: Install Dependencies
From the project root:
```bash
# Install root, backend, and frontend packages
npm run install:all
```
*Alternatively, you can run `npm install` inside the root, `backend/`, and `frontend/` folders individually.*

### Step 2: Configure Environment Variables
Navigate to `backend/`:
```bash
cp backend/.env.example backend/.env
```
Open `backend/.env` and configure your Google Gemini API key:
```env
PORT=5000
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
GEMINI_MODEL=gemini-1.5-flash
```

> **Security Note:** The `GEMINI_API_KEY` is **only** loaded and used on the Node.js backend. It is never exposed to the client-side React code.

### Step 3: Run Full-Stack Development Server
From the root directory:
```bash
npm run dev
```
- **React Frontend**: `http://localhost:5173`
- **Express Backend**: `http://localhost:5000`
- **Backend Health Check**: `http://localhost:5000/api/health`

---

## 🛠️ 4. Technology Stack & API Justification

| Technology | Layer | Purpose / Justification |
| :--- | :--- | :--- |
| **React 18 + TypeScript** | Frontend | Component-based UI with compile-time type safety. |
| **Vite** | Build Tool | Extremely fast HMR (Hot Module Replacement) and optimized bundling. |
| **Tailwind CSS** | Styling | Modern, calm aesthetic with dark/light mode support. |
| **Dexie.js (IndexedDB)** | Storage | Client-side persistent storage for voice blobs and journal metadata. |
| **MediaRecorder API** | Audio | Native, zero-cost browser microphone recording. |
| **Web Speech API** | Speech | Native browser speech-to-text recognition. |
| **Google Gemini API** | Backend AI | State-of-the-art LLM for non-clinical emotion classification, summarization, and topic extraction. |
| **Web Crypto API** | Security | Standard cryptographic hashing (SHA-256 + salt) for local PIN verification. |
| **Recharts** | Analytics | Declarative, accessible SVG charts for trends and distributions. |

---

## 🔍 5. Smart Hybrid Search Engine

Sentora features an intelligent **local memory search engine** (`frontend/src/services/searchService.ts`) that runs entirely within the client:

### Scoring Breakdown:
- **Exact Phrase Match in Transcript/Summary:** `+5 pts`
- **Topic Keyword Match:** `+4 pts`
- **Summary Keyword Match:** `+4 pts`
- **Keyword Match:** `+3 pts`
- **Primary Emotion Match:** `+3 pts`
- **Synonym Dictionary Expansion Match:** `+2 pts`
- **Transcript Token Match:** `+1 pt`

### Synonym Expansion Dictionary
The engine dynamically expands queries like:
- `"worried about exams"` $\rightarrow$ queries `stressed`, `pressure`, `deadline`, `finals`, `midterms`, `study`, `test`.
- `"college projects"` $\rightarrow$ queries `university`, `course`, `code`, `software`, `sentora`, `presentation`.
- `"friends hangout"` $\rightarrow$ queries `buddy`, `roommates`, `dinner`, `laughter`, `social`.

---

## 📊 6. Insights & Mood Trends Mapping

The Insights dashboard maps qualitative emotion classifications to a visual numeric scale (1–9) for time-series visualization:

| Emotion | Numerical Value | Theme |
| :--- | :---: | :--- |
| **Excited** | `9` | High positive valence, high energy |
| **Happy** | `8` | Positive valence, content |
| **Calm** | `7` | Positive/Neutral valence, low energy |
| **Neutral** | `5` | Balanced baseline |
| **Anxious** | `4` | Moderate stress/uncertainty |
| **Stressed** | `3` | Overwhelmed / high pressure |
| **Sad** | `2` | Low valence |
| **Angry** | `1` | Frustrated / agitated |

> **Ethical & Academic Disclaimer:** *All emotion classifications are non-clinical and computed strictly from textual linguistics for personal reflective journaling. They do not constitute a medical or psychological diagnosis.*

---

## 🎓 7. Viva / Academic Defense Q&A

**Q1: Why did you choose IndexedDB over a cloud database like MongoDB or Firebase?**  
**A:** Personal voice journals contain sensitive, private reflections. By storing audio blobs and transcripts locally in IndexedDB, Sentora guarantees that the user's journal history never leaves their personal device.

**Q2: How does Sentora protect the Gemini API key?**  
**A:** The React frontend never communicates with Google Gemini directly. All requests pass through our Express backend (`POST /api/analyze-journal`), where the API key is secured inside environment variables.

**Q3: What happens if a user opens Sentora on a browser that doesn't support Web Speech API?**  
**A:** Sentora features graceful degradation. It detects `SpeechRecognition` availability; if unsupported (e.g., Firefox), it displays a friendly message while keeping voice recording via `MediaRecorder` and manual typing fully functional.

**Q4: How does the Local Journal Lock work?**  
**A:** When a user sets a PIN, Sentora generates a cryptographic 16-byte random salt and computes a SHA-256 digest via `window.crypto.subtle`. The hash and salt are stored in `localStorage`, allowing secure client-side verification without hardcoded credentials.

---

## 📄 License
This project is developed for educational and academic demonstration purposes under the MIT License.
