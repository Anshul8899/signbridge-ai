"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Search, Clock, Zap, CheckCircle, ArrowRight, Star, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/lessons";
import { useTutorStore } from "@/store/tutor-store";
import type { Lesson } from "@/types";

export function LessonsClient({ lessons }: { lessons: Lesson[] }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const { isLessonUnlocked, lessonAccuracy } = useTutorStore();

  const filtered = lessons.filter((l) => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "all" || 
      l.category.toLowerCase().replace(/ /g, "-") === selectedCategory;
    const matchesDiff = selectedDifficulty === "all" || l.difficulty === selectedDifficulty;
    return matchesSearch && matchesCat && matchesDiff;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-purple-400" />
          Learning Modules
        </h1>
        <p className="text-white/50 mt-1">Master ASL through structured, AI-guided lessons</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search lessons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-4 py-2 rounded-xl glass border border-white/10 text-white bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all" className="bg-[#1a1a2e]">All Levels</option>
          <option value="beginner" className="bg-[#1a1a2e]">Beginner</option>
          <option value="intermediate" className="bg-[#1a1a2e]">Intermediate</option>
          <option value="advanced" className="bg-[#1a1a2e]">Advanced</option>
        </select>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-1.5 rounded-full text-sm transition-all ${
            selectedCategory === "all"
              ? "bg-purple-500 text-white"
              : "glass text-white/60 hover:text-white"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-sm transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? "bg-purple-500 text-white"
                : "glass text-white/60 hover:text-white"
            }`}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((lesson, i) => {
          const unlocked = isLessonUnlocked(lesson.id);
          const bestAcc = lessonAccuracy[lesson.category] ?? 0;
          const completed = bestAcc >= 90;
          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={unlocked ? `/learn/${lesson.id}` : "#"}
                className={`group flex flex-col p-5 rounded-2xl glass border transition-all h-full ${
                  unlocked
                    ? "border-white/5 hover:border-white/20 hover:scale-[1.02]"
                    : "border-white/3 opacity-60 cursor-not-allowed"
                } ${completed ? "border-green-500/20" : ""}`}
              >
                <div className="relative mb-3">
                  <div className="text-5xl">{lesson.thumbnail}</div>
                  {!unlocked && (
                    <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <Lock className="w-3 h-3 text-white/50" />
                    </div>
                  )}
                  {completed && (
                    <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={
                    lesson.difficulty === "beginner" ? "success" :
                    lesson.difficulty === "intermediate" ? "warning" : "danger"
                  }>
                    {lesson.difficulty}
                  </Badge>
                  <Badge variant="outline">{lesson.category}</Badge>
                </div>
                <h3 className="text-white font-semibold mb-1">{lesson.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed flex-1">{lesson.description}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-3 text-white/40 text-xs">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.estimatedTime}m</span>
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{lesson.xpReward} XP</span>
                    {bestAcc > 0 && (
                      <span className={`flex items-center gap-1 font-bold ${bestAcc >= 90 ? "text-green-400" : "text-yellow-400"}`}>
                        {bestAcc}%
                      </span>
                    )}
                  </div>
                  {unlocked
                    ? <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-purple-400 transition-colors" />
                    : <Lock className="w-4 h-4 text-white/20" />
                  }
                </div>
                {!unlocked && (
                  <p className="text-white/30 text-xs mt-2 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Achieve 90% accuracy in practice to unlock
                  </p>
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-white/40">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No lessons found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}
