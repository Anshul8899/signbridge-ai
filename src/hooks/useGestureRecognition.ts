"use client";

/**
 * useGestureRecognition
 * Webcam → MediaPipe Hands → feature extraction → accuracy scoring.
 *
 * Key fix: video element is ALWAYS mounted in the DOM.
 * srcObject is assigned immediately when startCamera resolves, without
 * waiting for onloadedmetadata which can race on some browsers.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { Landmark, NormalizedHandFeatures } from "@/lib/gesture/landmark-utils";
import {
  extractFeatures,
  compareFingers,
  computeOverallAccuracy,
} from "@/lib/gesture/landmark-utils";
import type { SignDefinition } from "@/lib/gesture/sign-definitions";

export interface GestureResult {
  accuracy: number;
  fingerAccuracies: number[];
  errorFingers: string[];
  landmarks: Landmark[] | null;
  features: NormalizedHandFeatures | null;
  handDetected: boolean;
  latencyMs: number;
}

export interface UseGestureRecognitionOptions {
  targetSign: SignDefinition | null;
  enabled: boolean;
  onResult?: (result: GestureResult) => void;
}

async function loadMediaPipe() {
  const { Hands } = await import("@mediapipe/hands");
  return { Hands };
}

export function useGestureRecognition({
  targetSign,
  enabled,
  onResult,
}: UseGestureRecognitionOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);
  const mountedRef = useRef(true);
  const detectionRunning = useRef(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GestureResult>({
    accuracy: 0,
    fingerAccuracies: [0, 0, 0, 0, 0],
    errorFingers: [],
    landmarks: null,
    features: null,
    handDetected: false,
    latencyMs: 0,
  });

  // ── Canvas overlay drawing ────────────────────────────────────────────
  const drawOverlay = useCallback(
    (landmarks: Landmark[] | null, errorFingers: string[] | null) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = video.videoWidth || 640;
      const h = video.videoHeight || 480;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      if (!landmarks) return;

      const errorNames = new Set(errorFingers ?? []);
      const FINGER_NAMES = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
      const FINGER_GROUPS = [
        [1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12],
        [13, 14, 15, 16], [17, 18, 19, 20],
      ];
      const CONNECTIONS = [
        [0,1],[1,2],[2,3],[3,4], [0,5],[5,6],[6,7],[7,8],
        [0,9],[9,10],[10,11],[11,12], [0,13],[13,14],[14,15],[15,16],
        [0,17],[17,18],[18,19],[19,20], [5,9],[9,13],[13,17],
      ];

      const px = (lm: Landmark) => ({ x: lm.x * w, y: lm.y * h });

      for (const [a, b] of CONNECTIONS) {
        const fi = FINGER_GROUPS.findIndex((g) => g.includes(a) || g.includes(b));
        const err = fi >= 0 && errorNames.has(FINGER_NAMES[fi]);
        ctx.beginPath();
        ctx.moveTo(px(landmarks[a]).x, px(landmarks[a]).y);
        ctx.lineTo(px(landmarks[b]).x, px(landmarks[b]).y);
        ctx.strokeStyle = err ? "rgba(239,68,68,0.85)" : "rgba(34,197,94,0.85)";
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      for (let i = 0; i < landmarks.length; i++) {
        const fi = FINGER_GROUPS.findIndex((g) => g.includes(i));
        const err = fi >= 0 && errorNames.has(FINGER_NAMES[fi]);
        const { x, y } = px(landmarks[i]);
        ctx.beginPath();
        ctx.arc(x, y, i === 0 ? 7 : 5, 0, Math.PI * 2);
        ctx.fillStyle = i === 0
          ? "rgba(168,85,247,0.95)"
          : err ? "rgba(239,68,68,0.95)" : "rgba(34,197,94,0.95)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    },
    []
  );

  // ── MediaPipe result handler ──────────────────────────────────────────
  const processResults = useCallback(
    (mpResults: any) => {
      if (!mountedRef.current) return;
      const t1 = performance.now();
      const multi = mpResults.multiHandLandmarks;

      if (!multi || multi.length === 0) {
        const r: GestureResult = {
          accuracy: 0, fingerAccuracies: [0,0,0,0,0],
          errorFingers: [], landmarks: null, features: null,
          handDetected: false, latencyMs: performance.now() - t1,
        };
        setResult(r); onResult?.(r); drawOverlay(null, null);
        return;
      }

      const rawLandmarks: Landmark[] = multi[0].map((lm: any) => ({
        x: lm.x, y: lm.y, z: lm.z,
      }));
      const features = extractFeatures(rawLandmarks);

      let accuracy = 0;
      let fingerAccuracies = [0, 0, 0, 0, 0];
      let errorFingers: string[] = [];

      if (targetSign) {
        const cmp = compareFingers(features.curls, targetSign.targetCurls);
        fingerAccuracies = cmp.fingerAccuracies.map((a) => Math.round(a * 100));
        errorFingers = cmp.errorFingers;
        accuracy = Math.round(computeOverallAccuracy(cmp.fingerAccuracies) * 100);
      }

      const r: GestureResult = {
        accuracy, fingerAccuracies, errorFingers,
        landmarks: rawLandmarks, features,
        handDetected: true, latencyMs: performance.now() - t1,
      };
      setResult(r); onResult?.(r); drawOverlay(rawLandmarks, errorFingers);
    },
    [targetSign, onResult, drawOverlay]
  );

  // ── Initialize MediaPipe ──────────────────────────────────────────────
  useEffect(() => {
    let hands: any = null;
    let cancelled = false;

    const init = async () => {
      if (!enabled) return;
      try {
        const { Hands } = await loadMediaPipe();
        if (cancelled) return;
        hands = new Hands({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
        });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.55,
        });
        hands.onResults(processResults);
        handsRef.current = hands;
      } catch (e) {
        console.error("MediaPipe init failed", e);
      }
    };

    init();
    return () => {
      cancelled = true;
      hands?.close?.();
      handsRef.current = null;
    };
  }, [enabled, processResults]);

  // ── Detection loop ────────────────────────────────────────────────────
  useEffect(() => {
    if (!cameraActive || !enabled) return;
    detectionRunning.current = true;

    const detect = async () => {
      if (!detectionRunning.current) return;
      const video = videoRef.current;
      if (handsRef.current && video && video.readyState >= 2 && !video.paused) {
        const now = performance.now();
        if (now - lastFrameTime.current >= 33) {
          lastFrameTime.current = now;
          try {
            await handsRef.current.send({ image: video });
          } catch {
            // frame dropped — continue
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(detect);
    };

    animFrameRef.current = requestAnimationFrame(detect);
    return () => {
      detectionRunning.current = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [cameraActive, enabled]);

  // ── Camera start ─────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    if (streamRef.current) return; // already active
    setCameraError(null);
    setLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) throw new Error("Video element not ready");

      video.srcObject = stream;
      // Don't await loadedmetadata — just play; browser handles readyState
      video.play().catch(() => {});
      setCameraActive(true);
    } catch (e: any) {
      const msg = e?.name === "NotAllowedError"
        ? "Camera permission denied. Please allow camera access in your browser."
        : e?.name === "NotFoundError"
          ? "No camera found on this device."
          : e?.message ?? "Failed to access camera.";
      setCameraError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Camera stop ──────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    detectionRunning.current = false;
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) { video.srcObject = null; video.load(); }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setCameraActive(false);
    setResult({
      accuracy: 0, fingerAccuracies: [0,0,0,0,0],
      errorFingers: [], landmarks: null, features: null,
      handDetected: false, latencyMs: 0,
    });
  }, []);

  // ── Cleanup on unmount ───────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef, canvasRef,
    cameraActive, cameraError, loading,
    result, startCamera, stopCamera,
  };
}
