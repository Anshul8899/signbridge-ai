import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ACHIEVEMENTS } from "@/lib/lessons";

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface DailyGoal {
  target: number; // reps target for today
  current: number;
  date: string; // ISO date string
}

export interface PracticeSession {
  signId: string;
  signWord: string;
  accuracy: number;
  reps: number;
  xpEarned: number;
  timestamp: string;
}

export interface TutorStore {
  // XP & levels
  xp: number;
  level: number;
  streak: number;
  lastPracticeDate: string | null;
  // Daily goals
  dailyGoal: DailyGoal;
  // Badges/achievements
  unlockedBadges: string[];
  // Lesson unlock status (lessonId → highest accuracy achieved)
  lessonAccuracy: Record<string, number>;
  // Rep counters per sign
  signReps: Record<string, number>;
  // Recent sessions
  sessions: PracticeSession[];

  // Actions
  addXP: (amount: number) => void;
  recordRep: (signId: string, signWord: string, accuracy: number) => void;
  recordPracticeDay: () => void;
  unlockBadge: (id: string) => void;
  updateLessonAccuracy: (lessonId: string, accuracy: number) => void;
  resetDailyGoal: (target: number) => void;
  isLessonUnlocked: (lessonId: string, requiredAccuracy?: number) => boolean;
}

function getLevelFromXP(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

export const useTutorStore = create<TutorStore>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak: 0,
      lastPracticeDate: null,
      dailyGoal: { target: 20, current: 0, date: getTodayString() },
      unlockedBadges: [],
      lessonAccuracy: {},
      signReps: {},
      sessions: [],

      addXP: (amount) =>
        set((state) => {
          const newXP = state.xp + amount;
          const newLevel = getLevelFromXP(newXP);
          return { xp: newXP, level: newLevel };
        }),

      recordRep: (signId, signWord, accuracy) =>
        set((state) => {
          // Count rep if accuracy >= 70%
          const counted = accuracy >= 70;
          const newReps = {
            ...state.signReps,
            [signId]: (state.signReps[signId] ?? 0) + (counted ? 1 : 0),
          };

          // XP: scale by accuracy
          const xpGain = counted ? Math.round((accuracy / 100) * 10) : 0;
          const newXP = state.xp + xpGain;
          const newLevel = getLevelFromXP(newXP);

          // Daily goal progress
          const today = getTodayString();
          const goal = state.dailyGoal;
          const newGoalCurrent =
            goal.date === today
              ? goal.current + (counted ? 1 : 0)
              : counted ? 1 : 0;
          const newGoal: DailyGoal = {
            target: goal.target,
            current: newGoalCurrent,
            date: today,
          };

          // Session tracking
          const lastSession = state.sessions[state.sessions.length - 1];
          const now = new Date().toISOString();
          let sessions = state.sessions;
          if (lastSession?.signId === signId && lastSession.timestamp.startsWith(today)) {
            sessions = [
              ...sessions.slice(0, -1),
              {
                ...lastSession,
                accuracy: Math.max(lastSession.accuracy, accuracy),
                reps: lastSession.reps + (counted ? 1 : 0),
                xpEarned: lastSession.xpEarned + xpGain,
              },
            ];
          } else {
            sessions = [
              ...sessions.slice(-99), // keep last 100
              { signId, signWord, accuracy, reps: counted ? 1 : 0, xpEarned: xpGain, timestamp: now },
            ];
          }

          return { signReps: newReps, xp: newXP, level: newLevel, dailyGoal: newGoal, sessions };
        }),

      recordPracticeDay: () =>
        set((state) => {
          const today = getTodayString();
          if (state.lastPracticeDate === today) return state;

          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
          const newStreak =
            state.lastPracticeDate === yesterday ? state.streak + 1 : 1;

          // Streak badge checks
          const badges = [...state.unlockedBadges];
          if (newStreak >= 3 && !badges.includes("streak-3")) badges.push("streak-3");
          if (newStreak >= 7 && !badges.includes("streak-7")) badges.push("streak-7");

          return { streak: newStreak, lastPracticeDate: today, unlockedBadges: badges };
        }),

      unlockBadge: (id) =>
        set((state) => {
          if (state.unlockedBadges.includes(id)) return state;
          return { unlockedBadges: [...state.unlockedBadges, id] };
        }),

      updateLessonAccuracy: (lessonId, accuracy) =>
        set((state) => {
          const current = state.lessonAccuracy[lessonId] ?? 0;
          if (accuracy <= current) return state;

          const badges = [...state.unlockedBadges];
          if (accuracy >= 90 && !badges.includes("first-lesson")) {
            badges.push("first-lesson");
          }
          if (lessonId === "alphabet" && accuracy >= 90 && !badges.includes("alphabet-master")) {
            badges.push("alphabet-master");
          }

          return {
            lessonAccuracy: { ...state.lessonAccuracy, [lessonId]: accuracy },
            unlockedBadges: badges,
          };
        }),

      resetDailyGoal: (target) =>
        set({ dailyGoal: { target, current: 0, date: getTodayString() } }),

      isLessonUnlocked: (lessonId, requiredAccuracy = 90) => {
        const state = get();
        // First lesson always unlocked
        const ALWAYS_UNLOCKED = ["greetings", "alphabet", "numbers"];
        if (ALWAYS_UNLOCKED.includes(lessonId)) return true;
        // Check if any prerequisite lesson has been completed at 90%+
        const anyQualifying = Object.values(state.lessonAccuracy).some(
          (acc) => acc >= requiredAccuracy
        );
        return anyQualifying;
      },
    }),
    {
      name: "signbridge-tutor",
      // Only persist these fields
      partialize: (state) => ({
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        lastPracticeDate: state.lastPracticeDate,
        dailyGoal: state.dailyGoal,
        unlockedBadges: state.unlockedBadges,
        lessonAccuracy: state.lessonAccuracy,
        signReps: state.signReps,
        sessions: state.sessions.slice(-50),
      }),
    }
  )
);
