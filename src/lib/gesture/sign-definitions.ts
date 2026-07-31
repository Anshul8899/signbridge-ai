/**
 * ASL Sign Definitions
 *
 * Every entry is cross-referenced against:
 *  • Lifeprint / ASL University (www.lifeprint.com) — Dr. Bill Vicars
 *  • Signing Savvy (www.signingsavvy.com)
 *  • "The American Sign Language Handshape Dictionary" — Tennant & Brown
 *
 * Fields:
 *  targetCurls   — [thumb, index, middle, ring, pinky]  0=fully extended, 1=fully curled
 *  referenceSpread — same finger order, 0=fingers touching, 1=maximum spread
 *  wristTilt     — degrees: 0=upright, negative=tilts left, positive=tilts right
 *
 * IMPORTANT: targetCurls drives the gesture-recognition scoring.
 *            referenceSpread + wristTilt drive the reference hand display.
 *            Both must reflect the same verified handshape.
 */

export interface SignDefinition {
  id: string;
  word: string;
  description: string;
  instruction: string;

  /**
   * Target curl per finger [thumb, index, middle, ring, pinky]
   * 0 = fully extended/straight, 1 = fully curled into palm.
   * Used by the gesture-recognition pipeline to score the user's pose.
   */
  targetCurls: [number, number, number, number, number];

  /**
   * Spread per finger for the REFERENCE display [thumb, index, middle, ring, pinky]
   * 0 = fingers touching/together, 1 = maximum spread.
   * Derived from the same verified ASL source as targetCurls.
   */
  referenceSpread: [number, number, number, number, number];

  /**
   * Wrist tilt for the reference display in degrees.
   * 0 = hand upright (fingers point straight up).
   * Negative = tilts left (counter-clockwise), positive = tilts right.
   */
  wristTilt: number;

  /** Which fingers must be extended (used for per-finger scoring feedback) */
  extendedFingers: [boolean, boolean, boolean, boolean, boolean];

  /** Demo video URL (YouTube embed or null) */
  demoVideoId: string | null;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  /** XP granted per successful rep */
  xpPerRep: number;
  /** Coaching tips shown when accuracy is low */
  tips: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// ASL Sign Library — 15 verified signs
// ─────────────────────────────────────────────────────────────────────────────
//
// Handshape notation reference (Stokoe / HamNoSys convention used by Lifeprint):
//   B  = four fingers together, extended; thumb folded across palm
//   A  = all four fingers curled into fist; thumb rests on side of index (not inside)
//   S  = tight fist; thumb covers or overlaps front of fingers
//   W  = index + middle + ring extended & spread; thumb + pinky bent in
//   ILY= index + pinky + thumb extended; middle + ring curled
//   C  = all digits curve as if holding a cylinder
//   1  = index extended, others curl; thumb may rest alongside
//   2  = index + middle extended, others curled
//
// Curl values are calibrated to MediaPipe normalised joint angles
// (0 = MCP/PIP fully extended, 1 = DIP fully flexed).

export const SIGN_DEFINITIONS: SignDefinition[] = [

  // ── GREETINGS ──────────────────────────────────────────────────────────────

  {
    id: "hello",
    word: "Hello",
    // Lifeprint: B-hand, palm out, flat at forehead then sweeps to side.
    // Handshape at target frame: B — four fingers extended and together, thumb
    // slightly out, palm faces away from signer.
    description: "B-hand salute: flat hand sweeps outward from the forehead",
    instruction: "Hold your flat B-hand at your forehead — four fingers together, thumb relaxed outward — then sweep your hand out to the side like a salute.",
    targetCurls:     [0.15, 0.05, 0.05, 0.05, 0.05],
    referenceSpread: [0.20, 0.05, 0.03, 0.03, 0.05],
    wristTilt: 0,
    extendedFingers: [true, true, true, true, true],
    demoVideoId: null,
    category: "Greetings",
    difficulty: "beginner",
    xpPerRep: 10,
    tips: [
      "Keep index, middle, ring, and pinky straight and together",
      "Thumb is relaxed, slightly out — not tucked or curled",
      "Start the motion with your hand at your forehead",
      "Sweep outward smoothly to the side of your head",
    ],
  },

  {
    id: "thank-you",
    word: "Thank You",
    // Lifeprint: B-hand, fingers touch chin then move forward and slightly down.
    // Handshape at target frame: B — same as Hello but at chin, moving forward.
    description: "B-hand from chin moves forward and down",
    instruction: "Touch the fingertips of your flat B-hand to your chin, then move your hand forward and slightly downward.",
    targetCurls:     [0.15, 0.05, 0.05, 0.05, 0.05],
    referenceSpread: [0.10, 0.03, 0.02, 0.02, 0.03],
    wristTilt: 0,
    extendedFingers: [true, true, true, true, true],
    demoVideoId: null,
    category: "Greetings",
    difficulty: "beginner",
    xpPerRep: 10,
    tips: [
      "Fingers are flat and together — classic B-handshape",
      "Touch your chin first, then move forward and down",
      "Palm faces inward (toward you) at the start",
      "The motion represents throwing a kiss of gratitude",
    ],
  },

  {
    id: "please",
    word: "Please",
    // Lifeprint: flat hand (B) placed on chest, circular motion.
    // Handshape: B — fingers together, all extended; thumb slightly loose.
    description: "Flat B-hand circles on the chest",
    instruction: "Place your flat B-hand on your chest with the palm facing in. Rub in a smooth circular motion.",
    targetCurls:     [0.15, 0.05, 0.05, 0.05, 0.05],
    referenceSpread: [0.10, 0.03, 0.02, 0.02, 0.03],
    wristTilt: 0,
    extendedFingers: [true, true, true, true, true],
    demoVideoId: null,
    category: "Greetings",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "Fingers are extended and together — B-handshape",
      "Palm faces inward toward your chest",
      "Make a smooth circular rubbing motion on the chest",
    ],
  },

  {
    id: "sorry",
    word: "Sorry",
    // Lifeprint: A-hand (fist, thumb on side) circles on chest.
    // Handshape: A — all four fingers tightly curled; thumb rests alongside index,
    //   NOT tucked inside (that is the S-hand).
    description: "A-hand (fist, thumb beside) circles on the chest",
    instruction: "Make an A-fist — all four fingers curled, thumb resting on the side of your index finger — and rub it in a slow circle on your chest.",
    targetCurls:     [0.55, 0.90, 0.90, 0.90, 0.90],
    referenceSpread: [0.05, 0.00, 0.00, 0.00, 0.00],
    wristTilt: 0,
    extendedFingers: [false, false, false, false, false],
    demoVideoId: null,
    category: "Greetings",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "Curl all four fingers firmly — A-handshape",
      "Thumb rests on the SIDE of the index finger, not inside the fist",
      "Keep the fist upright, not sideways",
      "Circle slowly and deliberately on your chest",
    ],
  },

  // ── BASIC ──────────────────────────────────────────────────────────────────

  {
    id: "yes",
    word: "Yes",
    // Lifeprint: S-hand (tight fist, thumb over fingers) nods like a head.
    // Handshape: S — fingers tightly curled, thumb wraps over front of fingers
    //   (distinguishes S from A where thumb is beside).
    description: "S-hand (tight fist) nods up and down like a head-nod",
    instruction: "Make a firm S-fist — curl all four fingers, thumb across the front — then nod your wrist up and down twice.",
    targetCurls:     [0.75, 0.92, 0.92, 0.92, 0.92],
    referenceSpread: [0.00, 0.00, 0.00, 0.00, 0.00],
    wristTilt: 0,
    extendedFingers: [false, false, false, false, false],
    demoVideoId: null,
    category: "Basic",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "Curl ALL fingers tightly into the palm — S-handshape",
      "Thumb wraps across the FRONT of your fingers",
      "Nod the wrist up and down — like saying 'yes' with your head",
      "Keep the motion small and crisp",
    ],
  },

  {
    id: "no",
    word: "No",
    // Lifeprint: index + middle fingers extended, snap down to meet thumb twice.
    // Handshape at target: index + middle extended, ring + pinky curled;
    //   thumb is slightly extended to meet the snapping fingers.
    description: "Index and middle fingers snap down to the thumb twice",
    instruction: "Extend your index and middle fingers (like a 2 or peace sign). Keep ring and pinky curled. Snap index and middle down to touch your thumb twice.",
    targetCurls:     [0.30, 0.05, 0.05, 0.90, 0.90],
    referenceSpread: [0.00, 0.25, 0.10, 0.00, 0.00],
    wristTilt: 0,
    extendedFingers: [false, true, true, false, false],
    demoVideoId: null,
    category: "Basic",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "Extend ONLY index and middle fingers",
      "Keep ring and pinky firmly curled in",
      "Thumb faces upward, ready to receive the snap",
      "Snap fingers DOWN to the thumb — not sideways",
    ],
  },

  {
    id: "good",
    word: "Good",
    // Lifeprint: B-hand at chin, moves down to rest on non-dominant open palm.
    // Target handshape is the same B at chin as Thank You.
    description: "B-hand from chin moves forward and lands on the other open palm",
    instruction: "Touch your flat B-hand to your chin, move it forward and down until it rests on your non-dominant open palm.",
    targetCurls:     [0.15, 0.05, 0.05, 0.05, 0.05],
    referenceSpread: [0.10, 0.03, 0.02, 0.02, 0.03],
    wristTilt: 0,
    extendedFingers: [true, true, true, true, true],
    demoVideoId: null,
    category: "Basic",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "B-handshape — fingers flat and together",
      "Start with fingertips touching your chin",
      "Move forward and down smoothly",
      "Finish with the back of your hand resting in your other palm",
    ],
  },

  // ── EMERGENCY ──────────────────────────────────────────────────────────────

  {
    id: "help",
    word: "Help",
    // Lifeprint: dominant A-hand (fist) placed on non-dominant B open palm,
    //   both hands move upward. The target handshape for recognition is the A-fist.
    description: "A-fist on open palm — both hands lift upward",
    instruction: "Make an A-fist with your dominant hand. Rest it on your non-dominant open palm. Lift both hands upward together.",
    targetCurls:     [0.55, 0.90, 0.90, 0.90, 0.90],
    referenceSpread: [0.05, 0.00, 0.00, 0.00, 0.00],
    wristTilt: 0,
    extendedFingers: [false, false, false, false, false],
    demoVideoId: null,
    category: "Emergency",
    difficulty: "beginner",
    xpPerRep: 12,
    tips: [
      "Dominant hand: A-fist — thumb on side of index finger",
      "Non-dominant hand: flat open palm facing upward",
      "Rest fist ON the open palm, then lift both together",
      "The movement is upward — like lifting something",
    ],
  },

  // ── FOOD ───────────────────────────────────────────────────────────────────

  {
    id: "water",
    word: "Water",
    // Lifeprint: W-handshape (index + middle + ring extended and fanned;
    //   thumb + pinky curl in). Taps chin twice.
    // W = three middle fingers spread like a trident.
    description: "W-hand (index, middle, ring spread) taps chin twice",
    instruction: "Extend and slightly spread your index, middle, and ring fingers (W-shape). Keep thumb and pinky bent in. Tap the W to your chin twice.",
    targetCurls:     [0.88, 0.05, 0.05, 0.05, 0.88],
    referenceSpread: [0.00, 0.40, 0.30, 0.40, 0.00],
    wristTilt: 0,
    extendedFingers: [false, true, true, true, false],
    demoVideoId: null,
    category: "Food",
    difficulty: "beginner",
    xpPerRep: 10,
    tips: [
      "Extend index, middle, AND ring — that's the W-shape",
      "Fan those three fingers slightly apart",
      "Curl thumb AND pinky firmly in",
      "Tap your chin lightly — twice",
    ],
  },

  // ── EXPRESSIONS ────────────────────────────────────────────────────────────

  {
    id: "love",
    word: "I Love You",
    // Lifeprint: ILY-hand — thumb + index + pinky extended simultaneously,
    //   middle and ring finger curled. Combined I + L + Y handshapes.
    description: "ILY-hand: thumb, index, and pinky extended; middle and ring curled",
    instruction: "Extend your thumb, index finger, and pinky at the same time. Keep middle and ring fingers folded into the palm. Face your palm outward.",
    targetCurls:     [0.10, 0.05, 0.90, 0.90, 0.05],
    referenceSpread: [0.60, 0.20, 0.00, 0.00, 0.30],
    wristTilt: 0,
    extendedFingers: [true, true, false, false, true],
    demoVideoId: null,
    category: "Expressions",
    difficulty: "beginner",
    xpPerRep: 10,
    tips: [
      "Thumb, index, and pinky ALL extend at once",
      "Middle and ring fingers must be firmly folded in",
      "This is the combined I + L + Y handshape (ILY)",
      "Face your palm away from your body",
    ],
  },

  // ── ALPHABET ───────────────────────────────────────────────────────────────

  {
    id: "letter-a",
    word: "Letter A",
    // ASL Manual Alphabet: A — fist with thumb resting alongside (on the side of)
    //   the index finger. Different from S where thumb is across the front.
    description: "ASL A: fist with thumb alongside the index finger",
    instruction: "Curl all four fingers into a fist. Rest your thumb flat against the SIDE of your index finger — not across the front. Hold upright.",
    targetCurls:     [0.50, 0.90, 0.90, 0.90, 0.90],
    referenceSpread: [0.00, 0.00, 0.00, 0.00, 0.00],
    wristTilt: 0,
    extendedFingers: [false, false, false, false, false],
    demoVideoId: null,
    category: "Alphabet",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "Four fingers curl tightly into a fist",
      "Thumb rests on the SIDE of the index finger — not inside, not on top",
      "Keep the fist upright — knuckles face away from you",
      "A vs S: in A the thumb is beside; in S the thumb covers the front",
    ],
  },

  {
    id: "letter-b",
    word: "Letter B",
    // ASL Manual Alphabet: B — four fingers extended straight up and close together;
    //   thumb folds ACROSS the palm (tucked against palm, not extended).
    description: "ASL B: four fingers straight up together; thumb folded across palm",
    instruction: "Extend all four fingers straight up and hold them firmly together. Fold your thumb tightly across your palm. Palm faces forward.",
    targetCurls:     [0.90, 0.05, 0.05, 0.05, 0.05],
    referenceSpread: [0.00, 0.02, 0.02, 0.02, 0.03],
    wristTilt: 0,
    extendedFingers: [false, true, true, true, true],
    demoVideoId: null,
    category: "Alphabet",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "All four fingers must be straight and close together",
      "Thumb folds ACROSS the palm — not extended",
      "Palm faces forward (away from you)",
      "B vs Hello: in B the thumb is tucked; in Hello it's relaxed out",
    ],
  },

  {
    id: "letter-c",
    word: "Letter C",
    // ASL Manual Alphabet: C — all digits curve into a C (cylinder) shape.
    //   Thumb and fingers mirror each other in a gentle arc. Palm faces to the side.
    description: "ASL C: all digits curve into a C-shape (as if holding a can)",
    instruction: "Curve all five fingers and your thumb into a C-shape, as if holding a large can or cup. Keep the opening of the C facing to the side.",
    targetCurls:     [0.50, 0.42, 0.42, 0.42, 0.42],
    referenceSpread: [0.35, 0.15, 0.08, 0.08, 0.12],
    wristTilt: 0,
    extendedFingers: [false, false, false, false, false],
    demoVideoId: null,
    category: "Alphabet",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "All fingers curve GENTLY — not a full fist",
      "Thumb curves to match, forming the bottom of the C",
      "The opening of the C faces to the side",
      "Think of holding a tennis ball or soda can",
    ],
  },

  // ── NUMBERS ────────────────────────────────────────────────────────────────

  {
    id: "number-1",
    word: "Number 1",
    // ASL Numbers: 1 — index finger points straight up; all others curled;
    //   thumb may rest alongside the curled fingers or extend slightly.
    description: "ASL 1: index finger points straight up, all others curled",
    instruction: "Extend only your index finger pointing straight up. Curl middle, ring, and pinky into the palm. Thumb rests alongside curled fingers.",
    targetCurls:     [0.65, 0.05, 0.90, 0.90, 0.90],
    referenceSpread: [0.00, 0.00, 0.00, 0.00, 0.00],
    wristTilt: 0,
    extendedFingers: [false, true, false, false, false],
    demoVideoId: null,
    category: "Numbers",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "ONLY the index finger extends — all others stay curled",
      "Point the index finger firmly straight up",
      "Thumb rests comfortably beside the curled fingers",
      "Keep the hand upright, not angled",
    ],
  },

  {
    id: "number-2",
    word: "Number 2",
    // ASL Numbers: 2 — index and middle fingers extended, slightly apart (V-shape);
    //   ring and pinky curled; thumb may tuck alongside or remain loose.
    description: "ASL 2: index and middle fingers extended in a V-shape",
    instruction: "Extend your index and middle fingers, holding them slightly apart in a V or peace sign. Curl ring and pinky into the palm.",
    targetCurls:     [0.65, 0.05, 0.05, 0.90, 0.90],
    referenceSpread: [0.00, 0.30, 0.15, 0.00, 0.00],
    wristTilt: 0,
    extendedFingers: [false, true, true, false, false],
    demoVideoId: null,
    category: "Numbers",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "Index AND middle both fully extend",
      "Separate them slightly in a V-shape",
      "Ring and pinky are firmly curled in",
      "Thumb rests loosely — no need to force it",
    ],
  },

];

// ─────────────────────────────────────────────────────────────────────────────

export function getSignById(id: string): SignDefinition | undefined {
  return SIGN_DEFINITIONS.find((s) => s.id === id);
}

export function getSignsByCategory(category: string): SignDefinition[] {
  return SIGN_DEFINITIONS.filter((s) => s.category === category);
}

export const SIGN_CATEGORIES = [
  ...new Set(SIGN_DEFINITIONS.map((s) => s.category)),
];
