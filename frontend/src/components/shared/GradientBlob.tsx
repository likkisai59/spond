"use client";

import { motion } from "framer-motion";

interface GradientBlobProps {
  className?: string;
  colors?: string[];
  intensity?: "low" | "medium" | "high";
}

export function GradientBlob({
  className = "",
  colors = ["#7c3aed", "#06b6d4"],
  intensity = "medium",
}: GradientBlobProps) {
  const intensitySettings = {
    low: {
      scale: [1, 1.1, 1],
      rotate: [0, 180, 360],
    },
    medium: {
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
    },
    high: {
      scale: [1, 1.3, 1],
      rotate: [0, 360, 720],
    },
  };

  const gradient = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;

  return (
    <motion.div
      animate={intensitySettings[intensity]}
      transition={{
        duration: 15,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
      }}
      className={`absolute rounded-full blur-3xl opacity-20 mix-blend-screen pointer-events-none ${className}`}
      style={{
        background: gradient,
      }}
    />
  );
}
