"use client";

/**
 * Spoken feedback using the Web Speech API.
 * Returns speak() and isSpeaking state.
 */

import { useCallback, useRef, useState } from "react";

export function useSpeechFeedback() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number }) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? 0.95;
    utterance.pitch = options?.pitch ?? 1.1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
}

/** Generate contextual spoken feedback based on accuracy */
export function getFeedbackText(
  accuracy: number,
  signWord: string,
  errorFingers: string[],
  repCount: number
): string {
  if (accuracy >= 95) {
    const messages = [
      `Perfect! ${signWord} is exactly right!`,
      `Excellent ${signWord}! That's ${repCount} in a row!`,
      `Outstanding! Your ${signWord} sign is flawless!`,
    ];
    return messages[repCount % messages.length];
  }

  if (accuracy >= 80) {
    const tips =
      errorFingers.length > 0
        ? ` Check your ${errorFingers[0].toLowerCase()} finger position.`
        : "";
    return `Good ${signWord}! Almost perfect.${tips}`;
  }

  if (accuracy >= 60) {
    const tip =
      errorFingers.length > 0
        ? `Focus on your ${errorFingers.slice(0, 2).join(" and ")} finger${errorFingers.length > 1 ? "s" : ""}.`
        : "Keep your fingers in the correct position.";
    return `Keep practicing! ${tip}`;
  }

  return `Let's try ${signWord} again. Make sure you have the right hand shape.`;
}
