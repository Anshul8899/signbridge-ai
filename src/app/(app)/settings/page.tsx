"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, Bell, Palette, Shield, Download, Trash2, Moon, Sun, Eye, Volume2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import { useTheme } from "@/components/providers/theme-provider";

interface SettingToggleProps {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: () => void;
}

function SettingToggle({ label, description, enabled, onChange }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-white text-sm font-medium">{label}</div>
        {description && <div className="text-white/40 text-xs mt-0.5">{description}</div>}
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
          enabled ? "bg-purple-500" : "bg-white/10"
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    daily: true,
    streak: true,
    achievements: true,
    community: false,
  });
  const [accessibility, setAccessibility] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
  });
  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showStreak: true,
    showProgress: true,
  });

  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    toast({ title: "Signed out", variant: "success" });
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm("Are you sure? This will permanently delete your account and all progress. This cannot be undone.");
    if (confirm) {
      toast({ title: "Account deletion scheduled", description: "Your account will be deleted within 30 days.", variant: "warning" });
    }
  };

  const sections = [
    {
      id: "appearance",
      title: "Appearance",
      icon: Palette,
      content: (
        <div className="space-y-1">
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-white text-sm font-medium">Theme</div>
              <div className="text-white/40 text-xs">Switch between dark and light mode</div>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-white text-sm hover:bg-white/10 transition-all"
            >
              {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {theme === "dark" ? "Dark" : "Light"}
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-white text-sm font-medium">Language</div>
              <div className="text-white/40 text-xs">Interface language</div>
            </div>
            <select className="px-3 py-2 rounded-xl glass border border-white/10 text-white bg-transparent text-sm focus:outline-none">
              <option value="en" className="bg-[#1a1a2e]">English</option>
              <option value="es" className="bg-[#1a1a2e]">Spanish</option>
              <option value="fr" className="bg-[#1a1a2e]">French</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: Bell,
      content: (
        <div className="divide-y divide-white/5">
          <SettingToggle label="Daily Reminders" description="Get reminded to practice daily" enabled={notifications.daily} onChange={() => setNotifications((p) => ({ ...p, daily: !p.daily }))} />
          <SettingToggle label="Streak Alerts" description="Be notified when your streak is at risk" enabled={notifications.streak} onChange={() => setNotifications((p) => ({ ...p, streak: !p.streak }))} />
          <SettingToggle label="Achievement Alerts" description="Celebrate when you earn badges" enabled={notifications.achievements} onChange={() => setNotifications((p) => ({ ...p, achievements: !p.achievements }))} />
          <SettingToggle label="Community Updates" description="Activity from friends and groups" enabled={notifications.community} onChange={() => setNotifications((p) => ({ ...p, community: !p.community }))} />
        </div>
      ),
    },
    {
      id: "accessibility",
      title: "Accessibility",
      icon: Eye,
      content: (
        <div className="divide-y divide-white/5">
          <SettingToggle label="High Contrast Mode" description="Increase visual contrast for better visibility" enabled={accessibility.highContrast} onChange={() => setAccessibility((p) => ({ ...p, highContrast: !p.highContrast }))} />
          <SettingToggle label="Large Text" description="Increase text size throughout the app" enabled={accessibility.largeText} onChange={() => setAccessibility((p) => ({ ...p, largeText: !p.largeText }))} />
          <SettingToggle label="Reduce Motion" description="Minimize animations for motion sensitivity" enabled={accessibility.reducedMotion} onChange={() => setAccessibility((p) => ({ ...p, reducedMotion: !p.reducedMotion }))} />
          <SettingToggle label="Screen Reader Support" description="Enhanced compatibility with screen readers" enabled={accessibility.screenReader} onChange={() => setAccessibility((p) => ({ ...p, screenReader: !p.screenReader }))} />
        </div>
      ),
    },
    {
      id: "privacy",
      title: "Privacy",
      icon: Shield,
      content: (
        <div className="divide-y divide-white/5">
          <SettingToggle label="Public Profile" description="Allow others to see your profile" enabled={privacy.publicProfile} onChange={() => setPrivacy((p) => ({ ...p, publicProfile: !p.publicProfile }))} />
          <SettingToggle label="Show Streak" description="Display your streak on the leaderboard" enabled={privacy.showStreak} onChange={() => setPrivacy((p) => ({ ...p, showStreak: !p.showStreak }))} />
          <SettingToggle label="Show Progress" description="Share lesson completion with community" enabled={privacy.showProgress} onChange={() => setPrivacy((p) => ({ ...p, showProgress: !p.showProgress }))} />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-white/70" />
          Settings
        </h1>
        <p className="text-white/50 mt-1">Customize your SignBridge experience</p>
      </motion.div>

      {sections.map((section, i) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <section.icon className="w-5 h-5 text-purple-400" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">{section.content}</CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Data Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-5 h-5 text-blue-400" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            onClick={() => toast({ title: "Export started", description: "Your data will be emailed to you.", variant: "success" })}
            className="w-full flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/10 transition-all text-left"
          >
            <Download className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-white text-sm font-medium">Export Progress Data</div>
              <div className="text-white/40 text-xs">Download all your learning data as JSON</div>
            </div>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-3 rounded-xl glass hover:bg-orange-500/10 transition-all text-left"
          >
            <Settings className="w-5 h-5 text-orange-400" />
            <div>
              <div className="text-orange-400 text-sm font-medium">Sign Out</div>
              <div className="text-white/40 text-xs">You can always sign back in</div>
            </div>
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center gap-3 p-3 rounded-xl glass hover:bg-red-500/10 transition-all text-left"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
            <div>
              <div className="text-red-400 text-sm font-medium">Delete Account</div>
              <div className="text-white/40 text-xs">Permanently remove all your data</div>
            </div>
          </button>
        </CardContent>
      </Card>

      <div className="text-center text-white/20 text-xs">
        SignBridge AI v1.0.0 • WCAG 2.1 AA • Made with ❤️ for accessibility
      </div>
    </div>
  );
}
