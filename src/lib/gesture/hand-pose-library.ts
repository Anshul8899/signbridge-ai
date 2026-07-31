/**
 * Hand Pose Library
 * 
 * Each pose defines the exact finger curl (0=fully extended, 1=fully curled)
 * and spread (0=together, 1=max spread) for all 5 fingers, plus wrist rotation.
 * 
 * These are NEUTRAL reference poses — no ASL meaning.
 * The app maps recognized gestures to the closest matching pose via euclidean
 * distance on the curl vector.
 * 
 * Naming: hand_pose_001 … hand_pose_NNN
 */

export interface HandPose {
  id: string;          // e.g. "hand_pose_001"
  name: string;        // human-readable label (internal only, never shown in UI)
  /** Curl per finger [thumb, index, middle, ring, pinky] 0=extended 1=curled */
  curls: [number, number, number, number, number];
  /** Spread per finger [thumb, index, middle, ring, pinky] 0=together 1=spread */
  spread: [number, number, number, number, number];
  /** Wrist tilt in degrees (-30 to +30) */
  wristTilt: number;
  /** View angle hint for rendering */
  viewAngle: "front" | "side-left" | "side-right" | "top" | "angle-45";
}

export const HAND_POSE_LIBRARY: HandPose[] = [
  // ── OPEN / FLAT ──────────────────────────────────────────────────────────
  { id: "hand_pose_001", name: "open-palm-front",         curls: [0.1, 0.0, 0.0, 0.0, 0.0], spread: [0.3, 0.2, 0.1, 0.2, 0.3], wristTilt: 0,    viewAngle: "front" },
  { id: "hand_pose_002", name: "open-palm-slight-spread", curls: [0.1, 0.0, 0.0, 0.0, 0.0], spread: [0.6, 0.5, 0.4, 0.5, 0.6], wristTilt: 0,    viewAngle: "front" },
  { id: "hand_pose_003", name: "fingers-fully-spread",    curls: [0.0, 0.0, 0.0, 0.0, 0.0], spread: [1.0, 0.9, 0.8, 0.9, 1.0], wristTilt: 0,    viewAngle: "front" },
  { id: "hand_pose_004", name: "flat-hand-fingers-together", curls: [0.15, 0.0, 0.0, 0.0, 0.0], spread: [0.1, 0.0, 0.0, 0.0, 0.1], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_005", name: "flat-hand-tilted-left",   curls: [0.15, 0.0, 0.0, 0.0, 0.0], spread: [0.1, 0.0, 0.0, 0.0, 0.1], wristTilt: -20, viewAngle: "front" },
  { id: "hand_pose_006", name: "flat-hand-tilted-right",  curls: [0.15, 0.0, 0.0, 0.0, 0.0], spread: [0.1, 0.0, 0.0, 0.0, 0.1], wristTilt: 20,  viewAngle: "front" },
  { id: "hand_pose_007", name: "palm-facing-up",          curls: [0.1, 0.0, 0.0, 0.0, 0.0], spread: [0.2, 0.1, 0.1, 0.1, 0.2], wristTilt: 0,    viewAngle: "top" },
  { id: "hand_pose_008", name: "palm-facing-down",        curls: [0.1, 0.0, 0.0, 0.0, 0.0], spread: [0.2, 0.1, 0.1, 0.1, 0.2], wristTilt: 0,    viewAngle: "top" },

  // ── RELAXED / NATURAL ────────────────────────────────────────────────────
  { id: "hand_pose_009", name: "relaxed-natural",         curls: [0.3, 0.2, 0.25, 0.3, 0.35], spread: [0.2, 0.1, 0.0, 0.1, 0.2], wristTilt: 5,  viewAngle: "front" },
  { id: "hand_pose_010", name: "relaxed-slight-curl",     curls: [0.4, 0.3, 0.35, 0.4, 0.45], spread: [0.2, 0.1, 0.0, 0.1, 0.2], wristTilt: 0,  viewAngle: "front" },
  { id: "hand_pose_011", name: "relaxed-side-view",       curls: [0.3, 0.2, 0.25, 0.3, 0.35], spread: [0.1, 0.0, 0.0, 0.0, 0.1], wristTilt: 0,  viewAngle: "side-right" },

  // ── FIST / CLOSED ────────────────────────────────────────────────────────
  { id: "hand_pose_012", name: "closed-fist-front",       curls: [0.75, 0.95, 0.95, 0.95, 0.95], spread: [0.0, 0.0, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_013", name: "closed-fist-side",        curls: [0.75, 0.95, 0.95, 0.95, 0.95], spread: [0.0, 0.0, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "side-right" },
  { id: "hand_pose_014", name: "loose-fist",              curls: [0.6, 0.7, 0.75, 0.7, 0.65],   spread: [0.1, 0.0, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_015", name: "tight-fist-angled",       curls: [0.8, 0.95, 0.95, 0.95, 0.95], spread: [0.0, 0.0, 0.0, 0.0, 0.0], wristTilt: 15, viewAngle: "angle-45" },

  // ── SINGLE FINGER EXTENDED ───────────────────────────────────────────────
  { id: "hand_pose_016", name: "index-only",              curls: [0.7, 0.0, 0.95, 0.95, 0.95], spread: [0.0, 0.0, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_017", name: "middle-only",             curls: [0.7, 0.95, 0.0, 0.95, 0.95], spread: [0.0, 0.0, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_018", name: "ring-only",               curls: [0.7, 0.95, 0.95, 0.0, 0.95], spread: [0.0, 0.0, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_019", name: "pinky-only",              curls: [0.7, 0.95, 0.95, 0.95, 0.0], spread: [0.0, 0.0, 0.0, 0.0, 0.1], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_020", name: "thumb-extended-out",      curls: [0.0, 0.95, 0.95, 0.95, 0.95], spread: [0.8, 0.0, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },

  // ── TWO FINGERS ──────────────────────────────────────────────────────────
  { id: "hand_pose_021", name: "index-middle-open",       curls: [0.7, 0.0, 0.0, 0.95, 0.95], spread: [0.0, 0.3, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_022", name: "index-middle-together",   curls: [0.7, 0.0, 0.0, 0.95, 0.95], spread: [0.0, 0.0, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_023", name: "thumb-index-open",        curls: [0.0, 0.0, 0.95, 0.95, 0.95], spread: [0.7, 0.2, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_024", name: "pinky-thumb-open",        curls: [0.0, 0.95, 0.95, 0.95, 0.0], spread: [0.7, 0.0, 0.0, 0.0, 0.4], wristTilt: 0, viewAngle: "front" },

  // ── THREE FINGERS ────────────────────────────────────────────────────────
  { id: "hand_pose_025", name: "three-fingers-open",      curls: [0.7, 0.0, 0.0, 0.0, 0.95], spread: [0.0, 0.2, 0.0, 0.2, 0.0], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_026", name: "three-spread",            curls: [0.7, 0.0, 0.0, 0.0, 0.95], spread: [0.0, 0.5, 0.3, 0.5, 0.0], wristTilt: 0, viewAngle: "front" },

  // ── FOUR FINGERS ─────────────────────────────────────────────────────────
  { id: "hand_pose_027", name: "four-fingers-open",       curls: [0.8, 0.0, 0.0, 0.0, 0.0], spread: [0.0, 0.2, 0.0, 0.2, 0.3], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_028", name: "four-fingers-together",   curls: [0.8, 0.0, 0.0, 0.0, 0.0], spread: [0.0, 0.0, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },

  // ── CURVED / BENT ────────────────────────────────────────────────────────
  { id: "hand_pose_029", name: "all-fingers-curved",      curls: [0.4, 0.4, 0.4, 0.4, 0.4], spread: [0.2, 0.1, 0.0, 0.1, 0.2], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_030", name: "c-shape",                 curls: [0.5, 0.45, 0.45, 0.45, 0.45], spread: [0.4, 0.2, 0.1, 0.2, 0.3], wristTilt: 0, viewAngle: "side-right" },
  { id: "hand_pose_031", name: "bent-index-knuckle",      curls: [0.7, 0.5, 0.95, 0.95, 0.95], spread: [0.0, 0.0, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },

  // ── PINCH ────────────────────────────────────────────────────────────────
  { id: "hand_pose_032", name: "pinch-closed",            curls: [0.0, 0.7, 0.9, 0.9, 0.9],   spread: [0.0, 0.0, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_033", name: "pinch-partial",           curls: [0.1, 0.45, 0.85, 0.85, 0.85], spread: [0.1, 0.0, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_034", name: "ok-shape",                curls: [0.0, 0.65, 0.0, 0.0, 0.0],  spread: [0.0, 0.0, 0.2, 0.2, 0.3], wristTilt: 0, viewAngle: "front" },

  // ── THUMB POSITIONS ──────────────────────────────────────────────────────
  { id: "hand_pose_035", name: "thumb-touches-index-tip", curls: [0.3, 0.7, 0.95, 0.95, 0.95], spread: [0.0, 0.0, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_036", name: "thumb-touches-middle",    curls: [0.5, 0.95, 0.7, 0.95, 0.95], spread: [0.0, 0.0, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_037", name: "thumb-touches-ring",      curls: [0.6, 0.95, 0.95, 0.7, 0.95], spread: [0.0, 0.0, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_038", name: "thumb-touches-pinky",     curls: [0.7, 0.95, 0.95, 0.95, 0.7], spread: [0.0, 0.0, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_039", name: "thumb-bent-in",           curls: [0.8, 0.0, 0.0, 0.0, 0.0],   spread: [0.0, 0.2, 0.0, 0.2, 0.3], wristTilt: 0, viewAngle: "front" },

  // ── WRIST ROTATIONS ──────────────────────────────────────────────────────
  { id: "hand_pose_040", name: "wrist-rotate-right-30",   curls: [0.15, 0.0, 0.0, 0.0, 0.0], spread: [0.1, 0.0, 0.0, 0.0, 0.1], wristTilt: 30,  viewAngle: "front" },
  { id: "hand_pose_041", name: "wrist-rotate-left-30",    curls: [0.15, 0.0, 0.0, 0.0, 0.0], spread: [0.1, 0.0, 0.0, 0.0, 0.1], wristTilt: -30, viewAngle: "front" },
  { id: "hand_pose_042", name: "side-karate-chop",        curls: [0.15, 0.05, 0.05, 0.05, 0.05], spread: [0.0, 0.0, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "side-right" },

  // ── TRANSITION / INTERMEDIATE ────────────────────────────────────────────
  { id: "hand_pose_043", name: "half-curl-all",           curls: [0.5, 0.5, 0.5, 0.5, 0.5], spread: [0.1, 0.0, 0.0, 0.0, 0.1], wristTilt: 0,  viewAngle: "front" },
  { id: "hand_pose_044", name: "index-half-curl",         curls: [0.7, 0.5, 0.95, 0.95, 0.95], spread: [0.0, 0.0, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },
  { id: "hand_pose_045", name: "index-middle-half-curl",  curls: [0.7, 0.5, 0.5, 0.95, 0.95], spread: [0.0, 0.1, 0.0, 0.0, 0.0], wristTilt: 0, viewAngle: "front" },
];

/**
 * Find the closest matching library pose to a given curl vector.
 * Uses weighted Euclidean distance. Returns the pose ID.
 */
export function findClosestPose(
  curls: [number, number, number, number, number]
): HandPose {
  let best = HAND_POSE_LIBRARY[0];
  let bestDist = Infinity;

  for (const pose of HAND_POSE_LIBRARY) {
    const dist = pose.curls.reduce(
      (sum, c, i) => sum + (c - curls[i]) ** 2,
      0
    );
    if (dist < bestDist) {
      bestDist = dist;
      best = pose;
    }
  }
  return best;
}
