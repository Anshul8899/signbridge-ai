"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Deaf Education Teacher",
    avatar: "SC",
    text: "SignBridge has transformed how I teach ASL to my students. The AI feedback is incredibly accurate and the animations make complex signs easy to understand.",
    rating: 5,
  },
  {
    name: "Marcus Williams",
    role: "CODA (Child of Deaf Adults)",
    avatar: "MW",
    text: "I used SignBridge to help my hearing colleagues learn to communicate with my deaf family. The progress is remarkable — they can hold basic conversations in weeks!",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Speech Therapist",
    avatar: "PS",
    text: "The real-time webcam practice feature is groundbreaking. My patients use it at home between sessions and their retention has improved dramatically.",
    rating: 5,
  },
  {
    name: "James O'Brien",
    role: "Software Engineer",
    avatar: "JO",
    text: "I learned the ASL alphabet in one week using SignBridge. The gamification keeps me motivated and the AI tutor explains things in a way that actually sticks.",
    rating: 5,
  },
  {
    name: "Aisha Okonkwo",
    role: "HR Professional",
    avatar: "AO",
    text: "Our company uses SignBridge to train employees for more inclusive hiring practices. The structured modules are perfect for workplace onboarding.",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "University Student",
    avatar: "DK",
    text: "Best educational app I've used. The combination of AI, gamification, and actual hand tracking makes learning feel like the future. Already at Level 8!",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-green-500/30 text-sm text-green-300 mb-4">
            💬 Real Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Loved by <span className="gradient-text">Thousands</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl glass border border-white/5 hover:border-white/15 transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-5">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-white/40 text-xs">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
