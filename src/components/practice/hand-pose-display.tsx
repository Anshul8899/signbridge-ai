"use client";

/**
 * HandPoseDisplay
 *
 * Reference display for a verified ASL sign.
 *
 * Reference path (targetSign provided):
 *   Renders DIRECTLY from sign.targetCurls + sign.referenceSpread + sign.wristTilt.
 *   No nearest-neighbour lookup. No approximation. The exact pose from the
 *   sign definition — which is itself sourced from Lifeprint / ASL University.
 *
 * Live-mirror path (liveCurls provided, no targetSign):
 *   Finds the closest library pose by euclidean distance and renders it,
 *   throttled to 200 ms for performance.
 *
 * Both paths use the same RealisticHandSVG renderer.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RealisticHandSVG } from "@/components/practice/realistic-hand-svg";
import { findClosestPose, HAND_POSE_LIBRARY } from "@/lib/gesture/hand-pose-library";
import type { HandPose } from "@/lib/gesture/hand-pose-library";
import type { SignDefinition } from "@/lib/gesture/sign-definitions";

interface HandPoseDisplayProps {
  /** Target sign — renders its verified ASL reference pose directly */
  targetSign?: SignDefinition | null;
  /** Live curls from MediaPipe — shows closest library match (mirror mode) */
  liveCurls?: [number, number, number, number, number] | null;
  /** Live spread from MediaPipe (mirror mode) */
  liveSpread?: [number, number, number, number, number] | null;
  /** Highlight these fingers in red (incorrect finger feedback) */
  errorFingers?: string[];
  width?: number;
  height?: number;
  /** Show the pose source label (debug) */
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

// Default neutral pose for when nothing is provided
const NEUTRAL_POSE: HandPose = HAND_POSE_LIBRARY[0];

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
  // poseKey drives AnimatePresence — increments on any meaningful change
  const [poseKey, setPoseKey] = useState(0);
  const lastSignId  = useRef<string>("");
  const lastPoseId  = useRef<string>("");

  // Live-mirror state (only used when liveCurls is present without a targetSign)
  const [mirrorPose, setMirrorPose] = useState<HandPose>(NEUTRAL_POSE);
  const liveThrottleRef = useRef<NodeJS.Timeout | null>(null);

  // When targetSign changes — bump poseKey to trigger crossfade
  useEffect(() => {
    if (!targetSign) return;
    if (targetSign.id === lastSignId.current) return;
    lastSignId.current = targetSign.id;
    setPoseKey((k) => k + 1);
  }, [targetSign]);

  // Live-mirror: throttled nearest-neighbour lookup (only when no targetSign)
  useEffect(() => {
    if (targetSign || !liveCurls) return;
    if (liveThrottleRef.current) return;

    liveThrottleRef.current = setTimeout(() => {
      liveThrottleRef.current = null;
      const pose = findClosestPose(liveCurls);
      if (pose.id !== lastPoseId.current) {
        lastPoseId.current = pose.id;
        setMirrorPose(pose);
        setPoseKey((k) => k + 1);
      }
    }, 200);
  }, [liveCurls, targetSign]);

  // ── Resolve what to render ─────────────────────────────────────────────────
  //
  // Reference mode (targetSign present):
  //   curls  = sign.targetCurls          (verified ASL handshape)
  //   spread = sign.referenceSpread      (verified ASL spread)
  //   tilt   = sign.wristTilt            (verified ASL wrist angle)
  //
  // Live-mirror mode (liveCurls present, no targetSign):
  //   curls  = liveCurls (direct from MediaPipe)
  //   spread = liveSpread ?? mirrorPose.spread
  //   tilt   = mirrorPose.wristTilt
  //
  // Fallback (nothing provided): neutral open-palm library pose

  let renderCurls:  [number, number, number, number, number];
  let renderSpread: [number, number, number, number, number];
  let renderTilt:   number;
  let labelText:    string;

  if (targetSign) {
    renderCurls  = targetSign.targetCurls;
    renderSpread = targetSign.referenceSpread;
    renderTilt   = targetSign.wristTilt;
    labelText    = targetSign.id;
  } else if (liveCurls) {
    renderCurls  = liveCurls;
    renderSpread = liveSpread ?? mirrorPose.spread;
    renderTilt   = mirrorPose.wristTilt;
    labelText    = mirrorPose.id;
  } else {
    renderCurls  = NEUTRAL_POSE.curls;
    renderSpread = NEUTRAL_POSE.spread;
    renderTilt   = NEUTRAL_POSE.wristTilt;
    labelText    = NEUTRAL_POSE.id;
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl ${className ?? ""}`}
      style={{
        width, height,
        background: "radial-gradient(ellipse at 50% 30%, #2a2535 0%, #181520 55%, #0e0c14 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.4)",
      }}
    >
      {/* Studio key-light rim */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -20, left: -20, width: "55%", height: "55%",
          background: "radial-gradient(ellipse at 30% 30%, rgba(255,220,180,0.07) 0%, transparent 70%)",
        }}
      />
      {/* Floor reflection */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(200,140,90,0.06) 0%, transparent 100%)" }}
      />

      {/* Hand */}
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
            curls={renderCurls}
            spread={renderSpread}
            wristTilt={renderTilt}
            errorFingers={errorFingers}
            width={width}
            height={height}
          />
        </motion.div>
      </AnimatePresence>

      {/* Error finger labels */}
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
        <div className="absolute top-1 left-2 text-[9px] text-white/25 font-mono">
          {labelText}
        </div>
      )}
    </div>
  );
}
