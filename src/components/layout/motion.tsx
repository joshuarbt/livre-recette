"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { AnimatePresence, motion as motionLib } from "framer-motion";
import { fadeThrough, motionTransition } from "@/lib/motion";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={motionTransition(reduced, delay)}
    >
      {children}
    </motion.div>
  );
}

type CrossfadeProps = {
  children: ReactNode;
  contentKey: string;
  className?: string;
};

export function Crossfade({ children, contentKey, className }: CrossfadeProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <AnimatePresence mode="wait">
      <motionLib.div
        key={contentKey}
        className={className}
        initial={reduced ? false : "hidden"}
        animate={reduced ? undefined : "visible"}
        exit={reduced ? undefined : "exit"}
        variants={reduced ? undefined : fadeThrough}
        transition={motionTransition(reduced)}
      >
        {children}
      </motionLib.div>
    </AnimatePresence>
  );
}
