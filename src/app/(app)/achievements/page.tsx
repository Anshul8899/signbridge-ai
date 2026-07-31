"use client";

import { motion } from "framer-motion";
import { Trophy, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ACHIEVEMENTS } from "@/lib/lessons";
import { useTutorStore } from "@/store/tutor-store";
import { GamificationBar } from "@/components/practice/gamification-bar";

export default function AchievementsPage() {
  const { unlockedBadges } = useTutorStore();
  const earned = ACHIEVEMENTS.filter((a) => unlockedBadges.includes(a.id));
  const locked = ACHIEVEMENTS.filter((a) => !unlockedBadges.includes(a.id));
  const percentage = Math.round((earned.length / ACHIEVEMENTS.length) * 100);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Achievements
          </h1>
          <p className="text-white/50 mt-1">
            {earned.length} of {ACHIEVEMENTS.length} achievements unlocked
          </p>
        </div>
        <GamificationBar />
      </motion.div>

      {/* Progress Summary */}
      <div className="glass p-5 rounded-2xl border border-yellow-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-2xl">{earned.length}/{ACHIEVEMENTS.length}</div>
            <div className="text-white/50 text-sm mb-2">Achievements Earned</div>
            <Progress value={percentage} variant="warning" className="h-2" />
            <div className="flex gap-2 mt-2">
              <Badge variant="success">{earned.length} Unlocked</Badge>
              <Badge variant="outline">{locked.length} Remaining</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div>
          <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            ✅ Earned ({earned.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {earned.map((achievement, i) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500/30 hover:border-yellow-500/60 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{achievement.title}</h3>
                        <p className="text-white/60 text-xs mt-1">{achievement.description}</p>
                        <Badge variant="warning" className="mt-2">+{achievement.xpReward} XP</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {earned.length === 0 && (
        <div className="text-center py-10 glass rounded-2xl border border-white/5">
          <div className="text-5xl mb-3">🎯</div>
          <h3 className="text-white font-semibold mb-1">No badges yet</h3>
          <p className="text-white/40 text-sm">
            Start practicing signs and completing lessons to earn your first badge!
          </p>
        </div>
      )}

      {/* Locked */}
      <div>
        <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          🔒 Locked ({locked.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locked.map((achievement, i) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="border-white/5 opacity-60 hover:opacity-80 transition-opacity">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl grayscale">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white/70 font-semibold">{achievement.title}</h3>
                        <Lock className="w-3 h-3 text-white/30" />
                      </div>
                      <p className="text-white/40 text-xs mt-1">{achievement.description}</p>
                      <Badge variant="outline" className="mt-2">+{achievement.xpReward} XP</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
