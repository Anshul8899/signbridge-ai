/**
 * Sign definitions: target hand poses used to compare against user gestures.
 * curls are 0=extended, 1=fully curled for [thumb, index, middle, ring, pinky]
 */

export interface SignDefinition {
  id: string;
  word: string;
  emoji: string;
  description: string;
  instruction: string;
  /** Target curl values [thumb, index, middle, ring, pinky] */
  targetCurls: [number, number, number, number, number];
  /** Which fingers must be extended */
  extendedFingers: [boolean, boolean, boolean, boolean, boolean];
  /** Demo video URL (YouTube embed or null) */
  demoVideoId: string | null;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  /** XP granted per successful rep */
  xpPerRep: number;
  /** Tip shown to user when accuracy is low */
  tips: string[];
}

export const SIGN_DEFINITIONS: SignDefinition[] = [
  {
    id: "hello",
    word: "Hello",
    emoji: "👋",
    description: "Flat hand moves outward from forehead like a salute",
    instruction: "Hold your flat hand (B-shape) at your forehead with fingers together, then move it outward to the side.",
    targetCurls: [0.2, 0.05, 0.05, 0.05, 0.05],
    extendedFingers: [true, true, true, true, true],
    demoVideoId: null,
    category: "Greetings",
    difficulty: "beginner",
    xpPerRep: 10,
    tips: [
      "Keep all four fingers together and straight",
      "Start the motion at your forehead",
      "Move your hand outward smoothly",
    ],
  },
  {
    id: "thank-you",
    word: "Thank You",
    emoji: "🙏",
    description: "Flat hand from chin moves outward and down",
    instruction: "Touch your chin with the fingertips of your flat hand, then move your hand forward and slightly down.",
    targetCurls: [0.2, 0.05, 0.05, 0.05, 0.05],
    extendedFingers: [true, true, true, true, true],
    demoVideoId: null,
    category: "Greetings",
    difficulty: "beginner",
    xpPerRep: 10,
    tips: [
      "Start with fingers touching your chin",
      "Keep fingers flat and together",
      "Move forward and downward",
    ],
  },
  {
    id: "yes",
    word: "Yes",
    emoji: "✊",
    description: "Fist nods up and down like a head-nod",
    instruction: "Make a fist (S-hand), then bend your wrist up and down repeatedly like nodding.",
    targetCurls: [0.7, 0.9, 0.9, 0.9, 0.9],
    extendedFingers: [false, false, false, false, false],
    demoVideoId: null,
    category: "Basic",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "Curl all fingers into a tight fist",
      "Keep thumb on the side or over fingers",
      "The motion is up-down, not side-to-side",
    ],
  },
  {
    id: "no",
    word: "No",
    emoji: "✌️",
    description: "Index and middle fingers snap to thumb",
    instruction: "Extend your index and middle fingers (V-shape), then snap them down to meet your thumb twice.",
    targetCurls: [0.3, 0.05, 0.05, 0.9, 0.9],
    extendedFingers: [false, true, true, false, false],
    demoVideoId: null,
    category: "Basic",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "Extend only index and middle fingers",
      "Keep ring and pinky curled in",
      "Snap fingers down to the thumb",
    ],
  },
  {
    id: "help",
    word: "Help",
    emoji: "🆘",
    description: "Fist on open palm, both hands move upward",
    instruction: "Place your dominant hand fist (A-shape) on your non-dominant open palm, then lift both hands upward together.",
    targetCurls: [0.7, 0.9, 0.9, 0.9, 0.9],
    extendedFingers: [false, false, false, false, false],
    demoVideoId: null,
    category: "Emergency",
    difficulty: "beginner",
    xpPerRep: 12,
    tips: [
      "Form a firm fist with your dominant hand",
      "Rest it on your open non-dominant palm",
      "Lift both hands upward together",
    ],
  },
  {
    id: "water",
    word: "Water",
    emoji: "💧",
    description: "W handshape taps chin twice",
    instruction: "Spread your index, middle, and ring fingers (W-shape) and tap your chin twice.",
    targetCurls: [0.9, 0.05, 0.05, 0.05, 0.9],
    extendedFingers: [false, true, true, true, false],
    demoVideoId: null,
    category: "Food",
    difficulty: "beginner",
    xpPerRep: 10,
    tips: [
      "Extend index, middle and ring fingers",
      "Keep thumb and pinky bent in",
      "Tap your chin lightly twice",
    ],
  },
  {
    id: "please",
    word: "Please",
    emoji: "🤲",
    description: "Flat hand circles on chest",
    instruction: "Place your flat hand (B-shape) on your chest and move it in a circular motion.",
    targetCurls: [0.2, 0.05, 0.05, 0.05, 0.05],
    extendedFingers: [true, true, true, true, true],
    demoVideoId: null,
    category: "Greetings",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "Keep all fingers extended and together",
      "Place your hand flat on your chest",
      "Make a smooth circular motion",
    ],
  },
  {
    id: "sorry",
    word: "Sorry",
    emoji: "😔",
    description: "Fist circles on chest",
    instruction: "Make a fist (A-hand) and rub it in a circular motion on your chest.",
    targetCurls: [0.7, 0.9, 0.9, 0.9, 0.9],
    extendedFingers: [false, false, false, false, false],
    demoVideoId: null,
    category: "Greetings",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "Curl all fingers into a fist",
      "Keep thumb against the side",
      "Move in a slow circular motion on chest",
    ],
  },
  {
    id: "love",
    word: "I Love You",
    emoji: "🤟",
    description: "ILY handshape: thumb, index, and pinky extended",
    instruction: "Extend your thumb, index finger, and pinky while keeping middle and ring fingers curled down.",
    targetCurls: [0.1, 0.05, 0.9, 0.9, 0.05],
    extendedFingers: [true, true, false, false, true],
    demoVideoId: null,
    category: "Expressions",
    difficulty: "beginner",
    xpPerRep: 10,
    tips: [
      "Extend thumb, index finger AND pinky together",
      "Keep middle and ring fingers folded",
      "The 'ILY' sign combines I, L and Y shapes",
    ],
  },
  {
    id: "good",
    word: "Good",
    emoji: "👍",
    description: "Flat hand from chin moves forward and down to open palm",
    instruction: "Touch your chin with your flat hand, then move it forward and down into your other open palm.",
    targetCurls: [0.2, 0.05, 0.05, 0.05, 0.05],
    extendedFingers: [true, true, true, true, true],
    demoVideoId: null,
    category: "Basic",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "Start with fingers touching your chin",
      "Move hand forward and down smoothly",
      "Finish with palm facing up in other hand",
    ],
  },
  {
    id: "letter-a",
    word: "Letter A",
    emoji: "🅰️",
    description: "Fist with thumb resting on the side",
    instruction: "Make a fist with all four fingers curled, thumb resting on the side of the index finger.",
    targetCurls: [0.5, 0.9, 0.9, 0.9, 0.9],
    extendedFingers: [false, false, false, false, false],
    demoVideoId: null,
    category: "Alphabet",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "Curl all four fingers tightly",
      "Rest thumb on side of index finger",
      "Keep the fist upright, not sideways",
    ],
  },
  {
    id: "letter-b",
    word: "Letter B",
    emoji: "🅱️",
    description: "Four fingers extended together, thumb folded in",
    instruction: "Hold all four fingers straight up and together, with thumb folded across the palm.",
    targetCurls: [0.9, 0.05, 0.05, 0.05, 0.05],
    extendedFingers: [false, true, true, true, true],
    demoVideoId: null,
    category: "Alphabet",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "Keep all four fingers straight and together",
      "Fold the thumb tightly across the palm",
      "Palm faces forward",
    ],
  },
  {
    id: "letter-c",
    word: "Letter C",
    emoji: "©️",
    description: "Hand curves like the letter C",
    instruction: "Curve all fingers and thumb to form a C-shape, like you're holding a large cup.",
    targetCurls: [0.5, 0.4, 0.4, 0.4, 0.4],
    extendedFingers: [false, false, false, false, false],
    demoVideoId: null,
    category: "Alphabet",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "Curve all fingers gently (not a full fist)",
      "Thumb should also curve matching fingers",
      "Keep the opening of the C facing to the side",
    ],
  },
  {
    id: "number-1",
    word: "Number 1",
    emoji: "1️⃣",
    description: "Index finger points up",
    instruction: "Extend only your index finger pointing straight up, all other fingers curled.",
    targetCurls: [0.7, 0.05, 0.9, 0.9, 0.9],
    extendedFingers: [false, true, false, false, false],
    demoVideoId: null,
    category: "Numbers",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "Point index finger straight up",
      "Keep thumb, middle, ring and pinky curled",
      "Keep the pointing firm and clear",
    ],
  },
  {
    id: "number-2",
    word: "Number 2",
    emoji: "2️⃣",
    description: "Index and middle fingers extended (V/peace sign)",
    instruction: "Extend index and middle fingers, keep all others curled. Fingers can be slightly apart.",
    targetCurls: [0.7, 0.05, 0.05, 0.9, 0.9],
    extendedFingers: [false, true, true, false, false],
    demoVideoId: null,
    category: "Numbers",
    difficulty: "beginner",
    xpPerRep: 8,
    tips: [
      "Extend both index AND middle finger",
      "Keep ring and pinky finger curled",
      "Thumb can be bent or tucked",
    ],
  },
];

export function getSignById(id: string): SignDefinition | undefined {
  return SIGN_DEFINITIONS.find((s) => s.id === id);
}

export function getSignsByCategory(category: string): SignDefinition[] {
  return SIGN_DEFINITIONS.filter((s) => s.category === category);
}

export const SIGN_CATEGORIES = [
  ...new Set(SIGN_DEFINITIONS.map((s) => s.category)),
];
