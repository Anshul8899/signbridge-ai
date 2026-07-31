# SignBridge AI 🤟

> **Breaking Communication Barriers Through AI — WildCard Challenge Entry**

SignBridge AI is a real-time, AI-powered American Sign Language (ASL) tutor. It uses your webcam and MediaPipe Hands to score your hand poses against reference signs, gives instant spoken feedback, and keeps you motivated with XP, streaks, badges, and daily goals — all running at under 100 ms latency in the browser.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green)](https://supabase.com)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-red)](https://mediapipe.dev)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-orange)](https://openai.com)

---

## 🏆 WildCard Challenge

This project was submitted to the **WildCard Challenge** track.

**Problem:** 430 million people worldwide have disabling hearing loss. Sign language bridges the gap, but accessible, real-time learning tools are rare — most require expensive hardware or static video tutorials.

**Solution:** SignBridge AI turns any laptop or phone camera into a sign-language coach that watches your hands, scores every finger bend, tells you what to fix (aloud), and keeps you coming back with gamification. No extra hardware. No downloads. Just a browser.

**Why WildCard?** The combination of real-time CV pipeline in the browser, procedural photorealistic hand rendering, and LLM-driven tutoring in a single web app pushes multiple technology boundaries simultaneously.

---

## ✨ Features

### 🎯 Real-Time Gesture Recognition
- **MediaPipe Hands** (WASM, CDN-loaded) — 21-landmark hand tracking at 30 fps
- Per-finger curl & extension scoring against 15 target ASL signs
- Accuracy displayed as per-finger colour bars
- Landmark skeleton overlaid live on webcam feed (canvas overlay)
- Rep counting — complete 3 reps at ≥90% to unlock the next sign

### 🖐 Photorealistic Hand Reference
- Procedural SVG hand — skin-tone gradients, knuckle creases, nails, shadows
- Error fingers glow red; correct fingers glow green
- `HandPoseDisplay` component cycles through 45 reference library poses with cross-fade
- No emojis, no 3D avatars, no external image assets

### 🤖 AI Tutor (GPT-4o-mini)
- Chat interface powered by `/api/ai-tutor`
- Tutor knows the full lesson catalogue and your current progress
- Generates custom practice plans and finger-correction advice

### 🎓 Structured Curriculum
- 12 lesson modules: Alphabet, Numbers, Greetings, Family, Food, Emergency, Medical, School, Office, Travel, Conversation, Advanced
- Lesson unlock gate — must score ≥90% in practice before advancing
- Text-to-Sign and Speech-to-Sign converters using `HandPoseDisplay`

### 🏅 Gamification
- XP, levels, and a Zustand-persisted store (survives page reloads)
- Daily goal ring (configurable rep target)
- 7-day activity streak with fire icon
- 10+ unlockable achievement badges
- Weekly progress chart and module completion page

### 🔐 Authentication & Demo Mode
- Google / GitHub OAuth via Supabase
- **Demo mode** — click "Try Demo" on the login page → sets `sb-demo-mode=1` cookie → full app with a demo profile, no sign-up required
- Middleware guards against misconfigured Supabase credentials (works locally with placeholder env vars)

### 🗣 Speech Feedback
- `useSpeechFeedback` hook — Web Speech API (`speechSynthesis`) announces score and coaching tips after each rep
- Keeps deaf-friendly apps accessible to sighted-but-hearing learners too

---

## 🤖 AI Architecture

```
Browser                           Server (Next.js API Routes)
────────────────────────────────  ──────────────────────────────────
Webcam → MediaPipe WASM           /api/ai-tutor   → OpenAI GPT-4o-mini
  ↓ 21 landmarks                  /api/generate-quiz → OpenAI GPT-4o-mini
landmark-utils.ts (curl math)     /api/text-to-sign  → sign sequence lookup
  ↓ curl[5] + spread[5]
sign-definitions.ts (15 signs)
  ↓ cosine-like score
useGestureRecognition hook
  ↓ accuracy%, repCount
WebcamGestureOverlay (canvas)
AccuracyDisplay (finger bars)
useSpeechFeedback (TTS)
GamificationBar (XP / streak)
HandPoseDisplay (SVG reference)
```

All ML inference runs entirely client-side via WASM — **zero server round-trips** for gesture scoring. OpenAI is used only for the chat tutor and quiz generation.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, `src/proxy.ts` middleware) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Gesture ML | MediaPipe Hands 0.4 (CDN WASM) |
| Hand Rendering | Procedural SVG (React) |
| State | Zustand + `persist` middleware |
| Auth & DB | Supabase (Google + GitHub OAuth, RLS) |
| AI Chat | OpenAI GPT-4o-mini (server-side only) |
| Speech | Web Speech API (`speechSynthesis`) |
| Icons | Lucide React |
| Hosting | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier is fine)
- An [OpenAI](https://platform.openai.com) API key

### 1. Install

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
```

> **No Supabase yet?** Leave placeholder values. The app will skip auth and let you use **Demo Mode** via `/api/demo`.

### 3. Supabase Database

In your Supabase project → SQL Editor, run `supabase/schema.sql`.  
Enable Google and GitHub OAuth in Authentication → Providers.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Try Demo** to skip sign-up.

---

## 🏗 Project Structure

```
signbridge-ai/
├── src/
│   ├── proxy.ts                    # Next.js 16 middleware (demo cookie + Supabase auth)
│   ├── hooks/
│   │   ├── useGestureRecognition.ts  # Webcam → MediaPipe → per-sign scoring
│   │   └── useSpeechFeedback.ts    # Web Speech API TTS coaching
│   ├── lib/
│   │   ├── gesture/
│   │   │   ├── landmark-utils.ts   # Curl / extension / accuracy math
│   │   │   ├── sign-definitions.ts # 15 ASL target signs with curl profiles
│   │   │   └── hand-pose-library.ts # 45 reference display poses
│   │   ├── lessons.ts              # 12 lesson modules
│   │   ├── supabase/               # client / server / middleware helpers
│   │   └── utils.ts                # XP, level, formatting helpers
│   ├── store/
│   │   └── tutor-store.ts          # XP · streak · badges · daily goals (Zustand)
│   ├── components/
│   │   ├── practice/
│   │   │   ├── webcam-gesture-overlay.tsx  # Video + canvas (always mounted)
│   │   │   ├── realistic-hand-svg.tsx      # Procedural photorealistic hand
│   │   │   ├── hand-pose-display.tsx       # Animated reference pose
│   │   │   ├── accuracy-display.tsx        # Per-finger accuracy bars
│   │   │   └── gamification-bar.tsx        # XP / streak / daily goal
│   │   ├── landing/avatar-scene.tsx        # Cycling hand poses on landing
│   │   └── dashboard/                      # Sidebar, dashboard client
│   └── app/
│       ├── page.tsx                # Landing page
│       ├── (app)/
│       │   ├── practice/           # Full gesture tutor
│       │   ├── quiz/               # Text + gesture quiz
│       │   ├── learn/              # Lesson modules
│       │   ├── achievements/       # Badges
│       │   ├── progress/           # Analytics + charts
│       │   ├── text-to-sign/       # Text → sign sequence
│       │   ├── speech-to-sign/     # Speech → sign sequence
│       │   ├── ai-tutor/           # Chat with GPT tutor
│       │   └── settings/           # Theme, notifications, sign-out
│       ├── api/
│       │   ├── demo/               # Sets sb-demo-mode cookie
│       │   ├── ai-tutor/           # OpenAI chat
│       │   ├── generate-quiz/      # OpenAI quiz
│       │   └── text-to-sign/       # Sign lookup
│       └── auth/                   # Login page + OAuth callback
└── supabase/
    └── schema.sql
```

---

## 🔐 Security

- All OpenAI calls are server-side — API key never reaches the client
- Supabase Row-Level Security (RLS) ensures users only access their own data
- Demo cookie is `httpOnly: false` by design so the client JS can clear it on sign-out
- Middleware (`src/proxy.ts`) guards all `/dashboard/*` routes; falls back gracefully when Supabase credentials are placeholders

---

## 🚢 Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`)
4. Deploy — MediaPipe loads from CDN at runtime, no extra build config needed

---

## 🤝 Built With IBM Bob

This app was built end-to-end using **IBM Bob** — the AI software engineering assistant. Bob:

- Scaffolded the full Next.js 16 app structure
- Designed and implemented the MediaPipe → scoring pipeline
- Built the procedural SVG hand renderer from scratch
- Debugged the webcam `srcObject` race condition and `middleware.ts` / `proxy.ts` conflict
- Authored the Zustand gamification store
- Wrote this README

---

## 📄 License

MIT — built with ❤️ for the deaf and hard-of-hearing community.

*SignBridge AI — Real-Time ASL Learning, Powered by AI* 🤟
