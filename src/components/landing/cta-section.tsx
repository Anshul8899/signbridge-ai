"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 aurora-bg opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f]" />
      
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 border border-white/10"
          style={{ boxShadow: "0 0 80px rgba(168,85,247,0.2)" }}
        >
          <div className="text-6xl mb-6">🤟</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Bridge the{" "}
            <span className="gradient-text">Communication Gap?</span>
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
            Join 50,000+ learners who are breaking barriers and building connections 
            through the power of AI-assisted sign language education.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-xl hover:opacity-90 transition-all active:scale-95 glow-pulse"
          >
            Start Learning Free Today
            <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="text-white/30 text-sm mt-4">No credit card required • Free forever plan</p>
        </motion.div>
      </div>
    </section>
  );
}
