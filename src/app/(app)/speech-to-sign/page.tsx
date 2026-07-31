"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Play, Wand2, Volume2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SignWord {
  word: string;
  description: string;
  emoji: string;
}

export default function SpeechToSignPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [signs, setSigns] = useState<SignWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser. Please use Chrome.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const text = (Array.from(event.results) as any[])
        .map((r: any) => r[0].transcript)
        .join(" ");
      setTranscript(text);
      if (event.results[event.results.length - 1].isFinal) {
        convertToSigns(text);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const convertToSigns = async (text: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/text-to-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setSigns(data.signs ?? []);
      setCurrentIndex(0);
    } catch {
      const words = text.split(/\s+/).filter(Boolean);
      setSigns(words.map((word) => ({ word, description: `Sign for "${word}"`, emoji: "🤟" })));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Mic className="w-8 h-8 text-teal-400" />
          Speech to Sign Language
        </h1>
        <p className="text-white/50 mt-1">Speak naturally — watch it transform into sign language</p>
      </motion.div>

      {/* Mic Button */}
      <Card className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 border-teal-500/20">
        <CardContent className="p-8 flex flex-col items-center gap-6">
          <motion.button
            onClick={isListening ? stopListening : startListening}
            whileTap={{ scale: 0.95 }}
            className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? "bg-gradient-to-br from-red-600 to-red-700"
                : "bg-gradient-to-br from-teal-600 to-cyan-600"
            }`}
            style={{
              boxShadow: isListening
                ? "0 0 40px rgba(239,68,68,0.5), 0 0 80px rgba(239,68,68,0.2)"
                : "0 0 30px rgba(20,184,166,0.4)",
            }}
          >
            {isListening ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}

            {/* Pulsing rings when listening */}
            {isListening && (
              <>
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-red-400"
                    animate={{ scale: 1 + i * 0.3, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
              </>
            )}
          </motion.button>

          <div className="text-center">
            <h3 className="text-white font-semibold text-lg">
              {isListening ? "Listening... Speak now" : "Tap to Start Speaking"}
            </h3>
            <p className="text-white/40 text-sm">
              {isListening ? "Speak clearly into your microphone" : "Click the microphone and speak any sentence"}
            </p>
          </div>

          {/* Transcript */}
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-lg glass p-4 rounded-xl border border-white/10"
            >
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-teal-400" />
                <span className="text-white/50 text-xs">Transcript</span>
                {loading && <Badge variant="info">Converting…</Badge>}
              </div>
              <p className="text-white font-medium">"{transcript}"</p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Sign Animation */}
      {signs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-teal-400" />
                Sign Animation ({signs.length} signs)
              </h3>

              {/* Hero sign */}
              <div className="flex items-center justify-center mb-6 relative aspect-video max-h-60 rounded-2xl bg-gradient-to-br from-[#0f0c29] to-[#302b63] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-center"
                  >
                    <div className="text-8xl mb-2">{signs[currentIndex]?.emoji}</div>
                    <div className="text-2xl font-bold text-white">{signs[currentIndex]?.word}</div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <Button variant="glass" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>←</Button>
                <span className="text-white/50 text-sm">{currentIndex + 1} / {signs.length}</span>
                <Button variant="glass" onClick={() => setCurrentIndex(Math.min(signs.length - 1, currentIndex + 1))} disabled={currentIndex === signs.length - 1}>→</Button>
              </div>

              {/* All words */}
              <div className="flex flex-wrap gap-2 justify-center">
                {signs.map((sign, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all ${
                      i === currentIndex
                        ? "bg-teal-500/30 border border-teal-500/40 text-white"
                        : "glass text-white/60 hover:text-white"
                    }`}
                  >
                    <span>{sign.emoji}</span>
                    <span>{sign.word}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
