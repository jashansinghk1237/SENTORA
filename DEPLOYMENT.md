# 🚀 SENTORA Deployment Guide: 100% Free, Zero-Ollama Setup

This guide provides step-by-step instructions to deploy **Sentora** to the cloud completely **for free ($0/month)** without needing Ollama, Docker, or expensive GPUs.

---

## 📌 Table of Contents
1. [Why Sentora Needs Zero Ollama](#-1-why-sentora-needs-zero-ollama)
2. [How to Get a Free Google Gemini API Key](#-2-how-to-get-a-free-google-gemini-api-key)
3. [Method 1 (Recommended): 1-Click Free Deployment on Render](#-3-method-1-recommended-1-click-free-deployment-on-render)
4. [Method 2: Decoupled Deployment (Vercel Frontend + Render Backend)](#-4-method-2-decoupled-deployment-vercel-frontend--render-backend)
5. [Method 3: Docker & Docker Compose (Self-Hosted VPS / Cloud VM)](#-5-method-3-docker--docker-compose-self-hosted-vps--cloud-vm)
6. [Method 4: Local Production Testing](#-6-method-4-local-production-testing)
7. [⚠️ Crucial Browser Requirement: HTTPS for Microphone & Speech API](#-7-crucial-browser-requirement-https-for-microphone--speech-api)
8. [Troubleshooting & FAQ](#-8-troubleshooting--faq)

---

## 🧠 1. Why Sentora Needs Zero Ollama

Many AI projects require **Ollama** to run large language models locally. However, running Ollama in the cloud requires 8GB–16GB+ RAM and dedicated GPUs, making free cloud hosting impossible.

**Sentora is designed differently:**
- **Google Gemini 1.5 Flash Cloud API:** All AI emotion classification, summarization, and keyword extraction are powered by Google's cloud API. Sentora only sends an HTTP request—it uses under **100MB RAM** on your server.
- **Intelligent Heuristic Fallback:** If you do not have an API key or hit quota limits, Sentora's built-in rule-based NLP engine automatically processes your journal entries without crashing.
- **Client-Side Storage (IndexedDB):** All journal entries, audio blobs, and transcripts stay 100% private in the user's browser database (Dexie.js). You do not need to host or pay for PostgreSQL, MongoDB, or Redis.

| Feature | Ollama Setup | Sentora Architecture |
| :--- | :--- | :--- |
| **Server RAM Needed** | 8 GB – 16 GB+ | **~80 MB – 120 MB** |
| **GPU / VRAM** | Required / High | **Zero GPU required** |
| **Cloud Hosting Cost** | $20 – $80/month | **$0.00 / month (100% Free)** |
| **Database Cost** | Requires database server | **$0.00 (Browser IndexedDB)** |
| **Setup Effort** | Download models (4GB+) | **Zero setup (Cloud API)** |

---

## 🔑 2. How to Get a Free Google Gemini API Key

The Google Gemini API has a **generous free tier** (up to 15 Requests Per Minute and 1,500 Requests Per Day for `gemini-1.5-flash`), with **no credit card required**.

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with any personal or institutional Google account.
3. Click **"Create API Key"**.
4. Select a project (or choose "Create API key in new project").
5. Copy your new API key (it starts with `AIzaSy...`).
6. Keep this key safe. You will paste it into your deployment environment variables.

---

## 🌐 3. Method 1 (Recommended): 1-Click Free Deployment on Render

This is the **easiest and best** method. Express serves both the React frontend and the API under a single URL on Render's free tier.

- **Cost:** $0.00 / month
- **Services needed:** Only 1 single Web Service
- **CORS issues:** None (Frontend and Backend share the same domain)
- **SSL / HTTPS:** Free automatic SSL certificate (enables browser microphone and speech recognition)

### Step-by-Step Instructions:

#### Step 3.1: Push Your Code to GitHub
Ensure all recent changes are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure Sentora for production deployment without Ollama"
git push origin main
```

#### Step 3.2: Create a Free Account on Render
1. Go to [render.com](https://render.com) and sign up (you can log in with GitHub).

#### Step 3.3: Create a New Web Service
1. In your Render Dashboard, click **New +** in the top right and select **Web Service**.
2. Choose **"Build and deploy from a Git repository"** and click **Next**.
3. Select or search for your `SENTORA` repository.

#### Step 3.4: Configure the Service
Fill in the configuration fields:

| Field | Value |
| :--- | :--- |
| **Name** | `sentora` (or any custom name like `my-sentora-journal`) |
| **Region** | Choose closest to you (e.g., `Oregon (US West)` or `Frankfurt (EU)`) |
| **Branch** | `main` |
| **Root Directory** | *Leave empty* (or if your repo root has a subfolder named `Sentora`, type `Sentora`) |
| **Runtime** | `Node` |
| **Build Command** | `npm run install:all && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** (0.5 CPU, 512 MB RAM) |

#### Step 3.5: Add Environment Variables
Scroll down to the **Environment Variables** section and add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations & static asset serving |
| `GEMINI_API_KEY` | `AIzaSy...` | Paste your free key from Google AI Studio |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Lightweight, fast emotion analysis model |
| `CORS_ORIGIN` | `*` | Allows cross-origin access |

#### Step 3.6: Deploy
1. Click **"Deploy Web Service"**.
2. Render will download the dependencies, build the frontend and backend, and start the app.
3. Once the logs display:
   ```
   [Sentora Server] Serving frontend static assets from: /opt/render/project/src/frontend/dist
   🚀 SENTORA Backend Server is running on port 10000
   ```
4. Click on your Render URL at the top (e.g. `https://sentora-xxxx.onrender.com`).
5. Your application is live!

---

## ⚡ 4. Method 2: Decoupled Deployment (Vercel Frontend + Render Backend)

If you prefer having your React frontend hosted on **Vercel** and your API hosted on **Render**:

### Step 4.1: Deploy Backend on Render
1. Create a Web Service on [Render](https://render.com).
2. Set:
   - **Root Directory:** `backend` (or `Sentora/backend`)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `NODE_ENV`: `production`
     - `GEMINI_API_KEY`: `your-gemini-key`
     - `CORS_ORIGIN`: `*`
3. Once deployed, copy your backend URL (e.g., `https://sentora-api.onrender.com`).

### Step 4.2: Deploy Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New...** -> **Project**.
3. Import your `SENTORA` repository.
4. Set:
   - **Root Directory:** `frontend` (or `Sentora/frontend`)
   - **Framework Preset:** `Vite`
5. Expand **Environment Variables** and add:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://sentora-api.onrender.com` (your Render backend URL)
6. Click **Deploy**.
7. Vercel will build the frontend and provide a free `https://your-app.vercel.app` URL.

---

## 🐳 5. Method 3: Docker & Docker Compose (Self-Hosted VPS / Cloud VM)

If you have a VPS (AWS EC2, Oracle Cloud Free Tier, DigitalOcean, Hetzner, Linode):

### Run with Docker Compose:
```bash
# 1. Clone the repository
git clone https://github.com/jashansinghk1237/SENTORA.git
cd SENTORA/Sentora

# 2. Set your Gemini API Key
export GEMINI_API_KEY="your-gemini-api-key"

# 3. Build and launch the container
docker compose up -d --build
```
The entire application will be live at `http://YOUR_SERVER_IP:5000`.

### Configure Nginx with SSL (Let's Encrypt):
Because microphone access requires HTTPS, point your domain and use Certbot:
```nginx
server {
    server_name journal.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Run `sudo certbot --nginx -d journal.yourdomain.com` for free SSL.

---

## 💻 6. Method 4: Local Production Testing

To test the production build on your local machine before pushing:

```bash
# 1. Build both frontend and backend
npm run build

# 2. Run the production server
npm start
```
Open [http://localhost:5000](http://localhost:5000) in your browser. Both the React application and API endpoints will be live.

---

## ⚠️ 7. Crucial Browser Requirement: HTTPS for Microphone & Speech API

For privacy and security, all major modern web browsers (Google Chrome, Microsoft Edge, Safari, Firefox, Opera) enforce a strict rule:
> **Microphone recording (`navigator.mediaDevices.getUserMedia`) and live voice-to-text (`Web Speech API`) are strictly disabled on non-secure `http://` connections.**

The only exceptions are:
1. `http://localhost` (for local development).
2. **Any domain served over `https://`** (such as Render's `*.onrender.com` or Vercel's `*.vercel.app`).

Because **Render and Vercel automatically provision free, valid SSL certificates (`https://`)**, microphone recording and real-time speech transcription will work immediately when deployed using Methods 1, 2, or 3.

---

## ❓ 8. Troubleshooting & FAQ

### Q1: Does Render's free tier put the server to sleep?
- **Yes.** Render's free web services automatically spin down after 15 minutes of inactivity to save energy.
- When someone visits your URL after it has been sleeping, the first request may take **30 to 50 seconds** to wake up (a "cold start"). Subsequent requests are instant.
- Sentora displays a loading indicator while the backend awakens.

### Q2: What happens if my Gemini API key is missing or invalid?
- Sentora has a built-in **Intelligent Heuristic Fallback Engine**.
- If the Gemini API key is blank or fails, the backend automatically analyzes emotion keywords (`happy`, `stressed`, `calm`, `sad`, etc.) and returns structured emotion scores and extracted topics.
- **The application never crashes or breaks for the user or university examiner.**

### Q3: Where are audio recordings and journal entries stored?
- Audio recordings, transcripts, emotion scores, and search indices are stored in the user's browser **IndexedDB (via Dexie.js)**.
- Nothing is stored on an external cloud database.
- Each user's data remains 100% private to their specific device/browser.
- Users can export or import their journal entries anytime as JSON from the **Settings** page.

### Q4: Which browsers work best with voice transcription?
- **Google Chrome** and **Microsoft Edge** have full native support for the Web Speech API.
- In browsers without Web Speech API support (such as certain mobile browsers or Firefox), users can still record voice notes and type/edit their journal transcripts manually.
