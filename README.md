# 🧠 CloneAI — AI Personality Cloner 

> Create a digital AI twin of your personality. Train it on your writing, chat with it in real-time, and watch it talk exactly like you.

![CloneAI Banner](https://via.placeholder.com/1200x400/0a0a0f/7c6bfc?text=CloneAI+%E2%80%94+Your+AI+Personality+Twin)

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 Personality Analysis | Extracts tone, slang, sentence patterns & quirks via Claude AI |
| 💬 Real-Time Chat | WhatsApp-style chat UI with typing indicators & auto-scroll |
| 🎭 Personality Modes | Switch between Chill 😎, Professional 💼, and Angry 😡 |
| 🎤 Voice Input | Web Speech API — speak to your clone hands-free |
| 📦 Multi-Personality | Save, name, and switch between unlimited clones |
| 📤 Export | Download personality profiles as JSON |
| 🚀 Streaming | SSE-based streaming responses (optional) |

---

## 🏗️ Tech Stack

**Frontend:** React 18 + Vite + Tailwind CSS + Framer Motion  
**Backend:** Node.js + Express  
**AI:** Anthropic Claude (claude-sonnet-4-20250514)  
**Database:** MongoDB (optional) or in-memory fallback  
**Deploy:** Vercel (frontend) + Render (backend)

---

## 📁 Project Structure

```
cloneai/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── TrainPage.jsx
│   │   │   └── ChatPage.jsx
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── context/
│   │   │   └── PersonalityContext.jsx
│   │   ├── hooks/
│   │   │   └── useVoice.js
│   │   └── utils/
│   │       └── api.js
│   ├── vercel.json
│   └── .env.example
│
└── backend/                   # Express API
    ├── routes/
    │   ├── chat.js            # Claude chat + streaming
    │   ├── analyze.js         # Personality extraction
    │   └── personalities.js   # CRUD + MongoDB
    ├── server.js
    ├── render.yaml
    └── .env.example
```

---

## 🚀 Quick Start (Local)

### 1. Clone & install

```bash
git clone https://github.com/yourusername/cloneai.git
cd cloneai

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env — add your CLAUDE_API_KEY

# Frontend
cd ../frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3001/api  (default, no change needed)
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:5173** 🎉

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx   # Required
MONGODB_URI=                                      # Optional (blank = in-memory)
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3001/api
```

---

## ☁️ Deployment

### Backend → Render.com

1. Push `backend/` folder to a GitHub repo
2. Go to [render.com](https://render.com) → New Web Service
3. Connect repo, set:
   - **Build:** `npm install`
   - **Start:** `node server.js`
4. Add environment variables in Render dashboard:
   - `CLAUDE_API_KEY` = your key
   - `FRONTEND_URL` = your Vercel URL (set after frontend deploy)
5. Deploy → copy your Render URL (e.g. `https://cloneai-api.onrender.com`)

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Add environment variable:
   - `VITE_API_URL` = `https://cloneai-api.onrender.com/api`
4. Deploy → done!

---

## 🎤 Live Demo Guide

### Setup (2 min before presenting)

1. Open app → click **"Try Demo First"** to load 3 prebuilt personalities
2. Have the Train page ready with sample text pre-pasted

### Demo Flow (5-7 min)

**Step 1 — Show the landing page**  
"This is CloneAI — it creates an AI that talks exactly like a specific person."

**Step 2 — Train a personality (live)**  
- Go to Train tab
- Paste casual sample text (from `docs/demo-data.json`)
- Hit Analyze — show the extracted profile
- Save it

**Step 3 — Chat demo**  
Ask the clone these questions in order:
- "Introduce yourself"
- "What do you think about AI?"
- "How was your day?"

**Step 4 — Switch modes**  
- Show Chill → Professional → Angry mode switching
- Same question, wildly different responses

**Step 5 — Voice input**  
- Click 🎤 mic button
- Speak a question
- Show it transcribing and sending

**Step 6 — Dashboard + Export**  
- Show multiple personalities
- Export one as JSON

### Expected Responses

**Casual Me + "How was your day?"**
> "bro it was kinda mid ngl lol, lowkey just vibed the whole time fr"

**Work Mode + "How was your day?"**  
> "It was quite productive, actually. Wrapped up the deliverables ahead of schedule."

**Chaos Gremlin + "How was your day?"**  
> "I am LITERALLY dead. The most unhinged sequence of events occurred today and I cannot"

---

## 🛠️ API Reference

### `POST /api/chat`
```json
{
  "personality": { "name": "...", "tone": "...", "traits": [], "commonWords": [], "avgSentenceLength": "..." },
  "message": "Hello!",
  "mode": "chill",
  "history": []
}
```
Returns: `{ "reply": "...", "usage": {} }`

### `POST /api/analyze`
```json
{ "text": "your sample writing here..." }
```
Returns: `{ "profile": { "tone": "...", "traits": [], "commonWords": [], ... } }`

### `POST /api/chat/stream`
Same body as `/api/chat`. Returns Server-Sent Events stream.

---

## 📄 License

MIT — free to use, modify, and present.

---

Built with ❤️ using React, Express, and Claude AI.
