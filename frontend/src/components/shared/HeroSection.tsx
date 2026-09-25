"use client";

import { motion, Variants } from "framer-motion";
import { Sparkles } from "lucide-react";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: React.ReactNode;
}

export function HeroSection({ title, subtitle, badge, children }: HeroSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center justify-center text-center"
    >
      {/* Badge */}
      {badge && (
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-primary text-sm font-semibold mb-6 hover:bg-primary/20 transition-all"
        >
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>{badge}</span>
        </motion.div>
      )}

      {/* Title */}
      <motion.h1
        variants={itemVariants}
        className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none text-balance"
      >
        {title.split("<span>").map((part, i) => {
          if (i === 0) return <span key={i}>{part}</span>;
          const [colored, rest] = part.split("</span>");
          return (
            <span key={i}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end animate-gradient-shift">
                {colored}
              </span>
              {rest}
            </span>
          );
        })}
      </motion.h1>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-10 leading-relaxed text-balance"
        >
          {subtitle}
        </motion.p>
      )}

      {/* CTA Buttons */}
      {children && (
        <motion.div variants={itemVariants} className="w-full">
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
