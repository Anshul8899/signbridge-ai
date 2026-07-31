"use client";

/**
 * GamificationBar — XP, streak, daily goal, badges
 * Shown at top of practice/quiz pages.
 */

import { motion } from "framer-motion";
import { Zap, Flame, Target, Trophy } from "lucide-react";
import { useTutorStore } from "@/store/tutor-store";
import { Progress } from "@/components/ui/progress";
import { ACHIEVEMENTS } from "@/lib/lessons";

export function GamificationBar() {
  const { xp, level, streak, dailyGoal, unlockedBadges } = useTutorStore();

  const xpForThisLevel = (level - 1) * (level - 1) * 100;
  const xpForNextLevel = level * level * 100;
  const xpProgress = ((xp - xpForThisLevel) / (xpForNextLevel - xpForThisLevel)) * 100;

  const goalProgress = dailyGoal.target > 0
    ? Math.min((dailyGoal.current / dailyGoal.target) * 100, 100)
    : 0;

  const recentBadge = unlockedBadges.length > 0
    ? ACHIEVEMENTS.find((a) => a.id === unlockedBadges[unlockedBadges.length - 1])
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 flex-wrap"
    >
      {/* Level + XP */}
      <div className="glass px-3 py-2 rounded-xl flex items-center gap-2 min-w-[110px]">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
          {level}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white/40 text-[10px]">Level {level}</div>
          <Progress value={xpProgress} variant="gradient" className="h-1 mt-0.5" />
          <div className="text-white/60 text-[10px] mt-0.5">{xp} XP</div>
        </div>
      </div>

      {/* Streak */}
      <div className="glass px-3 py-2 rounded-xl flex items-center gap-2">
        <Flame className={`w-4 h-4 ${streak > 0 ? "text-orange-400" : "text-white/30"}`} />
        <div>
          <div className="text-white font-bold text-sm leading-none">{streak}</div>
          <div className="text-white/40 text-[10px]">day streak</div>
        </div>
      </div>

      {/* Daily Goal */}
      <div className="glass px-3 py-2 rounded-xl flex items-center gap-2 min-w-[110px]">
        <Target className="w-4 h-4 text-green-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-[10px]">
            <span className="text-white/40">Daily goal</span>
            <span className="text-white/70">{dailyGoal.current}/{dailyGoal.target}</span>
          </div>
          <Progress value={goalProgress} variant={goalProgress >= 100 ? "success" : "gradient"} className="h-1 mt-1" />
        </div>
      </div>

      {/* Latest badge */}
      {recentBadge && (
        <div className="glass px-3 py-2 rounded-xl flex items-center gap-2">
          <span className="text-base">{recentBadge.icon}</span>
          <div>
            <div className="text-white text-xs font-medium leading-none">{recentBadge.title}</div>
            <div className="text-white/40 text-[10px]">Latest badge</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
