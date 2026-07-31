"use client";

import Link from "next/link";
import { Hand, GitBranch, MessageCircle, ExternalLink, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    Product: ["Features", "Lessons", "Practice", "AI Tutor", "Quiz"],
    Company: ["About", "Blog", "Careers", "Press", "Contact"],
    Community: ["Discord", "Forum", "Events", "Newsletter"],
    Legal: ["Privacy Policy", "Terms of Service", "Accessibility", "Cookies"],
  };

  return (
    <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Hand className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">SignBridge AI</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Breaking communication barriers through AI-powered sign language education. 
              Learn ASL interactively with real-time feedback and engaging lessons.
            </p>
            <div className="flex items-center gap-3">
              {[GitBranch, MessageCircle, Mail, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-white/50 text-sm hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {currentYear} SignBridge AI. All rights reserved. Built with ❤️ for the deaf community.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-white/40 text-xs">🌍 Accessible for everyone</span>
            <span className="text-white/40 text-xs">♿ WCAG 2.1 Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
