"use client";

import { motion } from "framer-motion";
import { Users, Trophy, Share2, MessageSquare, UserPlus, Globe, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const COMMUNITY_POSTS = [
  { user: "Alex K.", avatar: "AK", xp: 12500, level: 18, message: "Just completed all 12 modules! 🎉 What a journey. The Emergency Signs module was most challenging!", likes: 45, time: "2h ago", badge: "🏆" },
  { user: "Priya S.", avatar: "PS", xp: 10800, level: 16, message: "Hit 30-day streak! The AI tutor is incredible for getting personalized practice tips 🔥", likes: 38, time: "4h ago", badge: "⚡" },
  { user: "Marcus W.", avatar: "MW", xp: 9200, level: 14, message: "Pro tip: Use speech-to-sign while watching TV shows to see how natural conversation translates!", likes: 29, time: "6h ago", badge: "💡" },
  { user: "Sarah C.", avatar: "SC", xp: 7800, level: 12, message: "Got 95% accuracy in webcam practice for 'Hello' 👋 Finally feels natural!", likes: 22, time: "8h ago", badge: "🎯" },
];

const PRACTICE_GROUPS = [
  { name: "Daily Sign Challenge", members: 234, level: "All levels", emoji: "🔥" },
  { name: "ASL Beginners", members: 892, level: "Beginner", emoji: "🌱" },
  { name: "Emergency Signs Study", members: 156, level: "All levels", emoji: "🚨" },
  { name: "Professional ASL", members: 89, level: "Advanced", emoji: "💼" },
];

export default function CommunityPage() {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-indigo-400" />
          Community
        </h1>
        <p className="text-white/50 mt-1">Connect, share, and grow with fellow learners</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Community Feed
          </h2>
          {COMMUNITY_POSTS.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="hover:border-white/20 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{post.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-1 -right-1 text-sm">{post.badge}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold text-sm">{post.user}</span>
                        <Badge variant="purple">Lv.{post.level}</Badge>
                        <span className="text-white/30 text-xs ml-auto">{post.time}</span>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">{post.message}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button className="flex items-center gap-1.5 text-white/40 hover:text-red-400 text-xs transition-colors">
                          ❤️ {post.likes}
                        </button>
                        <button className="flex items-center gap-1.5 text-white/40 hover:text-blue-400 text-xs transition-colors">
                          <MessageSquare className="w-3 h-3" />
                          Reply
                        </button>
                        <button className="flex items-center gap-1.5 text-white/40 hover:text-purple-400 text-xs transition-colors">
                          <Share2 className="w-3 h-3" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Practice Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4 text-purple-400" />
                Practice Groups
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {PRACTICE_GROUPS.map((group) => (
                <div key={group.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all">
                  <span className="text-2xl">{group.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{group.name}</div>
                    <div className="text-white/40 text-xs">{group.members} members • {group.level}</div>
                  </div>
                  <button className="text-purple-400 hover:text-purple-300 transition-colors">
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Leaderboard Teaser */}
          <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="w-4 h-4 text-yellow-400" />
                Top This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: "Alex K.", xp: 1250, avatar: "AK", medal: "🥇" },
                { name: "Priya S.", xp: 1100, avatar: "PS", medal: "🥈" },
                { name: "Marcus W.", xp: 980, avatar: "MW", medal: "🥉" },
              ].map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span>{entry.medal}</span>
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-xs">{entry.avatar}</AvatarFallback>
                  </Avatar>
                  <span className="text-white text-xs flex-1">{entry.name}</span>
                  <span className="text-yellow-400 text-xs font-bold">+{entry.xp} XP</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Share Achievement */}
          <Card>
            <CardContent className="p-4 text-center">
              <Share2 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold text-sm mb-1">Share Your Progress</h3>
              <p className="text-white/50 text-xs mb-3">Inspire others with your learning journey!</p>
              <Button variant="gradient" size="sm" className="w-full">
                Share Achievement
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
