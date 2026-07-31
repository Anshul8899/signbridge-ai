"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is SignBridge AI free to use?",
    a: "Yes! SignBridge AI offers a comprehensive free tier with access to all foundational modules. Premium features like advanced AI tutoring and certificate generation are available with a subscription.",
  },
  {
    q: "Do I need any special equipment?",
    a: "Just a device with a webcam! SignBridge works in your browser using MediaPipe and TensorFlow.js. No downloads or installs required.",
  },
  {
    q: "Which sign language does SignBridge teach?",
    a: "SignBridge currently focuses on American Sign Language (ASL). We plan to add BSL, ISL, and other sign languages in future updates.",
  },
  {
    q: "How accurate is the AI gesture recognition?",
    a: "Our AI gesture recognition achieves 95%+ accuracy on most standard signs. The system continuously improves as more users practice and provide feedback.",
  },
  {
    q: "Can I use SignBridge for professional certification?",
    a: "SignBridge provides achievement certificates upon completing modules and milestones. While these are not official ASL interpreter certifications, they demonstrate proficiency and commitment.",
  },
  {
    q: "Is SignBridge suitable for children?",
    a: "Absolutely! SignBridge is designed for learners of all ages. The gamified interface makes it especially engaging for younger learners.",
  },
  {
    q: "How does the AI Tutor work?",
    a: "Our AI Tutor is powered by OpenAI. It can explain any sign, generate practice exercises, answer questions in natural language, and provide personalized learning recommendations.",
  },
  {
    q: "Can deaf and hard-of-hearing users benefit from SignBridge?",
    a: "Yes! SignBridge is built with accessibility as a core principle. It's an excellent tool for native signers to practice, refine technique, and help teach others.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 relative">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-yellow-500/30 text-sm text-yellow-300 mb-4">
            ❓ Common Questions
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                open === i ? "border-purple-500/40 glass" : "border-white/5 glass"
              }`}
            >
              <button
                className="w-full p-5 text-left flex items-center justify-between gap-4"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-white font-medium text-sm">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-white/40 flex-shrink-0 transition-transform duration-300 ${
                    open === i ? "rotate-180 text-purple-400" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-white/60 text-sm leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
