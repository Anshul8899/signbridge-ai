"use client";

/**
 * WebcamGestureOverlay
 * Renders the video feed + canvas overlay for landmark drawing.
 * Receives refs from useGestureRecognition.
 */

import { RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, AlertCircle } from "lucide-react";

interface WebcamGestureOverlayProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  cameraActive: boolean;
  handDetected: boolean;
  accuracy: number;
  isAnalyzing?: boolean;
  countdown?: number | null;
}

export function WebcamGestureOverlay({
  videoRef,
  canvasRef,
  cameraActive,
  handDetected,
  accuracy,
  isAnalyzing,
  countdown,
}: WebcamGestureOverlayProps) {
  const accuracyColor =
    accuracy >= 90
      ? "text-green-400 border-green-500/60"
      : accuracy >= 70
        ? "text-blue-400 border-blue-500/60"
        : accuracy >= 50
          ? "text-yellow-400 border-yellow-500/60"
          : "text-red-400 border-red-500/60";

  const ringColor =
    accuracy >= 90
      ? "border-green-500"
      : accuracy >= 70
        ? "border-blue-500"
        : accuracy >= 50
          ? "border-yellow-500"
          : "border-red-500";

  if (!cameraActive) {
    return (
      <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex flex-col items-center justify-center gap-4">
        <Camera className="w-16 h-16 text-white/20" />
        <div className="text-center">
          <p className="text-white/50 text-sm">Camera not active</p>
          <p className="text-white/30 text-xs mt-1">Start the camera to begin gesture detection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10">
      {/* Mirrored video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover scale-x-[-1]"
      />

      {/* Landmark overlay — also mirrored to match video */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full scale-x-[-1] pointer-events-none"
        style={{ objectFit: "cover" }}
      />

      {/* Corner brackets */}
      {(["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"] as const).map((pos) => (
        <div
          key={pos}
          className={`absolute ${pos} w-8 h-8 border-2 ${handDetected ? "border-green-400" : "border-white/30"} transition-colors duration-300`}
          style={{
            borderRight: pos.includes("left") ? "none" : undefined,
            borderLeft: pos.includes("right") ? "none" : undefined,
            borderBottom: pos.includes("top") ? "none" : undefined,
            borderTop: pos.includes("bottom") ? "none" : undefined,
          }}
        />
      ))}

      {/* Hand zone hint when no hand detected */}
      {!handDetected && !isAnalyzing && (
        <div className="absolute inset-6 border border-dashed border-white/20 rounded-xl flex items-center justify-center pointer-events-none">
          <p className="text-white/30 text-sm">Position your hand here</p>
        </div>
      )}

      {/* Accuracy badge */}
      {handDetected && accuracy > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl border backdrop-blur-md bg-black/40 font-bold text-sm ${accuracyColor}`}
        >
          {accuracy}%
        </motion.div>
      )}

      {/* Hand detection status */}
      <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md bg-black/40 text-xs font-medium ${handDetected ? "text-green-400" : "text-white/40"}`}>
        <span className={`w-2 h-2 rounded-full ${handDetected ? "bg-green-400 animate-pulse" : "bg-white/30"}`} />
        {handDetected ? "Hand detected" : "No hand"}
      </div>

      {/* Countdown overlay */}
      <AnimatePresence>
        {countdown !== null && countdown !== undefined && countdown > 0 && (
          <motion.div
            key={countdown}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <span className="text-8xl font-black text-white drop-shadow-lg">{countdown}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analyzing spinner */}
      {isAnalyzing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-14 h-14 rounded-full border-4 border-t-purple-400 border-white/20 mb-3"
          />
          <p className="text-white font-semibold">Analyzing gesture…</p>
          <p className="text-white/50 text-xs mt-1">AI is scoring your hand shape</p>
        </div>
      )}
    </div>
  );
}
