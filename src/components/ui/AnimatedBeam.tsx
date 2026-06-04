"use client";

import { useEffect, useId, useState, type RefObject } from "react";
import { motion } from "framer-motion";

// Magic UI — AnimatedBeam (adapted to this design system; no shadcn dependency).
// https://magicui.design/docs/components/animated-beam
interface AnimatedBeamProps {
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 4,
  delay = 0,
  pathColor = "#2a231d",
  pathWidth = 1.5,
  pathOpacity = 0.5,
  gradientStartColor = "#e8a23d",
  gradientStopColor = "#c2410c",
}: AnimatedBeamProps) {
  const id = useId();
  const gradId = `beam-${id.replace(/:/g, "")}`;
  const [d, setD] = useState("");
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => {
      const c = containerRef.current;
      const a = fromRef.current;
      const b = toRef.current;
      if (!c || !a || !b) return;
      const cr = c.getBoundingClientRect();
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      setBox({ w: cr.width, h: cr.height });
      const sx = ar.left - cr.left + ar.width / 2;
      const sy = ar.top - cr.top + ar.height / 2;
      const ex = br.left - cr.left + br.width / 2;
      const ey = br.top - cr.top + br.height / 2;
      const mx = (sx + ex) / 2 + curvature;
      const my = (sy + ey) / 2;
      setD(`M ${sx},${sy} Q ${mx},${my} ${ex},${ey}`);
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", update);
    const t = window.setTimeout(update, 400);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.clearTimeout(t);
    };
  }, [containerRef, fromRef, toRef, curvature]);

  return (
    <svg
      fill="none"
      width={box.w}
      height={box.h}
      className="pointer-events-none absolute left-0 top-0"
      style={{ width: box.w, height: box.h }}
      aria-hidden
    >
      <path d={d} stroke={pathColor} strokeWidth={pathWidth} strokeOpacity={pathOpacity} strokeLinecap="round" />
      <path d={d} stroke={`url(#${gradId})`} strokeWidth={pathWidth} strokeLinecap="round" />
      <defs>
        <motion.linearGradient
          id={gradId}
          initial={{ x1: "0%", x2: "10%", y1: "0%", y2: "0%" }}
          animate={{
            x1: reverse ? ["110%", "-10%"] : ["-10%", "110%"],
            x2: reverse ? ["120%", "0%"] : ["0%", "120%"],
          }}
          transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
}
