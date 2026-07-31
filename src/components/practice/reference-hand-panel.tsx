"use client";

/**
 * ReferenceHandPanel
 *
 * Displays a premium educational reference for an ASL sign.
 * Uses a high-fidelity procedural hand SVG that closely mimics a studio photograph —
 * warm skin tones, subsurface scatter, soft shadows, realistic nails, knuckle creases —
 * combined with per-sign movement annotation and step-by-step instructions.
 *
 * For signs that require movement (YES, NO, WATER, etc.) the hand is animated
 * using Framer Motion keyframes that mirror the actual ASL motion path.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { RealisticHandSVG } from "@/components/practice/realistic-hand-svg";
import type { SignDefinition } from "@/lib/gesture/sign-definitions";

interface ReferenceHandPanelProps {
  sign: SignDefinition;
  errorFingers?: string[];
  width?: number;
  height?: number;
}

// ── Per-sign motion profiles ─────────────────────────────────────────────────
// "static" signs: no animation beyond a gentle float
// "nod"   signs: wrist-nod up/down (YES, HELP)
// "circle" signs: slow wrist rotation (SORRY, PLEASE)
// "snap"  signs: two-tap forward motion (NO, WATER, THANK-YOU, HELLO, GOOD)

type MotionType = "static" | "nod" | "circle" | "snap" | "wave";

import type { TargetAndTransition } from "framer-motion";

const SIGN_MOTION: Record<string, MotionType> = {
  "yes":       "nod",
  "help":      "nod",
  "sorry":     "circle",
  "please":    "circle",
  "no":        "snap",
  "water":     "snap",
  "thank-you": "snap",
  "hello":     "wave",
  "good":      "snap",
};

// ── Motion animation variants ────────────────────────────────────────────────

const motionVariants: Record<MotionType, TargetAndTransition> = {
  static: {
    y: [0, -4, 0],
    transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
  },
  nod: {
    rotate: [0, -12, 4, -12, 0],
    y: [0, 8, -2, 8, 0],
    transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.55, 0.75, 1] },
  },
  circle: {
    x: [0, 10, 0, -10, 0],
    y: [0, -8, -14, -8, 0],
    transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
  },
  snap: {
    y: [0, -6, 0, -6, 0],
    x: [0, 3, 0, 3, 0],
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] },
  },
  wave: {
    rotate: [0, -14, 0, -14, 0],
    x: [0, 16, 0, 16, 0],
    transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] },
  },
};

// ── Motion label ─────────────────────────────────────────────────────────────
const MOTION_LABELS: Record<MotionType, string> = {
  static: "Hold this position",
  nod:    "Nod wrist up and down",
  circle: "Circle on chest",
  snap:   "Move forward twice",
  wave:   "Sweep outward",
};

// ── Handshape name map ────────────────────────────────────────────────────────
const HANDSHAPE_NAMES: Record<string, string> = {
  "hello":     "B-hand (flat, fingers together)",
  "thank-you": "B-hand (flat, fingers together)",
  "please":    "B-hand (flat, fingers together)",
  "good":      "B-hand (flat, fingers together)",
  "yes":       "S-hand (tight fist, thumb across front)",
  "sorry":     "A-hand (fist, thumb on side)",
  "help":      "A-hand (fist, thumb on side)",
  "no":        "Index + Middle extended (V-shape)",
  "water":     "W-hand (index, middle, ring spread)",
  "love":      "ILY-hand (thumb + index + pinky)",
  "letter-a":  "A-hand (fist, thumb alongside index)",
  "letter-b":  "B-hand (4 fingers up, thumb folded)",
  "letter-c":  "C-hand (curved open, C-shape)",
  "number-1":  "1-hand (index up only)",
  "number-2":  "2-hand (index + middle, V-shape)",
};

// ── Finger state indicators ───────────────────────────────────────────────────

interface FingerState {
  name: string;
  abbr: string;
  curl: number;   // 0=extended, 1=curled
  spread: number;
}

function getFingerStates(sign: SignDefinition): FingerState[] {
  const names = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
  const abbrs = ["T", "I", "M", "R", "P"];
  return names.map((name, i) => ({
    name,
    abbr: abbrs[i],
    curl: sign.targetCurls[i],
    spread: sign.referenceSpread[i],
  }));
}

// ── Main component ────────────────────────────────────────────────────────────

export function ReferenceHandPanel({
  sign,
  errorFingers = [],
  width = 260,
  height = 300,
}: ReferenceHandPanelProps) {
  const motionType: MotionType = SIGN_MOTION[sign.id] ?? "static";
  const anim = motionVariants[motionType];
  const fingerStates = useMemo(() => getFingerStates(sign), [sign.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const errSet = new Set(errorFingers);
  const handshapeName = HANDSHAPE_NAMES[sign.id] ?? "";

  return (
    <div className="flex flex-col gap-0 h-full">

      {/* ── Hand display ─────────────────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-2xl flex-shrink-0"
        style={{
          width, height,
          background: "radial-gradient(ellipse at 50% 25%, #1e1a2e 0%, #0f0c18 60%, #08060f 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        {/* Studio fill light — soft upper-left warm */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 25% 15%, rgba(255,210,160,0.055) 0%, transparent 55%)",
        }} />
        {/* Rim light — right edge cool */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 90% 40%, rgba(140,160,255,0.04) 0%, transparent 45%)",
        }} />
        {/* Ground shadow */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%)",
        }} />

        {/* Animated hand */}
        <motion.div
          animate={anim}
          style={{ originX: "50%", originY: "80%", filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.55))" }}
        >
          <RealisticHandSVG
            curls={sign.targetCurls}
            spread={sign.referenceSpread}
            wristTilt={sign.wristTilt}
            errorFingers={errorFingers}
            width={width * 0.82}
            height={height * 0.9}
          />
        </motion.div>

        {/* Motion arrow overlay for non-static signs */}
        {motionType !== "static" && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
            <MotionArrow type={motionType} />
          </div>
        )}

        {/* "Hold" indicator for static signs */}
        {motionType === "static" && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
            <span className="text-[10px] text-white/25 font-mono tracking-widest uppercase">HOLD</span>
          </div>
        )}
      </div>

      {/* ── Sign name + handshape ────────────────────────────────────────── */}
      <div className="mt-3 space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-white font-bold text-lg leading-tight">{sign.word}</h3>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            sign.difficulty === "beginner"
              ? "text-green-400 border-green-500/30 bg-green-500/10"
              : sign.difficulty === "intermediate"
                ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
                : "text-red-400 border-red-500/30 bg-red-500/10"
          }`}>
            {sign.difficulty}
          </span>
        </div>
        {handshapeName && (
          <p className="text-white/40 text-xs font-mono">{handshapeName}</p>
        )}
      </div>

      {/* ── Finger state bar ────────────────────────────────────────────── */}
      <div className="mt-3 flex gap-1.5">
        {fingerStates.map((f) => {
          const isExtended = f.curl < 0.35;
          const isError = errSet.has(f.name);
          return (
            <div key={f.name} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm rounded-b-none"
                style={{
                  height: `${Math.round((1 - f.curl) * 28 + 8)}px`,
                  background: isError
                    ? "linear-gradient(to top, #dc2626, #ef4444)"
                    : isExtended
                      ? "linear-gradient(to top, #16a34a, #22c55e)"
                      : "linear-gradient(to top, #374151, #4b5563)",
                  borderRadius: "3px 3px 0 0",
                  transition: "height 0.3s ease, background 0.3s ease",
                  boxShadow: isError
                    ? "0 0 6px rgba(239,68,68,0.45)"
                    : isExtended
                      ? "0 0 6px rgba(34,197,94,0.35)"
                      : "none",
                }}
              />
              <span className={`text-[9px] font-bold ${
                isError ? "text-red-400" : isExtended ? "text-green-400" : "text-white/30"
              }`}>
                {f.abbr}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[9px] text-white/20">Curled</span>
        <span className="text-[9px] text-white/20">Extended</span>
      </div>

      {/* ── Motion label ────────────────────────────────────────────────── */}
      <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/8">
        <MotionIcon type={motionType} />
        <span className="text-white/60 text-xs">{MOTION_LABELS[motionType]}</span>
      </div>

      {/* ── Step-by-step instructions ────────────────────────────────────── */}
      <div className="mt-3 space-y-1.5">
        <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">How to sign</p>
        {sign.tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-white/65 text-xs leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

// ── Motion arrow SVG ─────────────────────────────────────────────────────────

function MotionArrow({ type }: { type: MotionType }) {
  if (type === "nod") return (
    <svg width="48" height="20" viewBox="0 0 48 20" fill="none">
      <motion.path
        d="M 24 2 L 24 18"
        stroke="rgba(168,85,247,0.7)" strokeWidth="2" strokeLinecap="round"
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <path d="M 18 14 L 24 20 L 30 14" stroke="rgba(168,85,247,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 18 6 L 24 0 L 30 6" stroke="rgba(168,85,247,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
  if (type === "circle") return (
    <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
      <motion.ellipse
        cx="20" cy="10" rx="14" ry="7"
        stroke="rgba(168,85,247,0.7)" strokeWidth="2" strokeDasharray="4 3"
        animate={{ rotate: 360 }}
        style={{ originX: "20px", originY: "10px" }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
  if (type === "wave") return (
    <svg width="56" height="20" viewBox="0 0 56 20" fill="none">
      <motion.path
        d="M 4 10 L 52 10"
        stroke="rgba(168,85,247,0.7)" strokeWidth="2" strokeLinecap="round"
        animate={{ pathLength: [0, 1] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
      />
      <path d="M 46 4 L 52 10 L 46 16" stroke="rgba(168,85,247,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
  // snap / default
  return (
    <svg width="56" height="20" viewBox="0 0 56 20" fill="none">
      <motion.path
        d="M 4 10 L 38 10"
        stroke="rgba(168,85,247,0.7)" strokeWidth="2" strokeLinecap="round"
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
      />
      <path d="M 32 4 L 38 10 L 32 16" stroke="rgba(168,85,247,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function MotionIcon({ type }: { type: MotionType }) {
  const cls = "w-3.5 h-3.5 text-purple-400 flex-shrink-0";
  if (type === "nod")    return <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M8 2v12M5 11l3 3 3-3M5 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (type === "circle") return <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M13 8A5 5 0 1 1 8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8 1l3 2-3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (type === "wave")   return <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M2 8h10M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (type === "snap")   return <svg className={cls} viewBox="0 0 16 16" fill="none"><path d="M2 8h8M7 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" opacity="0.4"/></svg>;
  return <svg className={cls} viewBox="0 0 16 16" fill="none"><rect x="3" y="3" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>;
}
