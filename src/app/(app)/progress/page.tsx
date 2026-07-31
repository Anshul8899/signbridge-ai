"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Clock, Target, Calendar, Zap,
  BookOpen, CheckCircle, Award, Activity, ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LESSONS } from "@/lib/lessons";
import { getLevelFromXP, getXPProgress, getXPForNextLevel, formatXP } from "@/lib/utils";

const MOCK_ACTIVITY = Array.from({ length: 7 }, (_, i) => ({
  day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
  signs: Math.floor(Math.random() * 20),
  minutes: Math.floor(Math.random() * 45),
  xp: Math.floor(Math.random() * 200),
}));

export default function ProgressPage() {
  const [xp] = useState(1250);
  const level = getLevelFromXP(xp);
  const xpProgress = getXPProgress(xp);
  const nextLevelXP = getXPForNextLevel(level);

  const weeklyXP = MOCK_ACTIVITY.reduce((a, b) => a + b.xp, 0);
  const weeklyMinutes = MOCK_ACTIVITY.reduce((a, b) => a + b.minutes, 0);
  const weeklySignsPracticed = MOCK_ACTIVITY.reduce((a, b) => a + b.signs, 0);

  const statsCards = [
    { label: "Total XP", value: formatXP(xp), icon: Zap, color: "text-yellow-400", bg: "from-yellow-900/30 to-orange-900/30" },
    { label: "Current Level", value: `Lv. ${level}`, icon: TrendingUp, color: "text-purple-400", bg: "from-purple-900/30 to-violet-900/30" },
    { label: "Lessons Done", value: "4/12", icon: BookOpen, color: "text-blue-400", bg: "from-blue-900/30 to-cyan-900/30" },
    { label: "Practice Time", value: `${weeklyMinutes}m`, icon: Clock, color: "text-green-400", bg: "from-green-900/30 to-emerald-900/30" },
  ];

  const maxXP = Math.max(...MOCK_ACTIVITY.map((d) => d.xp));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-400" />
          Learning Progress
        </h1>
        <p className="text-white/50 mt-1">Track your journey to ASL fluency</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`bg-gradient-to-br ${stat.bg} border-white/10`}>
              <CardContent className="p-5">
                <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-white/50 text-sm mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* XP Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Level Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Level {level}</span>
              <span className="text-white/60 text-sm">Level {level + 1}</span>
            </div>
            <Progress value={xpProgress} variant="gradient" className="h-4 mb-3" />
            <div className="flex justify-between text-sm">
              <span className="text-white font-bold">{formatXP(xp)} XP</span>
              <span className="text-white/40">{formatXP(nextLevelXP - xp)} to go</span>
            </div>

            <div className="mt-6 space-y-2">
              {[
                { label: "Beginner", required: 0, reached: true },
                { label: "Intermediate", required: 500, reached: xp >= 500 },
                { label: "Advanced", required: 2000, reached: xp >= 2000 },
                { label: "Expert", required: 5000, reached: xp >= 5000 },
                { label: "Master", required: 10000, reached: xp >= 10000 },
              ].map((tier) => (
                <div key={tier.label} className="flex items-center gap-3">
                  <CheckCircle className={`w-4 h-4 ${tier.reached ? "text-green-400" : "text-white/20"}`} />
                  <span className={`text-sm ${tier.reached ? "text-white" : "text-white/30"}`}>{tier.label}</span>
                  <span className="text-white/30 text-xs ml-auto">{formatXP(tier.required)} XP</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40 mb-3">
              {MOCK_ACTIVITY.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-sm"
                    style={{
                      height: `${(day.xp / maxXP) * 130}px`,
                      transition: "height 0.5s ease",
                    }}
                  />
                  <span className="text-white/40 text-xs">{day.day}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                { label: "XP This Week", value: formatXP(weeklyXP), color: "text-yellow-400" },
                { label: "Signs Practiced", value: weeklySignsPracticed.toString(), color: "text-blue-400" },
                { label: "Minutes Active", value: weeklyMinutes.toString(), color: "text-green-400" },
              ].map((s) => (
                <div key={s.label} className="glass p-3 rounded-xl text-center">
                  <div className={`font-bold text-xl ${s.color}`}>{s.value}</div>
                  <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Module Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Module Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LESSONS.map((lesson, i) => {
                const progress = i < 3 ? 100 : i === 3 ? 60 : i === 4 ? 30 : 0;
                return (
                  <div key={lesson.id} className="flex items-center gap-3 p-3 glass rounded-xl">
                    <span className="text-2xl">{lesson.thumbnail}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm font-medium truncate">{lesson.title}</span>
                        <span className="text-white/50 text-xs ml-2">{progress}%</span>
                      </div>
                      <Progress
                        value={progress}
                        variant={progress === 100 ? "success" : progress > 0 ? "gradient" : "default"}
                        className="h-1.5"
                      />
                    </div>
                    {progress === 100 && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
