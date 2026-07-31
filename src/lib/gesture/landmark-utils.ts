/**
 * Utilities for MediaPipe hand landmark processing.
 * Landmark indices follow the MediaPipe Hands convention:
 * 0=wrist, 1-4=thumb, 5-8=index, 9-12=middle, 13-16=ring, 17-20=pinky
 */

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface FingerAngles {
  thumb: number;
  index: number;
  middle: number;
  ring: number;
  pinky: number;
}

export interface NormalizedHandFeatures {
  /** Whether each finger is extended (true) or curled (false) */
  extended: [boolean, boolean, boolean, boolean, boolean]; // thumb, index, middle, ring, pinky
  /** Curl amount 0-1 for each finger */
  curls: [number, number, number, number, number];
  /** Tip positions normalised relative to wrist — one [x,y,z] per finger */
  tipVectors: [number, number, number][];
}

const FINGER_TIPS = [4, 8, 12, 16, 20];
const FINGER_PIPS = [3, 7, 11, 15, 19];
const FINGER_MCPS = [2, 5, 9, 13, 17];

function dist3d(a: Landmark, b: Landmark): number {
  return Math.sqrt(
    (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2
  );
}

function dot(a: number[], b: number[]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function norm(v: number[]): number {
  return Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
}

function angle(a: Landmark, b: Landmark, c: Landmark): number {
  const ab = [b.x - a.x, b.y - a.y, b.z - a.z];
  const cb = [b.x - c.x, b.y - c.y, b.z - c.z];
  const cosAngle = dot(ab, cb) / (norm(ab) * norm(cb) + 1e-8);
  return Math.acos(Math.max(-1, Math.min(1, cosAngle)));
}

/** Normalize landmarks so palm size = 1, wrist = origin */
export function normalizeLandmarks(landmarks: Landmark[]): Landmark[] {
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  const scale = dist3d(wrist, middleMcp) || 1;
  return landmarks.map((lm) => ({
    x: (lm.x - wrist.x) / scale,
    y: (lm.y - wrist.y) / scale,
    z: (lm.z - wrist.z) / scale,
  }));
}

/** Returns curl (0=fully extended, 1=fully curled) for a finger */
export function computeFingerCurl(
  landmarks: Landmark[],
  tipIdx: number,
  pipIdx: number,
  mcpIdx: number
): number {
  const wrist = landmarks[0];
  const mcp = landmarks[mcpIdx];
  const pip = landmarks[pipIdx];
  const tip = landmarks[tipIdx];
  const a = angle(wrist, mcp, pip);
  const b = angle(mcp, pip, tip);
  // Straight finger → large angles; curled → small angles
  const avgAngle = (a + b) / 2;
  return 1 - Math.min(1, avgAngle / Math.PI);
}

/** Check if thumb is extended using a different heuristic (abduction from palm) */
function isThumbExtended(landmarks: Landmark[]): boolean {
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexMcp = landmarks[5];
  const thumbMcp = landmarks[2];
  // Distance from thumb tip to index MCP vs thumb MCP to index MCP
  const tipToIndex = dist3d(thumbTip, indexMcp);
  const mcpToIndex = dist3d(thumbMcp, indexMcp);
  return tipToIndex > mcpToIndex * 0.9;
}

/** Extract normalised features from raw MediaPipe landmarks */
export function extractFeatures(landmarks: Landmark[]): NormalizedHandFeatures {
  const curls: [number, number, number, number, number] = [
    computeFingerCurl(landmarks, 4, 3, 2),   // thumb
    computeFingerCurl(landmarks, 8, 7, 6),   // index
    computeFingerCurl(landmarks, 12, 11, 10), // middle
    computeFingerCurl(landmarks, 16, 15, 14), // ring
    computeFingerCurl(landmarks, 20, 19, 18), // pinky
  ];

  const extended: [boolean, boolean, boolean, boolean, boolean] = [
    isThumbExtended(landmarks),
    curls[1] < 0.4,
    curls[2] < 0.4,
    curls[3] < 0.4,
    curls[4] < 0.4,
  ];

  const wrist = landmarks[0];
  const tipVectors = FINGER_TIPS.map((tipIdx) => {
    const tip = landmarks[tipIdx];
    return [tip.x - wrist.x, tip.y - wrist.y, tip.z - wrist.z] as [number, number, number];
  });

  return { extended, curls, tipVectors };
}

/** Per-finger accuracy: compare user's curls with target curls */
export function compareFingers(
  userCurls: [number, number, number, number, number],
  targetCurls: [number, number, number, number, number]
): { fingerAccuracies: number[]; errorFingers: string[] } {
  const names = ["Thumb", "Index", "Middle", "Ring", "Pinky"];
  const fingerAccuracies: number[] = [];
  const errorFingers: string[] = [];

  for (let i = 0; i < 5; i++) {
    const diff = Math.abs(userCurls[i] - targetCurls[i]);
    const acc = Math.max(0, 1 - diff * 2); // diff of 0.5 → 0% accuracy
    fingerAccuracies.push(acc);
    if (acc < 0.6) errorFingers.push(names[i]);
  }

  return { fingerAccuracies, errorFingers };
}

/** Weighted accuracy: extended fingers matter more */
export function computeOverallAccuracy(fingerAccuracies: number[]): number {
  // Thumb slightly lower weight as it varies most across people
  const weights = [0.15, 0.25, 0.25, 0.2, 0.15];
  return fingerAccuracies.reduce((sum, acc, i) => sum + acc * weights[i], 0);
}

/**
 * Flatten landmarks to a Float32Array feature vector for TF.js inference.
 * Format: [x0,y0,z0, x1,y1,z1, ... x20,y20,z20] — 63 values, normalised.
 */
export function landmarksToTensor(landmarks: Landmark[]): Float32Array {
  const norm = normalizeLandmarks(landmarks);
  const flat = new Float32Array(63);
  for (let i = 0; i < 21; i++) {
    flat[i * 3] = norm[i].x;
    flat[i * 3 + 1] = norm[i].y;
    flat[i * 3 + 2] = norm[i].z;
  }
  return flat;
}
