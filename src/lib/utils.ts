import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
  return xp.toString();
}

export function getLevelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getXPForNextLevel(level: number): number {
  return level * level * 100;
}

export function getXPProgress(xp: number): number {
  const level = getLevelFromXP(xp);
  const currentLevelXP = (level - 1) * (level - 1) * 100;
  const nextLevelXP = getXPForNextLevel(level);
  return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
}
