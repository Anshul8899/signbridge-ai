import { create } from "zustand";
import { Profile } from "@/types";

interface UserStore {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  updateXP: (amount: number) => void;
  updateStreak: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  updateXP: (amount) =>
    set((state) => {
      if (!state.profile) return state;
      const newXP = state.profile.xp + amount;
      const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
      return {
        profile: {
          ...state.profile,
          xp: newXP,
          level: newLevel,
        },
      };
    }),
  updateStreak: () =>
    set((state) => {
      if (!state.profile) return state;
      const lastActivity = state.profile.last_activity;
      const today = new Date().toDateString();
      if (lastActivity === today) return state;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak =
        lastActivity === yesterday ? state.profile.streak + 1 : 1;
      return {
        profile: {
          ...state.profile,
          streak: newStreak,
          last_activity: today,
        },
      };
    }),
}));

interface LessonStore {
  completedLessons: Set<string>;
  currentLesson: string | null;
  markComplete: (lessonId: string) => void;
  setCurrentLesson: (lessonId: string | null) => void;
}

export const useLessonStore = create<LessonStore>((set) => ({
  completedLessons: new Set(),
  currentLesson: null,
  markComplete: (lessonId) =>
    set((state) => ({
      completedLessons: new Set([...state.completedLessons, lessonId]),
    })),
  setCurrentLesson: (lessonId) => set({ currentLesson: lessonId }),
}));

interface UIStore {
  sidebarOpen: boolean;
  theme: "dark" | "light";
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  theme: "dark",
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
}));
