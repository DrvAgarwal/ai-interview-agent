# 🎙️ Intvu — AI Interview Agent

An AI-powered mock interview platform built with **Next.js 15**, **Vapi AI** (voice), **Google Gemini**, and **Firebase**.

Live demo: [ai-interview-agent-tau.vercel.app](https://ai-interview-agent-tau.vercel.app)

---

## ✨ Features

### Original
- 🎙️ **Voice Interviews** — AI conducts real-time voice interviews via Vapi
- 🤖 **AI Feedback** — Gemini grades your performance across 4 categories
- 🔐 **Firebase Auth** — Secure email/password sign-in & sign-up
- 📋 **Interview History** — See all your past sessions with scores
- 🧑‍💻 **Interview Generator** — Voice-generate personalized interview question sets

### 🆕 New Features Added
- 🎯 **Practice Mode** — Text-based Q&A, no microphone needed, instant AI feedback per answer
- 📊 **Analytics Dashboard** — Score trend chart, category breakdown, improvement tips
- 🏆 **Leaderboard** — Top 20 users ranked by average score
- 📄 **Resume Upload** — PDF upload → Gemini extracts skills and personalizes questions
- ⏱️ **Interview Timer** — Countdown timer with color-coded warnings during live sessions
- 💬 **Live Transcript** — Real-time chat-bubble transcript panel during voice interviews
- 📥 **Export Report** — Download a styled HTML feedback report (print-to-PDF ready)
- 📣 **Share Results** — One-click share your score to LinkedIn or Twitter

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth + DB | Firebase (Auth + Firestore) |
| AI (Voice) | Vapi AI |
| AI (Feedback/Practice) | Google Gemini via AI SDK |
| Form Validation | React Hook Form + Zod |
| Notifications | Sonner |
| Date Utilities | Day.js |

---

## 🚀 Getting Started

### 1. Clone
```bash
git clone https://github.com/RajSuhani/ai-interview-agent.git
cd ai-interview-agent
npm install
```

### 2. Environment Variables
Create `.env.local` in the root:
```env
# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase (Admin — from service account JSON)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=

# Vapi
NEXT_PUBLIC_VAPI_WEB_TOKEN=
NEXT_PUBLIC_VAPI_WORKFLOW_ID=
VAPI_API_KEY=
```

### 3. Run
```bash
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
ai-interview-agent/
├── app/
│   ├── (auth)/              # Sign in / Sign up pages
│   ├── (root)/
│   │   ├── page.tsx         # Home — My Interviews + Latest
│   │   ├── layout.tsx       # Navbar with all feature links
│   │   ├── analytics/       # 📊 Analytics Dashboard
│   │   ├── leaderboard/     # 🏆 Leaderboard
│   │   ├── practice/        # 🎯 Text-based Practice Mode
│   │   └── interview/
│   │       └── [id]/
│   │           ├── page.tsx         # Voice interview session
│   │           └── feedback/page.tsx # Feedback + Export + Share
│   └── api/
│       ├── export-feedback/ # Generate downloadable HTML report
│       ├── practice/
│       │   ├── generate/    # AI question generation
│       │   └── evaluate/    # AI answer grading
│       ├── resume-analyze/  # PDF → skills extraction
│       ├── set-session/     # Firebase session cookie
│       └── vapi/generate/   # Vapi interview generation
├── components/
│   ├── Agent.tsx            # Voice interview + Timer + Transcript
│   ├── AnalyticsDashboard.tsx
│   ├── ExportFeedbackButton.tsx
│   ├── InterviewTimer.tsx
│   ├── InterviewCard.tsx
│   ├── LeaderboardTable.tsx
│   ├── PracticeMode.tsx
│   ├── ResumeUpload.tsx
│   ├── ShareResultCard.tsx
│   ├── TranscriptDisplay.tsx
│   └── ui/                  # Shadcn UI primitives
├── lib/
│   ├── actions/
│   │   ├── auth.action.ts
│   │   ├── general.action.ts
│   │   └── leaderboard.action.ts
│   ├── utils.ts
│   └── vapi.sdk.ts
├── constants/index.ts
├── firebase/
│   ├── admin.ts
│   └── client.ts
└── types/
```

---

## 📦 Deploy to Vercel

```bash
# Push to GitHub, import in Vercel, add all env variables, deploy
```

---

Built for college project by RajSuhani · Enhanced with 8 new features
