"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * A narrative waypoint between sections: a continuous vertical spine with a
 * concise transition phrase, so the page reads as one systems → markets journey.
 * The spine stretches and the label drifts as it passes through the viewport,
 * giving a felt spatial "pull" from one section into the next.
 */
export function Connector({ label }: { label: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const spring = { stiffness: 70, damping: 26, mass: 0.5 };
  const labelY = useSpring(useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 26, reduce ? 0 : -26]), spring);
  const lineScale = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1.15, 0.5]), spring);

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative z-10 mx-auto flex w-full max-w-[1240px] justify-center px-4 py-2 sm:px-7"
    >
      <div className="flex flex-col items-center gap-2.5 text-center">
        <motion.span
          style={{ scaleY: reduce ? 1 : lineScale }}
          className="block h-9 w-px origin-bottom bg-gradient-to-b from-transparent to-accent/60"
        />
        <motion.span
          style={{ y: labelY }}
          className="font-mono text-[0.56rem] uppercase tracking-[0.26em] text-ink-3"
        >
          {label}
        </motion.span>
        <motion.span
          style={{ scaleY: reduce ? 1 : lineScale }}
          className="block h-9 w-px origin-top bg-gradient-to-b from-accent/60 to-transparent"
        />
      </div>
    </div>
  );
}
