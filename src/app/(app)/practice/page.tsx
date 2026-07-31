"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, X, ChevronLeft, ChevronRight,
  Volume2, VolumeX, CheckCircle, Trophy,
  ArrowRight, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebcamGestureOverlay } from "@/components/practice/webcam-gesture-overlay";
import { AccuracyDisplay } from "@/components/practice/accuracy-display";
import { ReferenceHandPanel } from "@/components/practice/reference-hand-panel";
import { useGestureRecognition } from "@/hooks/useGestureRecognition";
import { useSpeechFeedback, getFeedbackText } from "@/hooks/useSpeechFeedback";
import { SIGN_DEFINITIONS, SIGN_CATEGORIES } from "@/lib/gesture/sign-definitions";
import type { SignDefinition } from "@/lib/gesture/sign-definitions";
import { useTutorStore } from "@/store/tutor-store";
import { GamificationBar } from "@/components/practice/gamification-bar";

const SUCCESS_THRESHOLD = 90;
const UNLOCK_THRESHOLD  = 90;

export default function PracticeModePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentSignIdx,   setCurrentSignIdx]   = useState(0);
  const [speakEnabled,     setSpeakEnabled]     = useState(true);
  const [repCount,         setRepCount]         = useState(0);
  const [bestAccuracy,     setBestAccuracy]     = useState(0);
  const [successStreak,    setSuccessStreak]    = useState(0);
  const [justUnlocked,     setJustUnlocked]     = useState(false);

  const lastFeedbackAcc = useRef(-1);
  const holdTimer       = useRef<NodeJS.Timeout | null>(null);
  const holdAccRef      = useRef(0);

  const { speak }    = useSpeechFeedback();
  const tutorStore   = useTutorStore();

  const filteredSigns = selectedCategory === "All"
    ? SIGN_DEFINITIONS
    : SIGN_DEFINITIONS.filter((s) => s.category === selectedCategory);

  const currentSign: SignDefinition = filteredSigns[currentSignIdx] ?? SIGN_DEFINITIONS[0];

  const { videoRef, canvasRef, cameraActive, cameraError, loading, result, startCamera, stopCamera } =
    useGestureRecognition({
      targetSign: currentSign,
      enabled: true,
      onResult: useCallback((r: import("@/hooks/useGestureRecognition").GestureResult) => {
        if (r.accuracy >= SUCCESS_THRESHOLD && r.handDetected) {
          holdAccRef.current = r.accuracy;
          if (!holdTimer.current) {
            holdTimer.current = setTimeout(() => {
              const acc = holdAccRef.current;
              if (acc >= SUCCESS_THRESHOLD) {
                setRepCount(p => p + 1);
                setBestAccuracy(p => Math.max(p, acc));
                setSuccessStreak(p => p + 1);
                tutorStore.recordRep(currentSign.id, currentSign.word, acc);
                tutorStore.recordPracticeDay();
                tutorStore.updateLessonAccuracy(currentSign.category, acc);
                if (acc >= UNLOCK_THRESHOLD) setJustUnlocked(true);
              }
              holdTimer.current = null;
            }, 600);
          }
        } else {
          if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
          if (r.accuracy < SUCCESS_THRESHOLD) setSuccessStreak(0);
        }
        if (speakEnabled && r.handDetected && Math.abs(r.accuracy - lastFeedbackAcc.current) > 15) {
          lastFeedbackAcc.current = r.accuracy;
          speak(getFeedbackText(r.accuracy, currentSign.word, r.errorFingers, repCount));
        }
      }, [currentSign, speakEnabled, repCount, speak, tutorStore]),
    });

  useEffect(() => {
    setRepCount(0); setBestAccuracy(0); setSuccessStreak(0); setJustUnlocked(false);
    lastFeedbackAcc.current = -1;
    if (holdTimer.current) clearTimeout(holdTimer.current);
  }, [currentSign.id]);

  const goToSign = (dir: 1 | -1) =>
    setCurrentSignIdx(p => (p + dir + filteredSigns.length) % filteredSigns.length);

  // ── Overall accuracy colour ───────────────────────────────────────────────
  const acc = result.accuracy;
  const accColor =
    acc >= 90 ? "#22c55e" : acc >= 70 ? "#3b82f6" : acc >= 50 ? "#eab308" : "#ef4444";

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1400px] mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Camera className="w-7 h-7 text-green-400" />
            Practice Mode
          </h1>
          <p className="text-white/40 text-sm mt-0.5">
            Real-time MediaPipe detection · Match the reference hand
          </p>
        </div>
        <GamificationBar />
      </motion.div>

      {/* ── Category filter ──────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {["All", ...SIGN_CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setCurrentSignIdx(0); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedCategory === cat
                ? "bg-purple-600 text-white"
                : "glass text-white/50 hover:text-white border border-white/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Sign title bar ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="glass" size="sm" onClick={() => goToSign(-1)} className="flex-shrink-0">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-white font-bold text-xl leading-tight truncate">{currentSign.word}</h2>
            <p className="text-white/40 text-xs truncate">{currentSign.description}</p>
          </div>
          <Button variant="glass" size="sm" onClick={() => goToSign(1)} className="flex-shrink-0">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Rep / streak counters */}
          {[
            { label: "Reps",   value: repCount,      color: "text-white" },
            { label: "Streak", value: successStreak, color: "text-green-400" },
            { label: "Best",   value: `${bestAccuracy}%`, color: bestAccuracy >= 90 ? "text-yellow-400" : "text-white" },
          ].map(({ label, value, color }) => (
            <div key={label} className="hidden sm:flex flex-col items-center glass rounded-xl px-3 py-1.5 min-w-[52px]">
              <span className={`text-base font-black ${color}`}>{value}</span>
              <span className="text-white/30 text-[10px]">{label}</span>
            </div>
          ))}

          <Button
            variant="glass" size="icon"
            onClick={() => setSpeakEnabled(v => !v)}
            title={speakEnabled ? "Mute" : "Enable voice feedback"}
          >
            {speakEnabled
              ? <Volume2 className="w-4 h-4 text-blue-400" />
              : <VolumeX  className="w-4 h-4 text-white/40" />}
          </Button>
        </div>
      </div>

      {/* ── THREE-COLUMN COMPARISON LAYOUT ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_360px] gap-4 items-start">

        {/* ── LEFT: Live webcam ─────────────────────────────────────────── */}
        <div className="space-y-3">

          {/* Column header */}
          <div className="flex items-center gap-2 px-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/60 text-xs font-semibold uppercase tracking-wide">Your Hand — Live</span>
          </div>

          <WebcamGestureOverlay
            videoRef={videoRef}
            canvasRef={canvasRef}
            cameraActive={cameraActive}
            handDetected={result.handDetected}
            accuracy={result.accuracy}
            onStart={startCamera}
          />

          {/* Camera controls */}
          <div className="flex items-center gap-2">
            {!cameraActive ? (
              <Button
                variant="gradient" size="sm"
                onClick={startCamera} disabled={loading}
                className="flex-1"
              >
                {loading
                  ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <Camera className="w-4 h-4" />}
                {loading ? "Initializing MediaPipe…" : "Start Camera"}
              </Button>
            ) : (
              <Button variant="glass" size="sm" onClick={stopCamera} className="text-red-400 hover:bg-red-500/10">
                <X className="w-4 h-4" />
                Stop
              </Button>
            )}
            {cameraError && <p className="text-red-400 text-xs">{cameraError}</p>}
          </div>

          {/* Accuracy panel — only when hand is detected */}
          <AnimatePresence>
            {cameraActive && result.handDetected && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                <AccuracyDisplay
                  accuracy={result.accuracy}
                  fingerAccuracies={result.fingerAccuracies}
                  errorFingers={result.errorFingers}
                  repCount={repCount}
                  bestAccuracy={bestAccuracy}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unlock toast */}
          <AnimatePresence>
            {justUnlocked && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.92 }}
                animate={{ opacity: 1, y: 0,  scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.92 }}
                onAnimationComplete={() => setTimeout(() => setJustUnlocked(false), 2200)}
                className="glass rounded-xl p-3 border border-yellow-500/30 flex items-center gap-3"
              >
                <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-yellow-300 font-semibold text-sm">90%+ — lesson progress unlocked!</p>
                  <p className="text-white/50 text-xs">New signs available in the Learn section</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── CENTER: Comparison arrow ──────────────────────────────────── */}
        <div className="hidden lg:flex flex-col items-center justify-start pt-10 gap-3 w-16">
          {/* Animated comparison arrow */}
          <motion.div
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1"
          >
            <ArrowRight className="w-7 h-7 text-white/20" />
          </motion.div>

          {/* Live accuracy gauge — vertical pill */}
          {cameraActive && result.handDetected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-1 mt-4"
            >
              {/* Vertical progress bar */}
              <div
                className="w-2 rounded-full overflow-hidden bg-white/10"
                style={{ height: 80 }}
              >
                <motion.div
                  animate={{ height: `${acc}%` }}
                  transition={{ type: "spring", stiffness: 80 }}
                  className="w-full rounded-full mt-auto"
                  style={{
                    background: `linear-gradient(to top, ${accColor}99, ${accColor})`,
                    marginTop: `${100 - acc}%`,
                  }}
                />
              </div>
              <span
                className="text-[10px] font-black tabular-nums"
                style={{ color: accColor }}
              >
                {acc}%
              </span>
            </motion.div>
          )}
        </div>

        {/* ── RIGHT: Reference panel ────────────────────────────────────── */}
        <div className="space-y-3">

          {/* Column header */}
          <div className="flex items-center gap-2 px-1">
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-white/60 text-xs font-semibold uppercase tracking-wide">
              ASL Reference · {currentSign.category}
            </span>
          </div>

          {/* Reference card */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(88,28,135,0.18) 0%, rgba(30,27,75,0.25) 50%, rgba(10,10,20,0.35) 100%)",
              border: "1px solid rgba(168,85,247,0.15)",
            }}
          >
            <div className="p-4 pb-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSign.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <ReferenceHandPanel
                    sign={currentSign}
                    errorFingers={result.handDetected ? result.errorFingers : []}
                    width={328}
                    height={290}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Sign list */}
          <div className="glass rounded-2xl p-4">
            <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-2">
              {filteredSigns.length} Signs
            </p>
            <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
              {filteredSigns.map((sign, i) => {
                const reps = tutorStore.signReps[sign.id] ?? 0;
                const best = tutorStore.lessonAccuracy[sign.category] ?? 0;
                const isCurrent = i === currentSignIdx;
                return (
                  <button
                    key={sign.id}
                    onClick={() => setCurrentSignIdx(i)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all text-sm ${
                      isCurrent
                        ? "bg-purple-500/20 border border-purple-500/25 text-white"
                        : "hover:bg-white/5 text-white/55 hover:text-white/80"
                    }`}
                  >
                    <span className="flex-1 truncate">{sign.word}</span>
                    {reps > 0 && (
                      <span className="text-[10px] text-purple-400 font-semibold flex-shrink-0">{reps}×</span>
                    )}
                    {best >= UNLOCK_THRESHOLD && (
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
