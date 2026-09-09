"use client";

import { motion } from "framer-motion";
import React from "react";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: AnimatedSectionProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case "down":
        return { y: -100, opacity: 0 };
      case "left":
        return { x: -100, opacity: 0 };
      case "right":
        return { x: 100, opacity: 0 };
      default:
        return { y: 100, opacity: 0 };
    }
  };

  const getAnimatePosition = () => {
    switch (direction) {
      case "down":
        return { y: 0, opacity: 1 };
      case "left":
        return { x: 0, opacity: 1 };
      case "right":
        return { x: 0, opacity: 1 };
      default:
        return { y: 0, opacity: 1 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={getAnimatePosition()}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        delay,
        duration: 0.7,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
