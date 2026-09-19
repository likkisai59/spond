"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface FloatingOrbProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  duration?: number;
  x?: number;
  y?: number;
  delay?: number;
  className?: string;
}

export function FloatingOrb({
  size = "md",
  color = "#7c3aed",
  duration = 6,
  x = 0,
  y = 0,
  delay = 0,
  className = "",
}: FloatingOrbProps) {
  const orb = useRef<HTMLDivElement>(null);

  const sizeMap = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-48 h-48",
  };

  useEffect(() => {
    if (!orb.current) return;

    const particles: HTMLDivElement[] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const element = document.createElement("div");
      element.className = "absolute rounded-full";
      element.style.cssText = `
        width: 4px;
        height: 4px;
        background: ${color};
        opacity: 0.6;
        left: ${50 + 45 * Math.cos(angle)}%;
        top: ${50 + 45 * Math.sin(angle)}%;
        transform: translate(-50%, -50%);
        animation: orbit ${duration}s linear infinite;
        animation-delay: ${i * (duration / 12)}s;
      `;
      orb.current.appendChild(element);
      particles.push(element);
    }

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, [duration, color]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.8 }}
      className={`absolute pointer-events-none ${sizeMap[size]} ${className}`}
      style={{ x, y }}
    >
      <style>{`
        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(45%) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(45%) rotate(-360deg);
          }
        }
      `}</style>

      {/* Core orb */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-40"
        style={{ background: color }}
      />
      <div
        className="absolute inset-6 rounded-full blur-lg opacity-30"
        style={{ background: color }}
      />

      {/* Orbiting particles container */}
      <div
        ref={orb}
        className="absolute inset-0"
        style={{
          perspective: "1000px",
        }}
      />

      {/* Rotating ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: duration * 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-2 rounded-full border border-transparent pointer-events-none"
        style={{
          borderTopColor: color,
          borderRightColor: `${color}80`,
          opacity: 0.5,
        }}
      />
    </motion.div>
  );
}
