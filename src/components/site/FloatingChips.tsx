"use client";

import { motion, useReducedMotion } from "framer-motion";

const chips = [
  { label: "Mathematics", x: "6%", y: "14%", delay: 0 },
  { label: "Science", x: "58%", y: "8%", delay: 0.4 },
  { label: "Physics", x: "72%", y: "38%", delay: 0.8 },
  { label: "Chemistry", x: "8%", y: "48%", delay: 1.1 },
  { label: "Biology", x: "64%", y: "62%", delay: 0.2 },
  { label: "English", x: "28%", y: "72%", delay: 0.6 },
  { label: "GSEB", x: "42%", y: "22%", delay: 1.3 },
  { label: "CBSE", x: "18%", y: "32%", delay: 0.9 },
];

export function FloatingChips() {
  const reduce = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {chips.map((chip) => (
        <motion.span
          key={chip.label}
          className="absolute rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_12px_30px_-16px_rgba(0,0,0,0.55)] backdrop-blur-md"
          style={{ left: chip.x, top: chip.y }}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={
            reduce
              ? { opacity: 1 }
              : {
                  opacity: [0.55, 1, 0.55],
                  y: [0, -10, 0],
                }
          }
          transition={{ duration: 5.4, delay: chip.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {chip.label}
        </motion.span>
      ))}
    </div>
  );
}
