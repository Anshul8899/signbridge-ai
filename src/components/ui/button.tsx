"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "gradient" | "glass" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-purple-600 text-white hover:bg-purple-700 active:scale-95": variant === "default",
            "border border-white/20 text-white hover:bg-white/10 bg-transparent": variant === "outline",
            "text-white/70 hover:text-white hover:bg-white/5": variant === "ghost",
            "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 active:scale-95 shadow-lg shadow-purple-500/25": variant === "gradient",
            "glass text-white hover:bg-white/10": variant === "glass",
            "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
          },
          {
            "text-xs px-3 py-1.5 gap-1.5": size === "sm",
            "text-sm px-4 py-2 gap-2": size === "md",
            "text-base px-6 py-3 gap-2.5": size === "lg",
            "p-2": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
