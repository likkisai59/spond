"use client";

import { motion } from "framer-motion";
import React from "react";

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  variant?: "default" | "hover" | "float";
}

export function AnimatedCard({
  children,
  delay = 0,
  className = "",
  variant = "default",
}: AnimatedCardProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay,
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const hoverVariant = {
    initial: { y: 0, rotateX: 0, rotateY: 0 },
    hover: {
      y: -10,
      rotateX: 5,
      rotateY: 5,
      transition: { duration: 0.4, type: "spring" },
    },
  };

  return (
    <motion.div
      initial={variant === "float" ? { y: -10 } : "hidden"}
      animate={variant === "float" ? "visible" : "visible"}
      whileHover={variant === "hover" ? "hover" : undefined}
      variants={
        (variant === "float"
          ? { visible: { y: 10, transition: { repeat: Infinity, duration: 3 } } }
          : containerVariants) as any
      }
      className={`${className}`}
      style={
        variant === "default"
          ? {
              perspective: "1000px",
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
