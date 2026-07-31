# SignBridge AI 🤟

> **Breaking Communication Barriers Through AI**

A modern, AI-powered web application for learning American Sign Language (ASL) interactively using animated avatars, real-time webcam practice, and AI-guided lessons.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://typescript.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green)](https://supabase.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-orange)](https://openai.com)

---

## ✨ Features

### Core Learning
- **12+ Structured Modules** — Alphabet, Numbers, Greetings, Family, Food, Medical, Emergency, and more
- **Animated Sign Demonstrations** — Dynamic 2D animated hand signs (3D-ready architecture)
- **AI Tutor** — GPT-4 powered tutor that explains signs, generates exercises, answers questions
- **Text to Sign** — Convert any text to animated sign language sequences
- **Speech to Sign** — Speak naturally, watch it convert to signs via Web Speech API

### Practice & Feedback
- **Webcam Practice** — Real-time camera practice with simulated AI accuracy scoring
- **Gesture Recognition** — Identifies common signs with confidence percentages
- **AI Feedback** — Personalized suggestions, finger correction, practice plans

### Gamification
- **XP & Levels** — Earn experience points, level up your profile
- **Achievements & Badges** — 10+ unlockable achievements
- **Daily Streak** — Track consecutive learning days
- **Leaderboard** — Compete with other learners
- **Coins** — Virtual currency for rewards

### Platform
- **Authentication** — Google & GitHub OAuth via Supabase
- **Progress Dashboard** — Analytics, weekly activity charts, module completion
- **Dark/Light Mode** — Beautiful aurora-themed dark mode default
- **Responsive Design** — Mobile-first, works on all devices
- **WCAG 2.1 Compliant** — High contrast, keyboard navigation, screen reader support

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)
- An [OpenAI](https://platform.openai.com) API key

### 1. Install dependencies
```bash
cd signbridge-ai
npm install
```

### 2. Configure environment variables
```bash
cp .env.local.example .env.local
```
Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
```

### 3. Set up Supabase Database
1. Go to your Supabase project → SQL Editor
2. Paste and run the contents of `supabase/schema.sql`
3. Enable Google and GitHub OAuth in Authentication → Providers

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Project Structure

```
signbridge-ai/
├── src/
│   ├── app/
│   │   ├── (app)/              # Protected routes
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── learn/          # Lesson modules
│   │   │   ├── practice/       # Webcam practice
│   │   │   ├── ai-tutor/       # AI chat tutor
│   │   │   ├── text-to-sign/   # Text conversion
│   │   │   ├── speech-to-sign/ # Speech conversion
│   │   │   ├── quiz/           # AI quiz generator
│   │   │   ├── progress/       # Analytics
│   │   │   ├── achievements/   # Badges & awards
│   │   │   ├── community/      # Social features
│   │   │   └── settings/       # User preferences
│   │   ├── api/                # Secure API routes
│   │   │   ├── ai-tutor/       # OpenAI tutor
│   │   │   ├── text-to-sign/   # Sign conversion
│   │   │   └── generate-quiz/  # Quiz generation
│   │   └── auth/               # Auth pages
│   ├── components/
│   │   ├── ui/                 # Reusable components
│   │   ├── landing/            # Landing page sections
│   │   ├── dashboard/          # App UI (sidebar)
│   │   └── learn/              # Lesson components
│   ├── lib/
│   │   ├── supabase/           # Supabase client/server
│   │   ├── lessons.ts          # Lesson data
│   │   └── utils.ts            # Helper functions
│   ├── store/                  # Zustand state
│   └── types/                  # TypeScript types
└── supabase/
    └── schema.sql              # Database schema
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Auth & DB | Supabase |
| AI | OpenAI GPT-4o-mini |
| State | Zustand |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |

---

## 🔐 Security

- All OpenAI API calls are made server-side via Next.js API routes
- API keys are never exposed to the client
- Supabase Row Level Security (RLS) ensures users only access their own data
- Input validation on all forms

---

## 📱 Screenshots

The app features:
- Aurora gradient animated background on landing page
- Glassmorphism UI throughout
- Purple + Blue gradient theme
- Animated sign language emoji demonstrations
- Real-time webcam practice with overlay UI
- AI chat interface for the tutor

---

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

---

## 📄 License

MIT License — built with ❤️ for accessibility and the deaf community.

---

*SignBridge AI — Breaking Communication Barriers Through AI* 🤟
