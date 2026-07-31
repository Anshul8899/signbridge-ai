"use client";

import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-white/10 text-white/80": variant === "default",
          "bg-green-500/20 text-green-400 border border-green-500/30": variant === "success",
          "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30": variant === "warning",
          "bg-red-500/20 text-red-400 border border-red-500/30": variant === "danger",
          "bg-blue-500/20 text-blue-400 border border-blue-500/30": variant === "info",
          "bg-purple-500/20 text-purple-400 border border-purple-500/30": variant === "purple",
          "border border-white/20 text-white/70 bg-transparent": variant === "outline",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
