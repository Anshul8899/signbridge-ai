"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hand, LayoutDashboard, BookOpen, Camera, Brain, BarChart3,
  Trophy, Settings, ChevronLeft, ChevronRight, LogOut, Zap,
  MessageSquare, Mic, Star, Users, Bell
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { getLevelFromXP, getXPProgress } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/learn", icon: BookOpen, label: "Learn" },
  { href: "/practice", icon: Camera, label: "Practice" },
  { href: "/ai-tutor", icon: Brain, label: "AI Tutor" },
  { href: "/text-to-sign", icon: Zap, label: "Text to Sign" },
  { href: "/speech-to-sign", icon: Mic, label: "Speech to Sign" },
  { href: "/quiz", icon: Star, label: "Quiz" },
  { href: "/progress", icon: BarChart3, label: "Progress" },
  { href: "/achievements", icon: Trophy, label: "Achievements" },
  { href: "/community", icon: Users, label: "Community" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
  profile: { username?: string | null; full_name?: string | null; avatar_url?: string | null; xp?: number; level?: number; streak?: number } | null;
}

export function Sidebar({ profile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    // Clear demo cookie if set
    document.cookie = "sb-demo-mode=; path=/; max-age=0";
    await supabase.auth.signOut();
    router.push("/");
  };

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? getLevelFromXP(xp);
  const xpProgress = getXPProgress(xp);
  const initials = (profile?.full_name ?? profile?.username ?? "SB")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative h-screen flex flex-col glass-dark border-r border-white/5 z-30 overflow-hidden"
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 p-5 border-b border-white/5 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 glow-pulse">
          <Hand className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <div className="font-bold text-white text-sm gradient-text">SignBridge AI</div>
            <div className="text-xs text-white/30">Learn & Practice</div>
          </motion.div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group relative ${
                active
                  ? "bg-gradient-to-r from-purple-600/30 to-blue-600/20 text-white border border-purple-500/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-purple-400" : ""}`} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
              {active && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full bg-purple-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-white/5">
        {!collapsed && (
          <div className="p-3 rounded-xl glass mb-3">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-9 h-9">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {profile?.full_name ?? profile?.username ?? "Learner"}
                </div>
                <div className="text-white/40 text-xs">Level {level} • {xp} XP</div>
              </div>
              <div className="flex items-center gap-1 text-orange-400">
                <span className="text-xs">🔥</span>
                <span className="text-xs font-bold">{profile?.streak ?? 0}</span>
              </div>
            </div>
            <Progress value={xpProgress} variant="gradient" className="h-1.5" />
          </div>
        )}

        <div className="flex gap-2">
          {collapsed ? (
            <Avatar className="w-9 h-9 mx-auto cursor-pointer">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          ) : (
            <button
              onClick={handleSignOut}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -right-3 w-6 h-6 rounded-full glass border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}
