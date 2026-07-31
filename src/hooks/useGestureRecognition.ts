"use client";

/**
 * useGestureRecognition
 * Manages webcam → MediaPipe Hands → feature extraction → accuracy scoring pipeline.
 * Target latency: <100ms per frame.
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
  accuracy: number; // 0-100
  fingerAccuracies: number[]; // per-finger 0-100
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

// Lazy-load the MediaPipe module to avoid SSR issues
async function loadMediaPipe() {
  const { Hands, HAND_CONNECTIONS } = await import("@mediapipe/hands");
  return { Hands, HAND_CONNECTIONS };
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

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [result, setResult] = useState<GestureResult>({
    accuracy: 0,
    fingerAccuracies: [0, 0, 0, 0, 0],
    errorFingers: [],
    landmarks: null,
    features: null,
    handDetected: false,
    latencyMs: 0,
  });
  const [loading, setLoading] = useState(false);

  const processResults = useCallback(
    (mpResults: any) => {
      if (!mountedRef.current) return;
      const t1 = performance.now();

      const multiLandmarks = mpResults.multiHandLandmarks;
      if (!multiLandmarks || multiLandmarks.length === 0) {
        const r: GestureResult = {
          accuracy: 0,
          fingerAccuracies: [0, 0, 0, 0, 0],
          errorFingers: [],
          landmarks: null,
          features: null,
          handDetected: false,
          latencyMs: performance.now() - t1,
        };
        setResult(r);
        onResult?.(r);
        drawOverlay(null, null);
        return;
      }

      // Use first detected hand
      const rawLandmarks: Landmark[] = multiLandmarks[0].map((lm: any) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
      }));

      const features = extractFeatures(rawLandmarks);

      let accuracy = 0;
      let fingerAccuracies = [0, 0, 0, 0, 0];
      let errorFingers: string[] = [];

      if (targetSign) {
        const result = compareFingers(features.curls, targetSign.targetCurls);
        fingerAccuracies = result.fingerAccuracies.map((a) => Math.round(a * 100));
        errorFingers = result.errorFingers;
        accuracy = Math.round(computeOverallAccuracy(result.fingerAccuracies) * 100);
      }

      const r: GestureResult = {
        accuracy,
        fingerAccuracies,
        errorFingers,
        landmarks: rawLandmarks,
        features,
        handDetected: true,
        latencyMs: performance.now() - t1,
      };

      setResult(r);
      onResult?.(r);
      drawOverlay(rawLandmarks, errorFingers);
    },
    [targetSign, onResult]
  );

  const drawOverlay = useCallback(
    (landmarks: Landmark[] | null, errorFingers: string[] | null) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!landmarks) return;

      const errorNames = new Set(errorFingers ?? []);
      const FINGER_NAMES = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
      const FINGER_GROUPS = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
        [17, 18, 19, 20],
      ];
      const CONNECTIONS = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
        [5, 9], [9, 13], [13, 17],
      ];

      const toCanvas = (lm: Landmark) => ({
        x: lm.x * canvas.width,
        y: lm.y * canvas.height,
      });

      // Draw connections
      for (const [a, b] of CONNECTIONS) {
        const fingerIdx = FINGER_GROUPS.findIndex((g) => g.includes(a) || g.includes(b));
        const hasError = fingerIdx >= 0 && errorNames.has(FINGER_NAMES[fingerIdx]);

        ctx.beginPath();
        ctx.moveTo(toCanvas(landmarks[a]).x, toCanvas(landmarks[a]).y);
        ctx.lineTo(toCanvas(landmarks[b]).x, toCanvas(landmarks[b]).y);
        ctx.strokeStyle = hasError ? "rgba(239,68,68,0.8)" : "rgba(34,197,94,0.8)";
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Draw landmark points
      for (let i = 0; i < landmarks.length; i++) {
        const fingerIdx = FINGER_GROUPS.findIndex((g) => g.includes(i));
        const hasError = fingerIdx >= 0 && errorNames.has(FINGER_NAMES[fingerIdx]);
        const { x, y } = toCanvas(landmarks[i]);

        ctx.beginPath();
        ctx.arc(x, y, i === 0 ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = i === 0
          ? "rgba(168,85,247,0.9)"
          : hasError
            ? "rgba(239,68,68,0.9)"
            : "rgba(34,197,94,0.9)";
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    },
    []
  );

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve();
          }
        });
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (e: any) {
      setCameraError(e?.message ?? "Camera access denied");
    } finally {
      setLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Initialize MediaPipe Hands
  useEffect(() => {
    let hands: any = null;

    const init = async () => {
      if (!enabled) return;
      const { Hands } = await loadMediaPipe();

      hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.6,
      });

      hands.onResults(processResults);
      handsRef.current = hands;
    };

    init();

    return () => {
      hands?.close?.();
      handsRef.current = null;
    };
  }, [enabled, processResults]);

  // Detection loop
  useEffect(() => {
    if (!cameraActive || !enabled) return;

    let running = true;

    const detect = async () => {
      if (!running || !handsRef.current || !videoRef.current) return;
      const video = videoRef.current;
      if (video.readyState >= 2) {
        const now = performance.now();
        // Throttle to ~30fps for latency budget
        if (now - lastFrameTime.current > 33) {
          lastFrameTime.current = now;
          await handsRef.current.send({ image: video });
        }
      }
      animFrameRef.current = requestAnimationFrame(detect);
    };

    animFrameRef.current = requestAnimationFrame(detect);

    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [cameraActive, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    cameraActive,
    cameraError,
    loading,
    result,
    startCamera,
    stopCamera,
  };
}
