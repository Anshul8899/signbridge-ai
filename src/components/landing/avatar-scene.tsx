"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

// Animated SVG hand avatar as a gorgeous 2D fallback
// Architecture is ready for Three.js 3D asset swapout
export function AvatarScene() {
  const [currentSign, setCurrentSign] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const signs = [
    { label: "Hello", emoji: "👋", color: "#a855f7" },
    { label: "Thank You", emoji: "🙏", color: "#3b82f6" },
    { label: "Love", emoji: "❤️", color: "#ec4899" },
    { label: "Yes", emoji: "✊", color: "#10b981" },
    { label: "No", emoji: "✌️", color: "#f59e0b" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSign((prev) => (prev + 1) % signs.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const sign = signs[currentSign];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#0f0c29] to-[#302b63] overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(168,85,247,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.3) 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      />

      {/* Glow circle */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute w-64 h-64 rounded-full"
        style={{ background: `radial-gradient(circle, ${sign.color}40, transparent 70%)` }}
      />

      {/* Hand sign emoji with animation */}
      <motion.div
        key={currentSign}
        initial={{ scale: 0.5, opacity: 0, rotateZ: -10 }}
        animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative z-10 text-[120px] select-none"
        style={{ filter: `drop-shadow(0 0 30px ${sign.color}80)` }}
      >
        {sign.emoji}
      </motion.div>

      {/* Sign label */}
      <motion.div
        key={`label-${currentSign}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mt-4 text-2xl font-bold text-white"
        style={{ textShadow: `0 0 20px ${sign.color}` }}
      >
        {sign.label}
      </motion.div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 flex gap-2">
        {signs.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSign(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentSign ? "bg-white w-6" : "bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Animated hand lines (skeleton overlay effect) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        viewBox="0 0 400 400"
      >
        <motion.line
          x1="200" y1="300" x2="200" y2="100"
          stroke={sign.color}
          strokeWidth="1"
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.circle
          cx="200" cy="200" r="80"
          stroke={sign.color}
          strokeWidth="0.5"
          fill="none"
          animate={{ r: [80, 90, 80] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </svg>

      {/* Top label */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <span className="text-xs text-white/40 font-mono">ASL Avatar v2.0</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
          ● Live
        </span>
      </div>
    </div>
  );
}
