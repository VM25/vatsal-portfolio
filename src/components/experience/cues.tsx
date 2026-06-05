"use client";

import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";

/**
 * Staggered content reveal. Fires once when the chapter enters view (so a pinned
 * scene is fully readable the moment it's centered — never an empty stage), with
 * `at` as the stagger delay. The cinematic, scroll-scrubbed layer (instrument
 * draw-on, the Origin beam, Capability edges, parallax) is driven separately by
 * the chapter's progress MotionValue. Animates transform/opacity only.
 *
 * `progress`/`span` are accepted for call-site compatibility but unused here.
 */
export function Cue({
  at = 0,
  y = 22,
  x = 0,
  className,
  children,
}: {
  progress?: MotionValue<number>;
  at?: number;
  span?: number;
  y?: number;
  x?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{
        duration: reduce ? 0 : 0.6,
        delay: reduce ? 0 : at,
        ease: [0.22, 0.61, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Camera-like depth drift — translates/scales content gently across the chapter's
 * scroll progress, the "dolly" that makes a pinned scene feel spatial.
 */
export function Depth({
  progress,
  fromY = 0,
  toY = 0,
  fromScale = 1,
  toScale = 1,
  className,
  children,
}: {
  progress: MotionValue<number>;
  fromY?: number;
  toY?: number;
  fromScale?: number;
  toScale?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const y = useTransform(progress, [0, 1], [fromY, toY]);
  const scale = useTransform(progress, [0, 1], [fromScale, toScale]);
  return (
    <motion.div style={{ y, scale }} className={className}>
      {children}
    </motion.div>
  );
}
