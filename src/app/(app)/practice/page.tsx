"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, X, RotateCcw, ChevronLeft, ChevronRight,
  Zap, Target, Play, Volume2, VolumeX, Info,
  CheckCircle, Star, Trophy, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WebcamGestureOverlay } from "@/components/practice/webcam-gesture-overlay";
import { AccuracyDisplay } from "@/components/practice/accuracy-display";
import { HandPoseDisplay } from "@/components/practice/hand-pose-display";
import { useGestureRecognition } from "@/hooks/useGestureRecognition";
import { useSpeechFeedback, getFeedbackText } from "@/hooks/useSpeechFeedback";
import { SIGN_DEFINITIONS, SIGN_CATEGORIES } from "@/lib/gesture/sign-definitions";
import type { SignDefinition } from "@/lib/gesture/sign-definitions";
import { useTutorStore } from "@/store/tutor-store";
import { GamificationBar } from "@/components/practice/gamification-bar";

const SUCCESS_THRESHOLD = 90; // accuracy % needed to count a rep
const UNLOCK_THRESHOLD = 90;  // accuracy % needed to unlock lessons

export default function PracticeModePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentSignIdx, setCurrentSignIdx] = useState(0);
  const [showAvatar, setShowAvatar] = useState(true);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [bestAccuracy, setBestAccuracy] = useState(0);
  const [successStreak, setSuccessStreak] = useState(0);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const lastFeedbackAccuracy = useRef(-1);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const holdAccRef = useRef(0);

  const { speak, isSpeaking } = useSpeechFeedback();
  const tutorStore = useTutorStore();

  const filteredSigns = selectedCategory === "All"
    ? SIGN_DEFINITIONS
    : SIGN_DEFINITIONS.filter((s) => s.category === selectedCategory);

  const currentSign: SignDefinition = filteredSigns[currentSignIdx] ?? SIGN_DEFINITIONS[0];

  const { videoRef, canvasRef, cameraActive, cameraError, loading, result, startCamera, stopCamera } =
    useGestureRecognition({
      targetSign: currentSign,
      enabled: true,
      onResult: useCallback((r: import("@/hooks/useGestureRecognition").GestureResult) => {
        // Auto-count rep when accuracy holds above threshold for 600ms
        if (r.accuracy >= SUCCESS_THRESHOLD && r.handDetected) {
          holdAccRef.current = r.accuracy;
          if (!holdTimer.current) {
            holdTimer.current = setTimeout(() => {
              const acc = holdAccRef.current;
              if (acc >= SUCCESS_THRESHOLD) {
                setRepCount((prev) => prev + 1);
                setBestAccuracy((prev) => Math.max(prev, acc));
                setSuccessStreak((prev) => prev + 1);
                tutorStore.recordRep(currentSign.id, currentSign.word, acc);
                tutorStore.recordPracticeDay();
                tutorStore.updateLessonAccuracy(currentSign.category, acc);
                if (acc >= UNLOCK_THRESHOLD) setJustUnlocked(true);
              }
              holdTimer.current = null;
            }, 600);
          }
        } else {
          if (holdTimer.current) {
            clearTimeout(holdTimer.current);
            holdTimer.current = null;
          }
          if (r.accuracy < SUCCESS_THRESHOLD) setSuccessStreak(0);
        }

        // Spoken feedback every 3 seconds max
        if (speakEnabled && r.handDetected && Math.abs(r.accuracy - lastFeedbackAccuracy.current) > 15) {
          lastFeedbackAccuracy.current = r.accuracy;
          const text = getFeedbackText(r.accuracy, currentSign.word, r.errorFingers, repCount);
          speak(text);
        }
      }, [currentSign, speakEnabled, repCount, speak, tutorStore]),
    });

  // Reset per-sign stats when sign changes
  useEffect(() => {
    setRepCount(0);
    setBestAccuracy(0);
    setSuccessStreak(0);
    setJustUnlocked(false);
    lastFeedbackAccuracy.current = -1;
    if (holdTimer.current) clearTimeout(holdTimer.current);
  }, [currentSign.id]);

  const goToSign = (dir: 1 | -1) => {
    setCurrentSignIdx((prev) =>
      (prev + dir + filteredSigns.length) % filteredSigns.length
    );
  };

  const xpProgress = (tutorStore.xp % 100);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Camera className="w-7 h-7 text-green-400" />
            Practice Mode
          </h1>
          <p className="text-white/50 text-sm mt-0.5">Real-time gesture detection · MediaPipe Hands</p>
        </div>
        <GamificationBar />
      </motion.div>

      {/* Category filter */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT — Webcam */}
        <div className="lg:col-span-2 space-y-4">
          <WebcamGestureOverlay
            videoRef={videoRef}
            canvasRef={canvasRef}
            cameraActive={cameraActive}
            handDetected={result.handDetected}
            accuracy={result.accuracy}
          />

          {/* Camera controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {!cameraActive ? (
              <Button variant="gradient" size="lg" onClick={startCamera} disabled={loading} className="flex-1">
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
                {loading ? "Initializing…" : "Start Camera"}
              </Button>
            ) : (
              <Button variant="glass" onClick={stopCamera} className="text-red-400 hover:bg-red-500/10">
                <X className="w-4 h-4" />
                Stop
              </Button>
            )}

            <Button
              variant="glass"
              size="icon"
              onClick={() => setSpeakEnabled((v) => !v)}
              title={speakEnabled ? "Mute feedback" : "Enable spoken feedback"}
            >
              {speakEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-white/40" />}
            </Button>

            <Button
              variant="glass"
              size="icon"
              onClick={() => setShowAvatar((v) => !v)}
              title="Toggle 3D avatar"
            >
              <Star className={`w-4 h-4 ${showAvatar ? "text-yellow-400" : "text-white/40"}`} />
            </Button>

            {cameraError && (
              <p className="text-red-400 text-xs ml-2">{cameraError}</p>
            )}
          </div>

          {/* Accuracy display */}
          {cameraActive && result.handDetected && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <AccuracyDisplay
                accuracy={result.accuracy}
                fingerAccuracies={result.fingerAccuracies}
                errorFingers={result.errorFingers}
                repCount={repCount}
                bestAccuracy={bestAccuracy}
              />
            </motion.div>
          )}

          {/* Rep success toast */}
          <AnimatePresence>
            {justUnlocked && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                onAnimationComplete={() => setTimeout(() => setJustUnlocked(false), 2000)}
                className="glass rounded-xl p-3 border border-yellow-500/30 flex items-center gap-3"
              >
                <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-yellow-300 font-semibold text-sm">Lesson progress unlocked!</p>
                  <p className="text-white/50 text-xs">You hit 90%+ accuracy — new lessons available</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT — Sign Guide */}
        <div className="space-y-4">
          {/* Current sign info */}
          <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/20">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="purple">{currentSign.category}</Badge>
                <Badge variant={currentSign.difficulty === "beginner" ? "success" : currentSign.difficulty === "intermediate" ? "warning" : "danger"}>
                  {currentSign.difficulty}
                </Badge>
              </div>

              <div className="text-center">
                <h2 className="text-white font-bold text-2xl">{currentSign.word}</h2>
                <p className="text-white/60 text-sm mt-1">{currentSign.description}</p>
              </div>

              {/* Realistic hand reference */}
              <AnimatePresence>
                {showAvatar && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex justify-center"
                  >
                    <HandPoseDisplay
                      targetSign={currentSign}
                      liveCurls={result.handDetected ? (result.features?.curls as [number,number,number,number,number] ?? null) : null}
                      errorFingers={result.errorFingers}
                      animated
                      width={220}
                      height={260}
                      className="rounded-xl overflow-hidden bg-black/30"
                    />
                    <p className="text-white/30 text-xs text-center mt-1 absolute bottom-1 left-0 right-0">
                      Red fingers = adjust position
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Instructions */}
              <div className="glass p-3 rounded-xl">
                <button
                  onClick={() => setShowInfo((v) => !v)}
                  className="flex items-center gap-2 text-blue-400 text-sm font-medium w-full text-left"
                >
                  <Info className="w-4 h-4 flex-shrink-0" />
                  How to sign this
                </button>
                <AnimatePresence>
                  {showInfo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-white/60 text-xs mt-2 leading-relaxed">{currentSign.instruction}</p>
                      {currentSign.tips.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {currentSign.tips.map((tip, i) => (
                            <li key={i} className="text-white/50 text-xs flex items-start gap-1.5">
                              <span className="text-purple-400 mt-0.5">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Rep counter */}
              <div className="flex items-center justify-between glass rounded-xl p-3">
                <div className="text-center">
                  <div className="text-xl font-black text-white">{repCount}</div>
                  <div className="text-white/40 text-xs">Reps</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-green-400">{successStreak}</div>
                  <div className="text-white/40 text-xs">Streak</div>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-black ${bestAccuracy >= 90 ? "text-yellow-400" : "text-white"}`}>
                    {bestAccuracy}%
                  </div>
                  <div className="text-white/40 text-xs">Best</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-black text-purple-400">
                    +{tutorStore.signReps[currentSign.id] ?? 0 > 0 ? (tutorStore.signReps[currentSign.id] ?? 0) * currentSign.xpPerRep : 0}
                  </div>
                  <div className="text-white/40 text-xs">XP</div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-2">
                <Button variant="glass" size="sm" onClick={() => goToSign(-1)} className="flex-1">
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </Button>
                <Button variant="glass" size="sm" onClick={() => goToSign(1)} className="flex-1">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Signs list */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-3">
                All Signs ({filteredSigns.length})
              </h3>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                {filteredSigns.map((sign, i) => {
                  const reps = tutorStore.signReps[sign.id] ?? 0;
                  const best = tutorStore.lessonAccuracy[sign.category] ?? 0;
                  return (
                    <button
                      key={sign.id}
                      onClick={() => setCurrentSignIdx(i)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all ${
                        i === currentSignIdx
                          ? "bg-purple-500/20 border border-purple-500/30"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <span className="text-white/70 text-sm flex-1">{sign.word}</span>
                      {reps > 0 && (
                        <span className="text-xs text-purple-400 font-medium">{reps}×</span>
                      )}
                      {best >= 90 && (
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
