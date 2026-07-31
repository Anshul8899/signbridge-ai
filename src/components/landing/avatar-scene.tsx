"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HandPoseDisplay } from "@/components/practice/hand-pose-display";
import { SIGN_DEFINITIONS } from "@/lib/gesture/sign-definitions";

const DEMO_SIGNS = ["hello", "thank-you", "love", "yes", "no"];
const COLORS = ["#a855f7", "#3b82f6", "#ec4899", "#10b981", "#f59e0b"];

export function AvatarScene() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % DEMO_SIGNS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const sign = SIGN_DEFINITIONS.find((s) => s.id === DEMO_SIGNS[currentIdx]);
  const color = COLORS[currentIdx];

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

      {/* Radial glow behind hand */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute w-72 h-72 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}35, transparent 70%)` }}
      />

      {/* Realistic hand — fades between signs */}
      <AnimatePresence mode="wait">
        {sign && (
          <motion.div
            key={sign.id}
            initial={{ opacity: 0, scale: 0.88, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -12 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="relative z-10"
            style={{ filter: `drop-shadow(0 0 28px ${color}60)` }}
          >
            <HandPoseDisplay
              targetSign={sign}
              width={200}
              height={240}
              animated={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign word label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`label-${currentIdx}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 mt-3 text-xl font-bold text-white"
          style={{ textShadow: `0 0 16px ${color}` }}
        >
          {sign?.word ?? ""}
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div className="absolute bottom-6 flex gap-2">
        {DEMO_SIGNS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIdx(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentIdx ? "w-6 bg-white" : "w-2 bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Top badge */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <span className="text-xs text-white/40 font-mono">ASL Reference</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
          ● Live
        </span>
      </div>
    </div>
  );
}
