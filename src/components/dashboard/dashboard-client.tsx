"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Zap, BookOpen, Camera, Brain, Trophy, Flame, Star, ArrowRight,
  TrendingUp, Clock, CheckCircle, Play, BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LESSONS, ACHIEVEMENTS } from "@/lib/lessons";
import { getLevelFromXP, getXPProgress, getXPForNextLevel, formatXP } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

interface DashboardClientProps {
  user: User;
  profile: {
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
    xp?: number;
    level?: number;
    coins?: number;
    streak?: number;
  } | null;
  completedLessons: string[];
  earnedAchievements: string[];
}

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Alex K.", avatar: "AK", xp: 12500, streak: 45 },
  { rank: 2, name: "Priya S.", avatar: "PS", xp: 10800, streak: 32 },
  { rank: 3, name: "Marcus W.", avatar: "MW", xp: 9200, streak: 28 },
  { rank: 4, name: "You", avatar: "", xp: 0, streak: 0, isYou: true },
  { rank: 5, name: "Sarah C.", avatar: "SC", xp: 7800, streak: 18 },
];

export function DashboardClient({ user, profile, completedLessons, earnedAchievements }: DashboardClientProps) {
  const xp = profile?.xp ?? 0;
  const level = getLevelFromXP(xp);
  const xpProgress = getXPProgress(xp);
  const nextLevelXP = getXPForNextLevel(level);
  const streak = profile?.streak ?? 0;
  const coins = profile?.coins ?? 0;
  const name = profile?.full_name ?? profile?.username ?? user.email?.split("@")[0] ?? "Learner";
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const totalLessons = LESSONS.length;
  const completedCount = completedLessons.length;
  const overallProgress = (completedCount / totalLessons) * 100;

  const nextLesson = LESSONS.find((l) => !completedLessons.includes(l.id));

  const leaderboard = MOCK_LEADERBOARD.map((entry) =>
    entry.isYou ? { ...entry, xp, streak, name } : entry
  );

  const quickActions = [
    { href: "/learn", icon: BookOpen, label: "Learn Signs", color: "from-blue-600 to-cyan-600", desc: "Continue lessons" },
    { href: "/practice", icon: Camera, label: "Webcam Practice", color: "from-green-600 to-emerald-600", desc: "Real-time feedback" },
    { href: "/ai-tutor", icon: Brain, label: "AI Tutor", color: "from-purple-600 to-violet-600", desc: "Ask anything" },
    { href: "/quiz", icon: Star, label: "Quick Quiz", color: "from-yellow-600 to-orange-600", desc: "Test knowledge" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
            <span className="gradient-text">{name.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-white/50 mt-1">
            {streak > 0
              ? `🔥 You're on a ${streak}-day streak! Keep it up!`
              : "Start learning to build your streak!"}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-white font-bold text-xl">{streak}</div>
              <div className="text-white/40 text-xs">Day Streak</div>
            </div>
          </div>
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <div>
              <div className="text-white font-bold text-xl">{coins}</div>
              <div className="text-white/40 text-xs">Coins</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Level & XP Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {level}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-white font-semibold">Level {level}</span>
                    <Badge variant="purple" className="ml-2">
                      {level < 5 ? "Beginner" : level < 10 ? "Intermediate" : "Advanced"}
                    </Badge>
                  </div>
                  <span className="text-white/60 text-sm">{formatXP(xp)} / {formatXP(nextLevelXP)} XP</span>
                </div>
                <Progress value={xpProgress} variant="gradient" className="h-2" />
                <p className="text-white/40 text-xs mt-1">{Math.round(nextLevelXP - xp)} XP to Level {level + 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Link
                href={action.href}
                className="group flex flex-col items-center justify-center p-6 rounded-2xl glass border border-white/5 hover:border-white/20 transition-all hover:scale-105 text-center"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-white font-medium text-sm">{action.label}</div>
                <div className="text-white/40 text-xs mt-0.5">{action.desc}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-4">
          {nextLesson && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/20">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{nextLesson.thumbnail}</div>
                      <div>
                        <Badge variant="success" className="mb-1">Continue Learning</Badge>
                        <h3 className="text-white font-semibold">{nextLesson.title}</h3>
                        <p className="text-white/50 text-sm">{nextLesson.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-white/40 text-xs">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{nextLesson.estimatedTime} min</span>
                          <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{nextLesson.xpReward} XP</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/learn/${nextLesson.id}`}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <Play className="w-4 h-4" />
                      Continue
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/60 text-sm">{completedCount} of {totalLessons} lessons complete</span>
                <span className="text-white font-semibold">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} variant="gradient" className="h-3 mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Completed", value: completedCount, icon: CheckCircle, color: "text-green-400" },
                  { label: "In Progress", value: Math.max(0, 3 - completedCount), icon: Play, color: "text-blue-400" },
                  { label: "Total XP", value: formatXP(xp), icon: Zap, color: "text-yellow-400" },
                  { label: "Badges", value: earnedAchievements.length, icon: Trophy, color: "text-purple-400" },
                ].map((stat) => (
                  <div key={stat.label} className="glass p-3 rounded-xl text-center">
                    <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
                    <div className="text-white font-bold">{stat.value}</div>
                    <div className="text-white/40 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Lessons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                All Modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {LESSONS.slice(0, 6).map((lesson) => {
                  const completed = completedLessons.includes(lesson.id);
                  return (
                    <Link
                      key={lesson.id}
                      href={`/learn/${lesson.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                    >
                      <span className="text-2xl">{lesson.thumbnail}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium">{lesson.title}</div>
                        <div className="text-white/40 text-xs">{lesson.category} • {lesson.estimatedTime} min</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 text-xs">+{lesson.xpReward} XP</span>
                        {completed ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                        )}
                      </div>
                    </Link>
                  );
                })}
                <Link href="/learn" className="flex items-center justify-center gap-2 text-purple-400 hover:text-purple-300 text-sm py-2 transition-colors">
                  View all modules <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Leaderboard + Achievements */}
        <div className="space-y-4">
          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                      entry.isYou ? "bg-purple-500/20 border border-purple-500/30" : "hover:bg-white/5"
                    }`}
                  >
                    <span className={`w-6 text-center text-sm font-bold ${
                      entry.rank === 1 ? "text-yellow-400" :
                      entry.rank === 2 ? "text-slate-300" :
                      entry.rank === 3 ? "text-orange-400" : "text-white/40"
                    }`}>
                      {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                    </span>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">{entry.avatar || initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${entry.isYou ? "text-purple-300" : "text-white"}`}>
                        {entry.isYou ? `${entry.name} (You)` : entry.name}
                      </div>
                      <div className="text-white/40 text-xs">{formatXP(entry.xp)} XP</div>
                    </div>
                    <span className="text-orange-400 text-xs">🔥{entry.streak}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {ACHIEVEMENTS.slice(0, 9).map((a) => {
                  const earned = earnedAchievements.includes(a.id);
                  return (
                    <div
                      key={a.id}
                      title={a.title}
                      className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                        earned ? "bg-yellow-500/20 border border-yellow-500/30" : "glass opacity-40"
                      }`}
                    >
                      <span className="text-2xl">{a.icon}</span>
                      <span className="text-xs text-white/60 text-center mt-1 truncate w-full text-center">{a.title.split(" ")[0]}</span>
                    </div>
                  );
                })}
              </div>
              <Link href="/achievements" className="flex items-center justify-center gap-2 text-purple-400 hover:text-purple-300 text-xs py-3 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </CardContent>
          </Card>

          {/* Daily Challenge */}
          <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-white font-semibold text-sm">Daily Challenge</span>
                <Badge variant="warning" className="ml-auto">+150 XP</Badge>
              </div>
              <p className="text-white/60 text-sm mb-4">Practice "Emergency Signs" and score 80%+ in the quiz!</p>
              <Link
                href="/quiz"
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Start Challenge <ArrowRight className="w-4 h-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
