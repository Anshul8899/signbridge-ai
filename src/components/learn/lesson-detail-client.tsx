"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Play, Pause, RotateCcw, Zap, BookOpen,
  CheckCircle, Star, Trophy, Clock, Info, Hand
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { Lesson, Sign } from "@/types";

interface LessonDetailClientProps {
  lesson: Lesson;
}

function SignCard({ sign, isActive }: { sign: Sign; isActive: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Sign-specific hand emoji mapping
  const signEmojis: Record<string, string> = {
    hello: "👋", goodbye: "👋", "thank-you": "🙏", please: "🙏", sorry: "😔",
    welcome: "🤗", yes: "✊", no: "✌️", help: "🆘", water: "💧",
    hospital: "🏥", mother: "👩", father: "👨", eat: "😋", drink: "🥤",
    learn: "📚", work: "💼", doctor: "👨‍⚕️", airplane: "✈️",
  };

  const emoji = signEmojis[sign.id] || "🤟";

  return (
    <div className="space-y-6">
      {/* Animation Display */}
      <div className="relative aspect-square max-w-sm mx-auto rounded-3xl bg-gradient-to-br from-[#0f0c29] to-[#302b63] overflow-hidden border border-white/10">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(168,85,247,0.3) 0%, transparent 70%)`,
          }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={isPlaying ? {
            scale: [1, 1.1, 0.95, 1.05, 1],
            rotate: [0, -5, 10, -5, 0],
          } : {}}
          transition={{ duration: 2 / speed, repeat: isPlaying ? Infinity : 0, ease: "easeInOut" }}
        >
          <span className="text-[100px]" style={{ filter: "drop-shadow(0 0 30px rgba(168,85,247,0.8))" }}>
            {emoji}
          </span>
        </motion.div>

        {/* Controls Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "Pause" : "Animate"}
          </button>
          <button
            onClick={() => setIsPlaying(false)}
            className="p-2 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <select
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="px-3 py-2 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white text-xs focus:outline-none"
          >
            <option value="0.5" className="bg-[#1a1a2e]">0.5x</option>
            <option value="1" className="bg-[#1a1a2e]">1x</option>
            <option value="1.5" className="bg-[#1a1a2e]">1.5x</option>
            <option value="2" className="bg-[#1a1a2e]">2x</option>
          </select>
        </div>
      </div>

      {/* Sign Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Hand Shape", value: sign.handShape, icon: Hand },
          { label: "Movement", value: sign.movement, icon: Play },
          { label: "Location", value: sign.location, icon: Info },
        ].map((info) => (
          <div key={info.label} className="glass p-4 rounded-xl">
            <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
              <info.icon className="w-3 h-3" />
              {info.label}
            </div>
            <div className="text-white font-medium text-sm">{info.value}</div>
          </div>
        ))}
        {sign.exampleSentence && (
          <div className="glass p-4 rounded-xl sm:col-span-2">
            <div className="text-white/40 text-xs mb-1">Example Sentence</div>
            <div className="text-white text-sm italic">"{sign.exampleSentence}"</div>
          </div>
        )}
      </div>

      <div className="glass p-4 rounded-xl border border-purple-500/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-white font-medium text-sm mb-1">{sign.word}</div>
            <p className="text-white/60 text-sm">{sign.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LessonDetailClient({ lesson }: LessonDetailClientProps) {
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [completedSigns, setCompletedSigns] = useState<Set<string>>(new Set());
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);

  const currentSign = lesson.signs[currentSignIndex];
  const progress = (completedSigns.size / lesson.signs.length) * 100;

  const markComplete = () => {
    setCompletedSigns((prev) => new Set([...prev, currentSign.id]));
    if (currentSignIndex < lesson.signs.length - 1) {
      setTimeout(() => setCurrentSignIndex(currentSignIndex + 1), 500);
    }
  };

  // Quick quiz options
  const quizOptions = lesson.signs.length >= 4
    ? [lesson.signs[currentSignIndex], ...lesson.signs.filter((_, i) => i !== currentSignIndex).slice(0, 3)]
        .sort(() => Math.random() - 0.5)
    : lesson.signs.slice(0, Math.min(4, lesson.signs.length));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/learn" className="p-2 rounded-xl glass text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{lesson.thumbnail}</span>
            <div>
              <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={
                  lesson.difficulty === "beginner" ? "success" :
                  lesson.difficulty === "intermediate" ? "warning" : "danger"
                }>
                  {lesson.difficulty}
                </Badge>
                <span className="text-white/40 text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {lesson.estimatedTime} min
                </span>
                <span className="text-yellow-400 text-sm flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {lesson.xpReward} XP
                </span>
              </div>
            </div>
          </div>
        </div>
        <Link
          href="/practice"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium"
        >
          Practice Now
        </Link>
      </div>

      {/* Overall Progress */}
      <div className="flex items-center gap-3">
        <Progress value={progress} variant="gradient" className="flex-1 h-2" />
        <span className="text-white/50 text-sm">{completedSigns.size}/{lesson.signs.length}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sign List */}
        <div className="glass rounded-2xl border border-white/5 p-4">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            Signs in This Lesson
          </h3>
          <div className="space-y-1.5">
            {lesson.signs.map((sign, i) => (
              <button
                key={sign.id}
                onClick={() => setCurrentSignIndex(i)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                  i === currentSignIndex
                    ? "bg-purple-500/20 border border-purple-500/30"
                    : "hover:bg-white/5"
                }`}
              >
                <span className="text-xl">🤟</span>
                <span className={`text-sm font-medium flex-1 ${i === currentSignIndex ? "text-purple-300" : "text-white/70"}`}>
                  {sign.word}
                </span>
                {completedSigns.has(sign.id) && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Sign Display */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSign.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SignCard sign={currentSign} isActive={true} />
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="glass"
              onClick={() => setCurrentSignIndex(Math.max(0, currentSignIndex - 1))}
              disabled={currentSignIndex === 0}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <Button
              variant="gradient"
              onClick={markComplete}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4" />
              {completedSigns.has(currentSign.id) ? "Completed ✓" : "Mark as Learned"}
            </Button>

            <Button
              variant="glass"
              onClick={() => setCurrentSignIndex(Math.min(lesson.signs.length - 1, currentSignIndex + 1))}
              disabled={currentSignIndex === lesson.signs.length - 1}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Completion */}
          {completedSigns.size === lesson.signs.length && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/30 text-center"
            >
              <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-xl mb-2">Lesson Complete! 🎉</h3>
              <p className="text-white/60 mb-4">You've learned all {lesson.signs.length} signs! Take the quiz to earn your XP.</p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/quiz"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-medium"
                >
                  <Star className="w-4 h-4" />
                  Take Quiz (+{lesson.xpReward} XP)
                </Link>
                <Link
                  href="/learn"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/10 text-white font-medium"
                >
                  Next Lesson
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
