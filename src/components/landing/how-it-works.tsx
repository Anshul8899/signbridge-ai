"use client";

import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Sign Up in Seconds",
    description: "Create your free account with Google or GitHub. No credit card required.",
    icon: "🚀",
  },
  {
    step: "02",
    title: "Choose Your Path",
    description: "Start from alphabet basics or jump to a specific category like greetings, medical, or emergency signs.",
    icon: "🗺️",
  },
  {
    step: "03",
    title: "Watch & Practice",
    description: "Watch animated demonstrations, then practice using your webcam with real-time AI feedback.",
    icon: "🎯",
  },
  {
    step: "04",
    title: "Get AI Feedback",
    description: "Our AI tutor analyses your hand shape, movement, and timing — then gives personalized tips.",
    icon: "🤖",
  },
  {
    step: "05",
    title: "Take Quizzes",
    description: "Test your knowledge with AI-generated quizzes — multiple choice, gesture challenges, and timed tests.",
    icon: "📝",
  },
  {
    step: "06",
    title: "Track & Level Up",
    description: "Watch your XP grow, earn badges, maintain your streak, and climb the leaderboard!",
    icon: "📈",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-500/30 text-sm text-blue-300 mb-4">
            🔄 Simple Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How <span className="gradient-text">SignBridge Works</span>
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Start your journey to fluency in 6 simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 rounded-2xl glass border border-white/5 hover:border-white/15 transition-all group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{step.icon}</div>
                <div className="text-3xl font-black text-white/10 group-hover:text-purple-500/30 transition-colors">
                  {step.step}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
              
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 w-6 h-px bg-gradient-to-r from-purple-500 to-blue-500 opacity-30" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
