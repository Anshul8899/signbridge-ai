"use client";

/**
 * WebcamGestureOverlay
 * 
 * CRITICAL: The <video> element is ALWAYS present in the DOM whether camera
 * is active or not. This prevents the srcObject assignment race condition
 * where the video ref would be null when startCamera() tried to assign the stream.
 */

import { RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";

interface WebcamGestureOverlayProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  cameraActive: boolean;
  handDetected: boolean;
  accuracy: number;
  isAnalyzing?: boolean;
  countdown?: number | null;
  onStart?: () => void;
}

export function WebcamGestureOverlay({
  videoRef,
  canvasRef,
  cameraActive,
  handDetected,
  accuracy,
  isAnalyzing,
  countdown,
  onStart,
}: WebcamGestureOverlayProps) {
  const accuracyColor =
    accuracy >= 90 ? "text-green-400 border-green-500/60"
    : accuracy >= 70 ? "text-blue-400 border-blue-500/60"
    : accuracy >= 50 ? "text-yellow-400 border-yellow-500/60"
    : "text-red-400 border-red-500/60";

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10">
      {/* ── Video — ALWAYS in DOM so ref is always valid ── */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
          cameraActive ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* ── Canvas overlay — ALWAYS in DOM ── */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full scale-x-[-1] pointer-events-none transition-opacity duration-300 ${
          cameraActive ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* ── Inactive placeholder ── */}
      {!cameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80">
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Camera className="w-10 h-10 text-white/30" />
          </div>
          <div className="text-center px-4">
            <p className="text-white/60 text-sm font-medium">Camera is off</p>
            <p className="text-white/30 text-xs mt-1">Click Start Camera to enable gesture detection</p>
          </div>
          {onStart && (
            <button
              onClick={onStart}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Start Camera
            </button>
          )}
        </div>
      )}

      {/* ── Corner brackets ── */}
      {cameraActive && (["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"] as const).map((pos) => (
        <div
          key={pos}
          className={`absolute ${pos} w-8 h-8 border-2 transition-colors duration-300 ${
            handDetected ? "border-green-400" : "border-white/20"
          }`}
          style={{
            borderRight: pos.includes("left") ? "none" : undefined,
            borderLeft: pos.includes("right") ? "none" : undefined,
            borderBottom: pos.includes("top") ? "none" : undefined,
            borderTop: pos.includes("bottom") ? "none" : undefined,
          }}
        />
      ))}

      {/* ── No-hand hint ── */}
      {cameraActive && !handDetected && !isAnalyzing && (
        <div className="absolute inset-8 border border-dashed border-white/15 rounded-xl flex items-center justify-center pointer-events-none">
          <p className="text-white/25 text-xs">Position your hand here</p>
        </div>
      )}

      {/* ── Accuracy badge ── */}
      {cameraActive && handDetected && accuracy > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl border backdrop-blur-md bg-black/50 font-bold text-sm tabular-nums ${accuracyColor}`}
        >
          {accuracy}%
        </motion.div>
      )}

      {/* ── Hand status pill ── */}
      {cameraActive && (
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md bg-black/50 text-xs font-medium ${
          handDetected ? "text-green-400" : "text-white/40"
        }`}>
          <span className={`w-2 h-2 rounded-full ${handDetected ? "bg-green-400 animate-pulse" : "bg-white/25"}`} />
          {handDetected ? "Hand detected" : "No hand"}
        </div>
      )}

      {/* ── Countdown ── */}
      <AnimatePresence>
        {countdown != null && countdown > 0 && (
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

      {/* ── Analyzing ── */}
      {isAnalyzing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-14 h-14 rounded-full border-4 border-t-purple-400 border-white/20 mb-3"
          />
          <p className="text-white font-semibold text-sm">Analyzing gesture…</p>
        </div>
      )}
    </div>
  );
}
