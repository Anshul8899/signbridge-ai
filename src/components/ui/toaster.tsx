"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
}

let toastQueue: ((toast: Omit<Toast, "id">) => void)[] = [];

export function toast(data: Omit<Toast, "id">) {
  toastQueue.forEach((fn) => fn(data));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const addToast = (data: Omit<Toast, "id">) => {
      const id = Math.random().toString(36);
      setToasts((prev) => [...prev, { ...data, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    toastQueue.push(addToast);
    return () => {
      toastQueue = toastQueue.filter((fn) => fn !== addToast);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={cn(
              "glass-dark rounded-xl px-4 py-3 pointer-events-auto flex items-start gap-3 min-w-[300px] max-w-[400px]",
              {
                "border-l-4 border-green-500": t.variant === "success",
                "border-l-4 border-red-500": t.variant === "error",
                "border-l-4 border-yellow-500": t.variant === "warning",
                "border-l-4 border-purple-500": t.variant === "default" || !t.variant,
              }
            )}
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{t.title}</p>
              {t.description && (
                <p className="text-xs text-white/60 mt-0.5">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
