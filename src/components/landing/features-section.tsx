"use client";

import { motion } from "framer-motion";
import { Brain, Camera, Zap, BookOpen, Trophy, Users, Mic, BarChart3, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Tutor",
    description: "Get personalized feedback and explanations from our OpenAI-powered sign language tutor available 24/7.",
    color: "from-purple-500 to-violet-500",
    glow: "rgba(168,85,247,0.3)",
  },
  {
    icon: Camera,
    title: "Real-Time Webcam Practice",
    description: "Practice signs using your webcam. MediaPipe tracks every finger movement and gives instant accuracy scores.",
    color: "from-blue-500 to-cyan-500",
    glow: "rgba(59,130,246,0.3)",
  },
  {
    icon: Zap,
    title: "Instant Gesture Recognition",
    description: "AI identifies your signs in real time with confidence percentages and guided correction tips.",
    color: "from-yellow-500 to-orange-500",
    glow: "rgba(234,179,8,0.3)",
  },
  {
    icon: BookOpen,
    title: "12+ Structured Modules",
    description: "From alphabet to emergency signs — learn with animations, examples, and quizzes in each module.",
    color: "from-green-500 to-emerald-500",
    glow: "rgba(16,185,129,0.3)",
  },
  {
    icon: Trophy,
    title: "Gamified Learning",
    description: "Earn XP, badges, streaks, and coins. Compete on leaderboards and unlock certificates.",
    color: "from-pink-500 to-rose-500",
    glow: "rgba(236,72,153,0.3)",
  },
  {
    icon: Users,
    title: "Community Practice",
    description: "Join practice groups, share achievements, challenge friends, and grow together.",
    color: "from-indigo-500 to-purple-500",
    glow: "rgba(99,102,241,0.3)",
  },
  {
    icon: Mic,
    title: "Speech to Sign",
    description: "Speak naturally and watch your words transform into animated sign language sequences instantly.",
    color: "from-teal-500 to-cyan-500",
    glow: "rgba(20,184,166,0.3)",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Detailed insights on your learning journey — accuracy trends, time spent, and personalized recommendations.",
    color: "from-orange-500 to-red-500",
    glow: "rgba(249,115,22,0.3)",
  },
  {
    icon: Shield,
    title: "Accessibility First",
    description: "WCAG 2.1 compliant with high contrast, keyboard navigation, screen reader support, and captions.",
    color: "from-slate-400 to-slate-600",
    glow: "rgba(148,163,184,0.3)",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30 text-sm text-purple-300 mb-4">
            ✨ Everything You Need
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Powered by{" "}
            <span className="gradient-text">Cutting-Edge AI</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            SignBridge combines the latest in AI, computer vision, and educational psychology 
            to deliver the most effective sign language learning experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative p-6 rounded-2xl glass border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer"
              style={{ boxShadow: `0 0 0 transparent` }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${feature.glow}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 transparent";
              }}
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
