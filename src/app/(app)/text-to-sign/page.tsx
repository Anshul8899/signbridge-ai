"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Type, ArrowRight, Play, Pause, RotateCcw, Zap, Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SignWord {
  word: string;
  description: string;
  emoji: string;
}

const EXAMPLE_SENTENCES = [
  "Hello, welcome to SignBridge AI",
  "Thank you for learning sign language",
  "I need help please",
  "Good morning, how are you?",
  "Water please, I am thirsty",
];

const signEmojis: Record<string, string> = {
  hello: "👋", welcome: "🤗", "thank": "🙏", you: "👆", learning: "📚",
  sign: "🤟", language: "💬", need: "🙋", help: "🆘", please: "🙏",
  good: "👍", morning: "🌅", how: "🤔", are: "🤷", water: "💧",
  "i": "👈", am: "✌️", thirsty: "😮", love: "❤️", bridge: "🌉",
  ai: "🤖", breaking: "💥", barriers: "🚧",
};

export default function TextToSignPage() {
  const [text, setText] = useState("");
  const [signs, setSigns] = useState<SignWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateSigns = async (inputText?: string) => {
    const query = inputText ?? text;
    if (!query.trim()) return;
    setLoading(true);
    setSigns([]);
    setCurrentIndex(0);
    setIsPlaying(false);

    try {
      const res = await fetch("/api/text-to-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: query }),
      });
      const data = await res.json();
      setSigns(data.signs ?? []);
    } catch {
      // Fallback: generate locally
      const words = query.split(/\s+/).filter(Boolean);
      setSigns(words.map((word) => ({
        word,
        description: `Sign for "${word}"`,
        emoji: signEmojis[word.toLowerCase()] ?? "🤟",
      })));
    } finally {
      setLoading(false);
    }
  };

  const playAnimation = () => {
    if (signs.length === 0) return;
    setIsPlaying(true);
    setCurrentIndex(0);
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setCurrentIndex(idx);
      if (idx >= signs.length - 1) {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Type className="w-8 h-8 text-blue-400" />
          Text to Sign Language
        </h1>
        <p className="text-white/50 mt-1">Convert any text into animated sign language sequences</p>
      </motion.div>

      {/* Input */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Type or paste text to convert to signs..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generateSigns()}
              />
            </div>
            <Button variant="gradient" onClick={() => generateSigns()} disabled={loading || !text.trim()}>
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              Convert
            </Button>
          </div>

          {/* Example sentences */}
          <div className="mt-4">
            <p className="text-white/30 text-xs mb-2">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_SENTENCES.map((sentence) => (
                <button
                  key={sentence}
                  onClick={() => { setText(sentence); generateSigns(sentence); }}
                  className="px-3 py-1 rounded-full glass border border-white/10 text-white/60 hover:text-white hover:border-purple-500/40 transition-all text-xs"
                >
                  {sentence.length > 30 ? sentence.slice(0, 30) + "…" : sentence}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animation Display */}
      {signs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Current sign hero */}
          <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/20 mb-4">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-center"
                >
                  <div
                    className="text-8xl mb-4"
                    style={{ filter: "drop-shadow(0 0 30px rgba(59,130,246,0.8))" }}
                  >
                    {signs[currentIndex]?.emoji ?? "🤟"}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {signs[currentIndex]?.word}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {signs[currentIndex]?.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <Button variant="glass" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
                  ←
                </Button>
                {isPlaying ? (
                  <Button variant="glass" onClick={() => setIsPlaying(false)}>
                    <Pause className="w-4 h-4" />
                    Pause
                  </Button>
                ) : (
                  <Button variant="gradient" onClick={playAnimation}>
                    <Play className="w-4 h-4" />
                    Play All
                  </Button>
                )}
                <Button variant="glass" onClick={() => { setCurrentIndex(0); setIsPlaying(false); }}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button variant="glass" onClick={() => setCurrentIndex(Math.min(signs.length - 1, currentIndex + 1))} disabled={currentIndex === signs.length - 1}>
                  →
                </Button>
              </div>

              {/* Progress */}
              <div className="flex justify-center gap-2 mt-4">
                {signs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`rounded-full transition-all ${
                      i === currentIndex ? "w-6 h-2 bg-blue-400" : "w-2 h-2 bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* All Signs Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {signs.map((sign, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setCurrentIndex(i)}
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                  i === currentIndex
                    ? "bg-blue-500/30 border border-blue-500/40"
                    : "glass hover:bg-white/10"
                }`}
              >
                <span className="text-2xl">{sign.emoji}</span>
                <span className="text-white/60 text-xs mt-1 truncate w-full text-center">{sign.word}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
