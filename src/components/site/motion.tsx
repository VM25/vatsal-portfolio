"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 0.61, 0.36, 1] as const;

/**
 * Reveal on scroll - CSS scroll-driven (see `.reveal` in globals.css), so the
 * entrance is driven by scroll position rather than a JS animation loop and the
 * content is never left hidden if rAF is throttled. Framer Motion is used for
 * the richer motion elsewhere (parallax, presence swaps, instrument draw-ons).
 */
export function Reveal({
  children,
  className,
  delay,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <div className={cn("reveal", className)} style={delay ? { animationDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  );
}

/**
 * Parallax z-layer. Translates its content as the element passes through the
 * viewport, giving depth without scroll listeners. `depth` is in px of travel;
 * positive = moves up faster (foreground), negative = lags (background).
 */
export function Parallax({
  children,
  className,
  depth = 60,
}: {
  children: ReactNode;
  className?: string;
  depth?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const raw = useTransform(scrollYProgress, [0, 1], [depth, -depth]);
  const y = useSpring(raw, { stiffness: 80, damping: 24, mass: 0.4 });

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

/** Staggered container + item for sequenced reveals. */
export function Stagger({
  children,
  className,
  gap = 0.08,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      variants={{ show: { transition: { staggerChildren: reduce ? 0 : gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 22,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** A pressable/hoverable motion wrapper for cards (subtle lift + tilt-free). */
export function MotionCard({
  children,
  className,
  onClick,
  active,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn(className)}
      onClick={onClick}
      whileHover={reduce ? undefined : { y: -4 }}
      whileTap={reduce ? undefined : { scale: 0.99 }}
      animate={active ? { scale: 1 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}
