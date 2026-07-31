"use client";

/**
 * HandPoseDisplay
 *
 * Shows a realistic human hand SVG that:
 * 1. When given a `targetSign` — renders the reference pose for that sign
 * 2. When given `liveCurls` — finds the closest library pose and crossfades to it
 * 3. Animates smoothly between poses using CSS transitions on opacity
 *
 * No emojis. No cartoon hands. No 3D avatars.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RealisticHandSVG } from "@/components/practice/realistic-hand-svg";
import { findClosestPose, HAND_POSE_LIBRARY } from "@/lib/gesture/hand-pose-library";
import type { HandPose } from "@/lib/gesture/hand-pose-library";
import type { SignDefinition } from "@/lib/gesture/sign-definitions";

interface HandPoseDisplayProps {
  /** Target sign to demonstrate */
  targetSign?: SignDefinition | null;
  /** Live curls from MediaPipe — will find closest library match */
  liveCurls?: [number, number, number, number, number] | null;
  /** Live spread from MediaPipe */
  liveSpread?: [number, number, number, number, number] | null;
  /** Highlight these fingers in red */
  errorFingers?: string[];
  /** Width of the display */
  width?: number;
  height?: number;
  /** Show the pose name label (debug mode) */
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

function signToPose(sign: SignDefinition): HandPose {
  // Map the sign's target curl to the closest library pose
  return findClosestPose(sign.targetCurls);
}

export function HandPoseDisplay({
  targetSign,
  liveCurls,
  liveSpread,
  errorFingers = [],
  width = 240,
  height = 300,
  showLabel = false,
  animated = true,
  className,
}: HandPoseDisplayProps) {
  const [currentPose, setCurrentPose] = useState<HandPose>(() =>
    targetSign ? signToPose(targetSign) : HAND_POSE_LIBRARY[0]
  );
  // poseKey increments on every meaningful pose change to drive AnimatePresence
  const [poseKey, setPoseKey] = useState(0);
  const lastSignId = useRef<string>("");
  const lastPoseId = useRef<string>("");
  const liveThrottleRef = useRef<NodeJS.Timeout | null>(null);

  // When targetSign changes — switch even if the underlying library pose is the
  // same shape (e.g. "hello" and "thank-you" share the same curl vector).
  // Key on targetSign.id, not on the matched pose id.
  useEffect(() => {
    if (!targetSign) return;
    if (targetSign.id === lastSignId.current) return;
    lastSignId.current = targetSign.id;
    const pose = signToPose(targetSign);
    lastPoseId.current = pose.id;
    setCurrentPose(pose);
    setPoseKey((k) => k + 1);
  }, [targetSign]);

  // When liveCurls updates — throttle to every 200ms, find closest pose
  useEffect(() => {
    if (!liveCurls) return;
    if (liveThrottleRef.current) return; // skip if throttled

    liveThrottleRef.current = setTimeout(() => {
      liveThrottleRef.current = null;
      const pose = findClosestPose(liveCurls);
      if (pose.id !== lastPoseId.current) {
        lastPoseId.current = pose.id;
        setCurrentPose(pose);
        setPoseKey((k) => k + 1);
      }
    }, 200);
  }, [liveCurls]);

  // Use live curls directly when available (real-time mirror),
  // otherwise use the matched library pose curls.
  const renderCurls = liveCurls ?? currentPose.curls;
  const renderSpread = liveSpread ?? currentPose.spread;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl ${className ?? ""}`}
      style={{
        width, height,
        // Studio-style background: neutral dark-grey gradient mimicking a sweep backdrop
        background: "radial-gradient(ellipse at 50% 30%, #2a2535 0%, #181520 55%, #0e0c14 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.4)",
      }}
    >
      {/* Studio key-light rim — upper-left warm catch-light */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -20, left: -20, width: "55%", height: "55%",
          background: "radial-gradient(ellipse at 30% 30%, rgba(255,220,180,0.07) 0%, transparent 70%)",
        }}
      />
      {/* Floor reflection — very subtle bottom glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(200,140,90,0.06) 0%, transparent 100%)",
        }}
      />

      {/* Animated SVG hand */}
      <AnimatePresence mode="wait">
        <motion.div
          key={poseKey}
          initial={animated ? { opacity: 0, scale: 0.95, y: 6 } : false}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={animated ? { opacity: 0, scale: 0.95, y: -6 } : undefined}
          transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10"
        >
          <RealisticHandSVG
            curls={renderCurls as [number, number, number, number, number]}
            spread={renderSpread as [number, number, number, number, number]}
            wristTilt={currentPose.wristTilt}
            errorFingers={errorFingers}
            width={width}
            height={height}
          />
        </motion.div>
      </AnimatePresence>

      {/* Error finger overlay labels */}
      {errorFingers.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 flex-wrap px-2"
        >
          {errorFingers.map((f) => (
            <span
              key={f}
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400"
            >
              {f}
            </span>
          ))}
        </motion.div>
      )}

      {/* Debug label */}
      {showLabel && (
        <div className="absolute top-1 left-2 text-[9px] text-white/20 font-mono">
          {currentPose.id}
        </div>
      )}
    </div>
  );
}
