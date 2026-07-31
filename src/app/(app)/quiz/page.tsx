"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, CheckCircle, X, RotateCcw, Zap, Trophy,
  Brain, Play, Camera, Volume2, VolumeX, Hand
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { WebcamGestureOverlay } from "@/components/practice/webcam-gesture-overlay";
import { HandPoseDisplay } from "@/components/practice/hand-pose-display";
import { useGestureRecognition } from "@/hooks/useGestureRecognition";
import { useSpeechFeedback } from "@/hooks/useSpeechFeedback";
import { SIGN_DEFINITIONS } from "@/lib/gesture/sign-definitions";
import type { SignDefinition } from "@/lib/gesture/sign-definitions";
import { useTutorStore } from "@/store/tutor-store";
import { GamificationBar } from "@/components/practice/gamification-bar";
import type { QuizQuestion } from "@/types";

// ------- Text-based quiz questions -------
const TEXT_QUESTIONS: QuizQuestion[] = [
  { id: "t1", type: "multiple-choice", question: "What sign uses a flat hand moving away from the forehead?", options: ["Hello", "Thank You", "Please", "Sorry"], correctAnswer: "Hello", xpReward: 20 },
  { id: "t2", type: "multiple-choice", question: "How do you sign 'Thank You' in ASL?", options: ["Wave hand", "Flat hand from chin outward", "Tap forehead", "Circle on chest"], correctAnswer: "Flat hand from chin outward", xpReward: 20 },
  { id: "t3", type: "multiple-choice", question: "Which handshape is used for the letter 'A' in ASL?", options: ["Open palm", "Fist with thumb on side", "Two fingers up", "Curved hand"], correctAnswer: "Fist with thumb on side", xpReward: 25 },
  { id: "t4", type: "multiple-choice", question: "What does a 'W' handshape tapping the chin represent?", options: ["Welcome", "Water", "Work", "Write"], correctAnswer: "Water", xpReward: 20 },
  { id: "t5", type: "multiple-choice", question: "How is 'Help' signed in ASL?", options: ["Wave both hands", "Fist on flat palm, lift upward", "Point to person", "Clap hands"], correctAnswer: "Fist on flat palm, lift upward", xpReward: 25 },
  { id: "t6", type: "multiple-choice", question: "Which sign involves a fist circling on the chest?", options: ["Sorry", "Please", "Water", "Doctor"], correctAnswer: "Sorry", xpReward: 20 },
  { id: "t7", type: "multiple-choice", question: "What does a fist nodding up and down represent?", options: ["No", "Yes", "Maybe", "Help"], correctAnswer: "Yes", xpReward: 20 },
  { id: "t8", type: "multiple-choice", question: "The ASL sign for 'Doctor' involves tapping which body part?", options: ["Forehead", "Chest", "Wrist", "Elbow"], correctAnswer: "Wrist", xpReward: 25 },
];

// Quiz modes
type QuizMode = "select" | "text" | "gesture" | "complete";
type TextQuizType = "standard" | "timed";

const GESTURE_HOLD_MS = 1200;
const GESTURE_ACCURACY_THRESHOLD = 75;

// Pick a random subset of signs for gesture quiz
function pickGestureSigns(n = 5): SignDefinition[] {
  const pool = [...SIGN_DEFINITIONS].filter((s) => s.difficulty === "beginner");
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// ------- Gesture Quiz Round -------
interface GestureRoundProps {
  sign: SignDefinition;
  onSuccess: (accuracy: number) => void;
  onSkip: () => void;
  roundIndex: number;
  totalRounds: number;
  speakEnabled: boolean;
}

function GestureRound({ sign, onSuccess, onSkip, roundIndex, totalRounds, speakEnabled }: GestureRoundProps) {
  const [holdProgress, setHoldProgress] = useState(0);
  const holdStart = useRef<number | null>(null);
  const holdInterval = useRef<NodeJS.Timeout | null>(null);
  const succeeded = useRef(false);
  const { speak } = useSpeechFeedback();

  const { videoRef, canvasRef, cameraActive, cameraError, loading, result, startCamera, stopCamera } =
    useGestureRecognition({
      targetSign: sign,
      enabled: true,
      onResult: useCallback((r: import("@/hooks/useGestureRecognition").GestureResult) => {
        if (succeeded.current) return;

        if (r.accuracy >= GESTURE_ACCURACY_THRESHOLD && r.handDetected) {
          if (!holdStart.current) {
            holdStart.current = Date.now();
            holdInterval.current = setInterval(() => {
              const elapsed = Date.now() - (holdStart.current ?? Date.now());
              const progress = Math.min((elapsed / GESTURE_HOLD_MS) * 100, 100);
              setHoldProgress(progress);
              if (progress >= 100) {
                clearInterval(holdInterval.current!);
                holdInterval.current = null;
                holdStart.current = null;
                succeeded.current = true;
                if (speakEnabled) speak(`Correct! Great ${sign.word}!`);
                setTimeout(() => onSuccess(r.accuracy), 400);
              }
            }, 50);
          }
        } else {
          if (holdInterval.current) {
            clearInterval(holdInterval.current);
            holdInterval.current = null;
          }
          holdStart.current = null;
          setHoldProgress(0);
        }
      }, [sign, onSuccess, speakEnabled, speak]),
    });

  useEffect(() => {
    return () => {
      if (holdInterval.current) clearInterval(holdInterval.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Round info */}
      <div className="flex items-center justify-between">
        <Badge variant="purple">Round {roundIndex + 1} of {totalRounds}</Badge>
        <Badge variant="info">Gesture Challenge</Badge>
      </div>

      <div className="text-center">
        <h2 className="text-white text-2xl font-bold">Sign: {sign.word}</h2>
        <p className="text-white/50 text-sm mt-1">{sign.instruction}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Realistic hand reference */}
        <div className="flex justify-center">
          <HandPoseDisplay
            targetSign={sign}
            errorFingers={result.errorFingers}
            animated
            width={200}
            height={240}
            className="rounded-xl overflow-hidden bg-black/40 border border-white/10"
          />
        </div>

        {/* Webcam */}
        <div className="space-y-3">
          <WebcamGestureOverlay
            videoRef={videoRef}
            canvasRef={canvasRef}
            cameraActive={cameraActive}
            handDetected={result.handDetected}
            accuracy={result.accuracy}
          />

          {!cameraActive && (
            <Button variant="gradient" size="sm" onClick={startCamera} disabled={loading} className="w-full">
              <Camera className="w-4 h-4" />
              {loading ? "Starting…" : "Start Camera"}
            </Button>
          )}

          {/* Hold-to-confirm progress bar */}
          {cameraActive && result.handDetected && result.accuracy >= GESTURE_ACCURACY_THRESHOLD && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-green-400">Hold steady…</span>
                <span className="text-white/40">{Math.round(holdProgress)}%</span>
              </div>
              <Progress value={holdProgress} variant="success" className="h-2" />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="glass" size="sm" onClick={onSkip} className="flex-1">
          Skip →
        </Button>
      </div>
    </div>
  );
}

// ------- Main Quiz Page -------
export default function QuizPage() {
  const [mode, setMode] = useState<QuizMode>("select");
  const [textQuizType, setTextQuizType] = useState<TextQuizType>("standard");

  // Text quiz state
  const [textQuestions] = useState<QuizQuestion[]>(TEXT_QUESTIONS);
  const [textIndex, setTextIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [textScore, setTextScore] = useState(0);
  const [textXP, setTextXP] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  // Gesture quiz state
  const [gestureSigns, setGestureSigns] = useState<SignDefinition[]>([]);
  const [gestureIndex, setGestureIndex] = useState(0);
  const [gestureScore, setGestureScore] = useState(0);
  const [gestureXP, setGestureXP] = useState(0);
  const [speakEnabled, setSpeakEnabled] = useState(true);

  const tutorStore = useTutorStore();
  const { speak } = useSpeechFeedback();

  // Timer for timed text quiz
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0 && !showResult) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && timerActive && !showResult) {
      handleTextAnswer("");
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, showResult]);

  // ---- Text quiz handlers ----
  function handleTextAnswer(answer: string) {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    setTimerActive(false);

    const q = textQuestions[textIndex];
    if (answer === q?.correctAnswer) {
      const timeBonus = textQuizType === "timed" ? Math.floor(timeLeft / 2) : 0;
      const earned = (q.xpReward ?? 20) + timeBonus;
      setTextScore((s) => s + 1);
      setTextXP((x) => x + earned);
      tutorStore.addXP(earned);
    }
  }

  function nextTextQuestion() {
    if (textIndex + 1 >= textQuestions.length) {
      setMode("complete");
      const acc = Math.round((textScore / textQuestions.length) * 100);
      if (acc >= 90) tutorStore.unlockBadge("quiz-ace");
    } else {
      setTextIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
      setTimerActive(textQuizType === "timed");
    }
  }

  function startTextQuiz() {
    setTextIndex(0);
    setTextScore(0);
    setTextXP(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(30);
    setTimerActive(textQuizType === "timed");
    setMode("text");
  }

  // ---- Gesture quiz handlers ----
  function startGestureQuiz() {
    setGestureSigns(pickGestureSigns(5));
    setGestureIndex(0);
    setGestureScore(0);
    setGestureXP(0);
    setMode("gesture");
  }

  function handleGestureSuccess(accuracy: number) {
    const xp = Math.round((accuracy / 100) * 30);
    setGestureScore((s) => s + 1);
    setGestureXP((x) => x + xp);
    tutorStore.addXP(xp);
    tutorStore.recordPracticeDay();
    nextGestureRound();
  }

  function handleGestureSkip() {
    nextGestureRound();
  }

  function nextGestureRound() {
    if (gestureIndex + 1 >= gestureSigns.length) {
      setMode("complete");
    } else {
      setGestureIndex((i) => i + 1);
    }
  }

  function resetAll() {
    setMode("select");
    setTextIndex(0);
    setTextScore(0);
    setTextXP(0);
    setGestureIndex(0);
    setGestureScore(0);
    setGestureXP(0);
    setSelectedAnswer(null);
    setShowResult(false);
  }

  const currentTextQ = textQuestions[textIndex];
  const finalScore = mode === "complete"
    ? (textIndex > 0 ? `${textScore}/${textQuestions.length}` : `${gestureScore}/${gestureSigns.length}`)
    : "";
  const finalXP = textXP + gestureXP;
  const finalAccuracy = mode === "complete"
    ? (textIndex > 0
        ? Math.round((textScore / textQuestions.length) * 100)
        : Math.round((gestureScore / Math.max(gestureSigns.length, 1)) * 100))
    : 0;

  // ===== SELECT MODE =====
  if (mode === "select") {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-400" />
              Quiz Mode
            </h1>
            <p className="text-white/50 mt-1">Test your ASL knowledge — text or gesture challenges</p>
          </div>
          <GamificationBar />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Text quizzes */}
          {([
            { type: "standard" as TextQuizType, title: "Standard Quiz", desc: "8 text questions, no time limit", icon: "📝", color: "from-blue-600/20 to-purple-600/20", border: "border-blue-500/30" },
            { type: "timed" as TextQuizType, title: "Timed Challenge", desc: "30 seconds per question", icon: "⏱️", color: "from-orange-600/20 to-red-600/20", border: "border-orange-500/30" },
          ] as const).map((opt) => (
            <motion.button
              key={opt.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setTextQuizType(opt.type)}
              className={`p-5 rounded-2xl bg-gradient-to-br ${opt.color} border-2 transition-all text-left ${
                textQuizType === opt.type ? `${opt.border} scale-[1.02]` : "border-white/5 hover:border-white/20"
              }`}
            >
              <div className="text-3xl mb-2">{opt.icon}</div>
              <h3 className="text-white font-semibold text-base">{opt.title}</h3>
              <p className="text-white/50 text-sm">{opt.desc}</p>
            </motion.button>
          ))}

          {/* Gesture quiz */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="sm:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-green-600/20 to-teal-600/20 border-2 border-green-500/30"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-3xl mb-2">🤟</div>
                <h3 className="text-white font-semibold text-base">Gesture Quiz</h3>
                <p className="text-white/50 text-sm">5 rounds · Show the correct sign on camera to score</p>
              </div>
              <Button variant="gradient" onClick={startGestureQuiz}>
                <Hand className="w-4 h-4" />
                Start Gesture Quiz
              </Button>
            </div>
          </motion.div>
        </div>

        <Button variant="gradient" size="lg" className="w-full" onClick={startTextQuiz}>
          <Brain className="w-5 h-5" />
          Start {textQuizType === "standard" ? "Standard" : "Timed"} Quiz
        </Button>
      </div>
    );
  }

  // ===== GESTURE MODE =====
  if (mode === "gesture") {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Hand className="w-6 h-6 text-green-400" />
              Gesture Quiz
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Progress
                value={((gestureIndex) / gestureSigns.length) * 100}
                variant="gradient"
                className="w-40 h-2"
              />
              <span className="text-white/40 text-sm">{gestureIndex}/{gestureSigns.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass px-3 py-1.5 rounded-xl text-sm text-white">
              Score: <span className="font-bold text-green-400">{gestureScore}</span>
            </div>
            <div className="glass px-3 py-1.5 rounded-xl text-sm text-white">
              <Zap className="w-3.5 h-3.5 text-yellow-400 inline mr-1" />
              {gestureXP} XP
            </div>
            <Button
              variant="glass"
              size="icon"
              onClick={() => setSpeakEnabled((v) => !v)}
            >
              {speakEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-white/40" />}
            </Button>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-green-900/30 to-teal-900/30 border-green-500/20">
          <CardContent className="p-5">
            {gestureSigns[gestureIndex] && (
              <GestureRound
                key={gestureSigns[gestureIndex].id}
                sign={gestureSigns[gestureIndex]}
                onSuccess={handleGestureSuccess}
                onSkip={handleGestureSkip}
                roundIndex={gestureIndex}
                totalRounds={gestureSigns.length}
                speakEnabled={speakEnabled}
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== TEXT QUIZ MODE =====
  if (mode === "text") {
    if (!currentTextQ) return null;
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">ASL Quiz</h1>
            <p className="text-white/50 text-sm">Question {textIndex + 1} of {textQuestions.length}</p>
          </div>
          <div className="flex items-center gap-3">
            {textQuizType === "timed" && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass ${
                timeLeft <= 10 ? "text-red-400 border border-red-500/30" : "text-white"
              }`}>
                <span className="font-bold tabular-nums text-sm">{timeLeft}s</span>
              </div>
            )}
            <div className="glass px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-bold text-sm">+{textXP} XP</span>
            </div>
          </div>
        </div>

        <Progress value={((textIndex) / textQuestions.length) * 100} variant="gradient" className="h-2" />

        <AnimatePresence mode="wait">
          <motion.div
            key={textIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="space-y-4"
          >
            <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/20">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-300 font-bold text-sm">{textIndex + 1}</span>
                  </div>
                  <h2 className="text-white text-lg font-semibold">{currentTextQ.question}</h2>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentTextQ.options?.map((opt) => {
                let style = "glass border-white/10 text-white hover:border-white/30";
                if (showResult) {
                  if (opt === currentTextQ.correctAnswer) style = "bg-green-500/20 border-green-500/60 text-green-300";
                  else if (opt === selectedAnswer) style = "bg-red-500/20 border-red-500/60 text-red-300";
                }
                return (
                  <motion.button
                    key={opt}
                    whileHover={!showResult ? { scale: 1.02 } : {}}
                    whileTap={!showResult ? { scale: 0.98 } : {}}
                    onClick={() => handleTextAnswer(opt)}
                    disabled={showResult}
                    className={`p-4 rounded-xl text-left transition-all border text-sm font-medium ${style}`}
                  >
                    <div className="flex items-center gap-3">
                      {showResult && opt === currentTextQ.correctAnswer && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />}
                      {showResult && opt === selectedAnswer && opt !== currentTextQ.correctAnswer && <X className="w-4 h-4 text-red-400 flex-shrink-0" />}
                      {opt}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl flex items-center justify-between ${
                  selectedAnswer === currentTextQ.correctAnswer
                    ? "bg-green-900/30 border border-green-500/30"
                    : "bg-red-900/30 border border-red-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  {selectedAnswer === currentTextQ.correctAnswer ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <div>
                        <div className="text-green-300 font-semibold">Correct! 🎉</div>
                        <div className="text-green-400/70 text-xs">+{currentTextQ.xpReward} XP</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <X className="w-6 h-6 text-red-400" />
                      <div>
                        <div className="text-red-300 font-semibold">Incorrect</div>
                        <div className="text-red-400/70 text-xs">Answer: {currentTextQ.correctAnswer}</div>
                      </div>
                    </>
                  )}
                </div>
                <Button variant="gradient" size="sm" onClick={nextTextQuestion}>
                  {textIndex + 1 < textQuestions.length ? "Next" : "Finish"}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ===== COMPLETE =====
  const rating = finalAccuracy >= 90 ? "🏆 Outstanding!" : finalAccuracy >= 70 ? "⭐ Well Done!" : "💪 Keep Practicing!";
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500/20 p-8">
          <CardContent className="p-0 space-y-6">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
            <div>
              <h2 className="text-4xl font-black text-white mb-2">{rating}</h2>
              <p className="text-white/60">Quiz Complete!</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Score", value: finalScore, icon: "🎯" },
                { label: "Accuracy", value: `${finalAccuracy}%`, icon: "📊" },
                { label: "XP Earned", value: `+${finalXP}`, icon: "⚡" },
              ].map((stat) => (
                <div key={stat.label} className="glass p-4 rounded-xl">
                  <div className="text-3xl mb-1">{stat.icon}</div>
                  <div className="text-white font-bold text-xl">{stat.value}</div>
                  <div className="text-white/40 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>

            <Progress value={finalAccuracy} variant={finalAccuracy >= 80 ? "success" : finalAccuracy >= 60 ? "gradient" : "warning"} className="h-3" />

            <div className="flex gap-3">
              <Button variant="glass" className="flex-1" onClick={resetAll}>
                <RotateCcw className="w-4 h-4" />
                New Quiz
              </Button>
              <Button variant="gradient" className="flex-1" onClick={startGestureQuiz}>
                <Hand className="w-4 h-4" />
                Gesture Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
