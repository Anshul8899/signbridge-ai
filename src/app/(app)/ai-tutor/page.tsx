"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, Mic, Sparkles, User, RotateCcw, Zap, BookOpen, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  "How do I sign 'Hello' correctly?",
  "What's the difference between ASL and BSL?",
  "Teach me emergency signs",
  "Give me 5 practice exercises",
  "How can I improve my finger spelling?",
  "What are common beginner mistakes?",
];

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI Sign Language Tutor powered by advanced AI. 🤟\n\nI can help you:\n• Explain any sign in detail\n• Generate practice exercises\n• Answer questions about ASL\n• Give personalized learning tips\n• Create example conversations\n\nWhat would you like to learn today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const userMessage = text ?? input.trim();
    if (!userMessage) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I'm having trouble connecting right now. Please make sure your OpenAI API key is configured. In the meantime, I can tell you that **Hello** in ASL is signed by holding a flat hand to your forehead and moving it outward, like a salute! 👋",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col p-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center glow-pulse">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            AI Sign Language Tutor
            <Badge variant="purple">
              <Sparkles className="w-3 h-3 mr-1" />
              GPT-4
            </Badge>
          </h1>
          <p className="text-white/50 text-sm">Your personal 24/7 ASL expert</p>
        </div>
        <button
          onClick={() => setMessages([{
            id: "1",
            role: "assistant",
            content: "Hi! I'm your AI Sign Language Tutor. What would you like to learn today? 🤟",
            timestamp: new Date(),
          }])}
          className="ml-auto p-2 rounded-xl glass text-white/50 hover:text-white transition-colors"
          title="Clear conversation"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Quick Prompts */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {QUICK_PROMPTS.slice(0, 4).map((prompt) => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt)}
            className="px-3 py-1.5 rounded-xl glass border border-white/10 text-white/60 hover:text-white hover:border-purple-500/40 transition-all text-xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 rounded-2xl glass border border-white/5 p-4 mb-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === "assistant"
                  ? "bg-gradient-to-br from-purple-600 to-blue-600"
                  : "bg-gradient-to-br from-green-600 to-emerald-600"
              }`}>
                {msg.role === "assistant"
                  ? <Brain className="w-5 h-5 text-white" />
                  : <User className="w-5 h-5 text-white" />
                }
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "assistant"
                      ? "glass border border-white/10 text-white"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-white/20 text-xs px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="glass border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-purple-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <span className="text-white/50 text-xs">AI is thinking...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Ask me anything about sign language..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            className="pl-9"
          />
        </div>
        <Button
          variant="gradient"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
