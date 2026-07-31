# SignBridge AI 🤟

> **Real-Time ASL Tutor · WildCard Challenge Entry**

SignBridge AI is a browser-based American Sign Language (ASL) tutor. Point your webcam at your hand — MediaPipe Hands tracks all 21 landmarks at 30 fps, scores every finger in real time, speaks coaching tips aloud, and rewards progress with XP and streaks. No hardware, no install. Just open and learn.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-pink)](https://www.framer.com/motion)
[![MediaPipe](https://img.shields.io/badge/MediaPipe_Hands-0.4-red)](https://mediapipe.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3ecf8e)](https://supabase.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-orange)](https://openai.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://vercel.com)

---

## 🏆 WildCard Challenge

**Problem:** 430 million people worldwide have disabling hearing loss. Learning sign language today means static video tutorials, zero feedback, and no way to know if your fingers are right.

**Solution:** SignBridge AI puts a real-time AI coach in the browser. It watches your hand, scores every finger independently, tells you exactly what to fix (aloud), and keeps you coming back with gamification.

**Why WildCard?** Three different cutting-edge capabilities in one web app, running entirely in the browser:
1. Real-time computer vision (MediaPipe WASM, <100 ms)
2. Procedural photorealistic hand rendering with Bézier geometry + subsurface-scatter SVG
3. LLM-powered tutoring (GPT-4o-mini, server-side)

---

## 🎬 Practice Mode — Three-Column Layout

The practice screen is the heart of the app. It is split into three columns to create an immediate visual comparison:

```
┌─────────────────────────┬──────┬──────────────────────────────────┐
│   YOUR HAND — LIVE      │  →   │   ASL REFERENCE                  │
│                         │      │                                   │
│  ┌─────────────────┐    │  ↕   │  ┌────────────────────────────┐  │
│  │  webcam feed    │    │  acc │  │  studio-lit hand SVG       │  │
│  │  + MediaPipe    │    │  %   │  │  animated to match sign    │  │
│  │  skeleton       │    │      │  └────────────────────────────┘  │
│  │  green = ✓      │    │      │                                   │
│  │  red   = ✗      │    │      │  "Hello"   · beginner            │
│  └─────────────────┘    │      │  B-hand (flat, fingers together)  │
│                         │      │                                   │
│  [Start Camera]         │      │  Finger state bar                 │
│                         │      │  T  I  M  R  P                    │
│  Per-finger accuracy:   │      │  ▓  ▓  ▓  ▓  ▓  ← green=ok       │
│  Thumb   ████ 92%  ✓    │      │                                   │
│  Index   ████ 88%  ✓    │      │  Motion: "Sweep outward"  →→      │
│  Middle  ██░░ 41%  ✗    │      │                                   │
│  Ring    ████ 95%  ✓    │      │  How to sign:                     │
│  Pinky   ████ 97%  ✓    │      │  1. Keep fingers straight         │
│                         │      │  2. Start at your forehead        │
│  Overall: 82%           │      │  3. Sweep outward smoothly        │
└─────────────────────────┴──────┴──────────────────────────────────┘
```

### Animated comparison arrow (centre column)
A Framer Motion `ArrowRight` pulses left-to-right continuously. When a hand is detected, a vertical accuracy gauge fills in the matching colour (green / blue / yellow / red) next to the arrow — giving instant gestalt feedback without reading a number.

### Reference hand animations
Each sign is classified into one of five motion types and animated with Framer Motion keyframes:

| Motion type | Signs | Animation |
|---|---|---|
| `wave` | Hello | rotate ↔ + translate left/right |
| `snap` | Thank You, Good, No, Water | double-tap y + slight x |
| `circle` | Sorry, Please | elliptical orbit x+y |
| `nod` | Yes, Help | wrist-nod rotate + y |
| `static` | Letter A/B/C, Number 1/2, ILY | gentle float y |

Motion arrows (animated SVG paths, `pathLength: [0,1,0]` loops) appear inside the reference card for non-static signs and visually indicate the direction and type of movement.

---

## ✨ Full Feature List

### 🎯 Real-Time Gesture Recognition
- **MediaPipe Hands 0.4** (WASM, CDN-loaded) — 21-landmark hand tracking at 30 fps
- Per-finger curl + extension scoring: each finger scored independently against the verified target
- Canvas overlay draws green/red skeleton directly on the webcam feed
- Rep counting: hold ≥ 90% accuracy for 600 ms → rep recorded, XP awarded
- Unlock gate: ≥ 90% best accuracy unlocks the next lesson

### 🖐 Photorealistic Hand Renderer (v3)
Built entirely as inline SVG with no external images:
- **Organic Bézier silhouettes** — cubic curves per finger, smooth joints, anatomically tapered
- **Subsurface-scatter skin** — `feGaussianBlur` + `feComposite` SSS rim light layered over a 4-stop gradient
- **Specular highlight strip** — narrow polygon along the lit edge of the proximal phalanx
- **Realistic nails** — rounded-rect shape + lunula crescent + free-edge arc + AO shadow
- **Knuckle creases** — curved `Q` path at each joint + ambient-occlusion ellipse
- **Inter-finger webbing** — quadratic strokes between each finger pair at the palm junction
- **Organic wrist** — narrowing Bézier path with two crease lines
- **Full-hand drop shadow** — `feDropShadow` on the shadow group
- Error fingers replace skin gradient with red gradient + `feDropShadow` red glow
- Studio backdrop: dark radial sweep + warm key-light rim + cool edge light + floor reflection

### 🔬 Verified ASL Handshapes
Every sign is cross-referenced against:
- **Lifeprint / ASL University** (Dr. Bill Vicars — lifeprint.com)
- **Signing Savvy** (signingsavvy.com)
- ***The American Sign Language Handshape Dictionary*** — Tennant & Brown

Each `SignDefinition` carries three geometry fields used directly for rendering:
```ts
targetCurls:     [thumb, index, middle, ring, pinky]  // 0=extended, 1=curled
referenceSpread: [thumb, index, middle, ring, pinky]  // 0=together, 1=spread
wristTilt:       number                               // degrees
```
The reference hand renders **directly from these values** — no nearest-neighbour approximation, no generic pose library lookup.

### 🤖 AI Tutor (GPT-4o-mini)
- Streaming chat interface powered by `/api/ai-tutor`
- System prompt includes the full lesson catalogue + handshape descriptions
- Generates custom practice plans, explains A vs S vs B handshapes, answers questions
- Server-side only — API key never reaches the browser

### 🎓 Structured Curriculum
- 12 lesson modules: Alphabet, Numbers, Greetings, Family, Food, Emergency, Medical, School, Office, Travel, Conversation, Advanced
- Lesson unlock gate gated on practice accuracy
- **Text-to-Sign**: type any sentence → animated sign sequence with `ReferenceHandPanel`
- **Speech-to-Sign**: speak → Web Speech API → animated sign sequence

### 🏅 Gamification (Zustand + persist)
- XP points per rep, configurable per sign
- Level system with named tiers (Beginner → Master)
- Daily goal ring — configurable rep target, progress persists across reloads
- 7-day activity streak tracker
- 10+ achievement badges (First Step, Week Warrior, Quiz Ace, Speed Demon…)
- Weekly bar chart (activity heatmap)
- Module completion progress page with Lucide category icons

### 🔐 Authentication & Demo Mode
- Google + GitHub OAuth via Supabase
- **Try Demo** — single click on the login page, no account needed
  - Sets `sb-demo-mode=1` cookie via `/api/demo`
  - Middleware bypasses Supabase entirely, injects demo profile
  - Cookie cleared on sign-out (client-side `document.cookie` reset)
- Middleware (`src/proxy.ts`) guards with try/catch — works with placeholder env vars locally

### 🗣 Spoken Feedback
- `useSpeechFeedback` hook wraps `window.speechSynthesis`
- Fires when accuracy changes by > 15% — avoids spam
- Messages: "Great job! 94% accuracy on Hello" / "Adjust your Middle finger"
- Respects the mute toggle in the UI

---

## 🤖 AI Pipeline Architecture

```
Browser (client-side, zero server round-trips for ML)
──────────────────────────────────────────────────────────────────
  Webcam
    │
    ▼
  MediaPipe Hands WASM (CDN)
    │  21 normalised landmarks per frame
    ▼
  landmark-utils.ts
    │  extractFeatures()  → curl[5], spread[5], wristAngle
    │  compareFingers()   → per-finger accuracy, errorFingers[]
    │  computeOverallAccuracy()
    ▼
  useGestureRecognition hook
    │  GestureResult { accuracy, fingerAccuracies, errorFingers,
    │                  landmarks, handDetected, latencyMs }
    ▼
  ┌────────────────────────────────────────────────────────┐
  │  Practice Page — three-column layout                   │
  │                                                        │
  │  WebcamGestureOverlay   →   ReferenceHandPanel         │
  │  (canvas skeleton)          (RealisticHandSVG v3       │
  │                              + motion animation        │
  │  AccuracyDisplay             + finger state bar        │
  │  (per-finger bars)           + step-by-step tips)      │
  │                                                        │
  │  GamificationBar  useSpeechFeedback  useTutorStore     │
  └────────────────────────────────────────────────────────┘

Server (Next.js API Routes — secrets never leave server)
──────────────────────────────────────────────────────────────────
  /api/ai-tutor      → OpenAI GPT-4o-mini (streaming chat)
  /api/generate-quiz → OpenAI GPT-4o-mini (quiz generation)
  /api/text-to-sign  → sign sequence lookup
  /api/demo          → sets sb-demo-mode cookie
```

---

## 🛠 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 App Router | `src/proxy.ts` middleware; server components |
| Language | TypeScript 5 | Full type safety across SVG geometry |
| Styling | Tailwind CSS v4 | Utility-first; zero runtime CSS |
| Animation | Framer Motion 11 | `AnimatePresence`, keyframe arrays, path animations |
| Gesture ML | MediaPipe Hands 0.4 WASM | Client-side, <100 ms, no server |
| Hand Rendering | Procedural SVG (React + `useMemo`) | Zero external assets; fully parametric |
| State | Zustand + `persist` | XP/streak/badges survive page reloads |
| Auth & DB | Supabase | Google + GitHub OAuth; RLS; `profiles` table |
| AI Chat | OpenAI GPT-4o-mini | Server-side streaming via API route |
| Speech | Web Speech API `speechSynthesis` | Zero dependency TTS |
| Icons | Lucide React | Tree-shakeable SVG icons |
| Hosting | Vercel | Edge network; MediaPipe CDN at runtime |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier)
- An [OpenAI](https://platform.openai.com) API key (gpt-4o-mini)

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
OPENAI_API_KEY=sk-your-key
```

> **No Supabase yet?** Leave the placeholders. The middleware detects them and skips auth — use **Try Demo** on the login page to access the full app instantly.

### 3. Supabase (optional)

In your Supabase project → SQL Editor, run `supabase/schema.sql`.
Enable Google and/or GitHub OAuth in Authentication → Providers.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → click **Try Demo**.

---

## 🏗 Project Structure

```
signbridge-ai/
├── src/
│   ├── proxy.ts                         # Next.js 16 middleware — demo cookie + Supabase auth guard
│   ├── hooks/
│   │   ├── useGestureRecognition.ts     # Webcam → MediaPipe → per-sign scoring pipeline
│   │   └── useSpeechFeedback.ts         # Web Speech API TTS coaching
│   ├── lib/
│   │   ├── gesture/
│   │   │   ├── landmark-utils.ts        # Curl / extension math; finger comparison
│   │   │   ├── sign-definitions.ts      # 15 verified ASL signs (Lifeprint / Signing Savvy)
│   │   │   └── hand-pose-library.ts     # Generic pose library (live-mirror lookup only)
│   │   ├── lessons.ts                   # 12 structured lesson modules
│   │   ├── supabase/                    # client / server / middleware helpers
│   │   └── utils.ts                     # XP, level, formatting
│   ├── store/
│   │   └── tutor-store.ts               # Zustand: XP · streak · badges · daily goals
│   ├── components/
│   │   ├── practice/
│   │   │   ├── realistic-hand-svg.tsx   # Photorealistic hand SVG v3 (Bézier + SSS)
│   │   │   ├── reference-hand-panel.tsx # ASL reference: hand + motion + finger bar + tips
│   │   │   ├── hand-pose-display.tsx    # Wrapper: direct render from sign definition
│   │   │   ├── webcam-gesture-overlay.tsx # Video + canvas (always mounted — no race)
│   │   │   ├── accuracy-display.tsx     # Per-finger accuracy bars + coaching hints
│   │   │   └── gamification-bar.tsx     # XP / level / streak / daily goal
│   │   ├── landing/
│   │   │   └── avatar-scene.tsx         # Landing hero: cycling ASL poses with crossfade
│   │   └── dashboard/                   # Sidebar + dashboard client
│   └── app/
│       ├── page.tsx                     # Landing page (aurora bg + avatar scene)
│       ├── (app)/
│       │   ├── practice/                # ← Main: 3-column gesture tutor
│       │   ├── quiz/                    # Text + gesture quiz (GPT-generated)
│       │   ├── learn/                   # Lesson modules with unlock gating
│       │   ├── achievements/            # Live badge wall from tutor store
│       │   ├── progress/                # Analytics, weekly chart, module completion
│       │   ├── text-to-sign/            # Text → animated sign sequence
│       │   ├── speech-to-sign/          # Speech → animated sign sequence
│       │   ├── ai-tutor/                # GPT-4o-mini streaming chat
│       │   └── settings/                # Theme, notifications, sign-out
│       ├── api/
│       │   ├── demo/route.ts            # Sets sb-demo-mode=1 cookie
│       │   ├── ai-tutor/route.ts        # OpenAI streaming chat
│       │   ├── generate-quiz/route.ts   # OpenAI quiz generation
│       │   └── text-to-sign/route.ts    # Sign sequence lookup
│       └── auth/
│           ├── login/page.tsx           # Login + Try Demo button
│           └── callback/route.ts        # Supabase OAuth callback
└── supabase/
    └── schema.sql                       # profiles table + RLS policies
```

---

## 🔐 Security

| Concern | How handled |
|---|---|
| OpenAI API key | Server-side only — never bundled or sent to client |
| Supabase RLS | Row-Level Security — users can only read/write their own profile |
| Demo cookie | `httpOnly: false` intentionally — client JS clears it on sign-out |
| Placeholder credentials | Middleware try/catch prevents crash; gracefully skips auth |
| CORS | Next.js API routes enforce same-origin by default |

---

## 🚢 Deployment

### Vercel (recommended)

```
1. Push to GitHub (or fork)
2. Import in vercel.com → New Project
3. Add environment variables:
     NEXT_PUBLIC_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY
     OPENAI_API_KEY
4. Deploy
```

MediaPipe WASM loads from `cdn.jsdelivr.net` at runtime — no extra Vercel config needed.

---

## 🤝 Built With IBM Bob

This entire application was designed and implemented end-to-end using **IBM Bob**, the AI software engineering assistant. Highlights:

- Architected the Next.js 16 app with `src/proxy.ts` middleware (avoiding the `middleware.ts` conflict)
- Designed the MediaPipe → curl-math → finger-scoring pipeline from scratch
- Built the `RealisticHandSVG` v3 renderer: organic Bézier silhouettes, subsurface-scatter skin, anatomically correct nails and knuckle geometry
- Verified all 15 ASL handshapes against Lifeprint / ASL University sources and encoded per-sign `referenceSpread` + `wristTilt`
- Eliminated the nearest-neighbour pose approximation — reference now renders directly from the sign definition
- Built the three-column practice layout with per-motion-type Framer Motion keyframe animations
- Debugged the `srcObject` camera race condition, `useMemo` array-reference stale-closure bug, and `AnimatePresence` key-identity issue
- Authored this README

---

## 📄 License

MIT — built with ❤️ for the deaf and hard-of-hearing community.

*SignBridge AI — Real-Time ASL Learning, Powered by AI* 🤟
