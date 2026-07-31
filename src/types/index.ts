export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
}

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  coins: number;
  streak: number;
  last_activity: string | null;
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  xpReward: number;
  signs: Sign[];
  estimatedTime: number;
  thumbnail?: string;
}

export interface Sign {
  id: string;
  word: string;
  description: string;
  handShape: string;
  movement: string;
  location: string;
  animationFrames: AnimationFrame[];
  exampleSentence?: string;
}

export interface AnimationFrame {
  time: number;
  leftHand?: HandPose;
  rightHand?: HandPose;
}

export interface HandPose {
  fingers: FingerState[];
  rotation: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
}

export interface FingerState {
  name: "thumb" | "index" | "middle" | "ring" | "pinky";
  extended: boolean;
  curl: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: string;
  earned?: boolean;
  earnedAt?: string;
}

export interface QuizQuestion {
  id: string;
  type: "image" | "gesture" | "multiple-choice" | "arrange" | "identify";
  question: string;
  options?: string[];
  correctAnswer: string;
  signId?: string;
  imageUrl?: string;
  xpReward: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak: number;
}

export interface PracticeResult {
  accuracy: number;
  feedback: string;
  suggestions: string[];
  fingerErrors: string[];
  rating: "excellent" | "good" | "needs-improvement";
}
