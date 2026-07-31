"use client";

/**
 * AccuracyDisplay — shows per-finger breakdown and overall score.
 */

import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";

interface AccuracyDisplayProps {
  accuracy: number;
  fingerAccuracies: number[];
  errorFingers: string[];
  repCount: number;
  bestAccuracy: number;
}

const FINGER_NAMES = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
const FINGER_EMOJIS = ["👍", "☝️", "🖕", "💍", "🤙"];

export function AccuracyDisplay({
  accuracy,
  fingerAccuracies,
  errorFingers,
  repCount,
  bestAccuracy,
}: AccuracyDisplayProps) {
  const errorSet = new Set(errorFingers);
  const rating =
    accuracy >= 90 ? "Excellent" : accuracy >= 75 ? "Good" : accuracy >= 50 ? "Fair" : "Keep Trying";
  const ratingColor =
    accuracy >= 90
      ? "text-green-400"
      : accuracy >= 75
        ? "text-blue-400"
        : accuracy >= 50
          ? "text-yellow-400"
          : "text-red-400";

  return (
    <div className="space-y-4">
      {/* Overall score */}
      <div className="glass rounded-2xl p-4 text-center">
        <motion.div
          key={accuracy}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-5xl font-black mb-1 ${ratingColor}`}
        >
          {accuracy}%
        </motion.div>
        <div className={`text-sm font-semibold ${ratingColor}`}>{rating}</div>
        <Progress
          value={accuracy}
          variant={accuracy >= 90 ? "success" : accuracy >= 70 ? "gradient" : "warning"}
          className="mt-3 h-2"
        />
        <div className="flex justify-between text-xs text-white/40 mt-2">
          <span>Reps: <span className="text-white font-bold">{repCount}</span></span>
          <span>Best: <span className="text-white font-bold">{bestAccuracy}%</span></span>
        </div>
      </div>

      {/* Per-finger breakdown */}
      <div className="glass rounded-2xl p-4">
        <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-3">Finger Accuracy</h4>
        <div className="space-y-2.5">
          {FINGER_NAMES.map((name, i) => {
            const acc = fingerAccuracies[i] ?? 0;
            const hasError = errorSet.has(name);
            return (
              <div key={name} className="flex items-center gap-3">
                <div className="w-5 text-center text-sm">{FINGER_EMOJIS[i]}</div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-white/70 text-xs">{name}</span>
                    <span className={`text-xs font-bold ${hasError ? "text-red-400" : "text-green-400"}`}>
                      {acc}%
                    </span>
                  </div>
                  <Progress
                    value={acc}
                    variant={hasError ? "warning" : acc >= 80 ? "success" : "gradient"}
                    className="h-1.5"
                  />
                </div>
                <div className="w-4">
                  {hasError
                    ? <XCircle className="w-4 h-4 text-red-400" />
                    : <CheckCircle className="w-4 h-4 text-green-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error hints */}
      {errorFingers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-3 border border-red-500/20"
        >
          <p className="text-red-400 text-xs font-semibold mb-1">⚠️ Finger corrections needed:</p>
          <ul className="space-y-0.5">
            {errorFingers.map((f) => (
              <li key={f} className="text-white/60 text-xs flex items-center gap-1.5">
                <span className="text-red-400">•</span>
                Adjust your {f.toLowerCase()} finger position
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
