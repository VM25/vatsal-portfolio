"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Scene = dynamic(() => import("./HeroCoreScene").then((m) => m.HeroCoreScene), {
  ssr: false,
  loading: () => <CoreFallback />,
});

// Deterministic static instrument core for SSR, mobile, reduced-motion, or
// no-WebGL. Same engineered object as the 3D version, drawn flat.
const C = 160;
const TICKS = Array.from({ length: 56 }, (_, i) => {
  const a = (i / 56) * Math.PI * 2;
  const long = i % 7 === 0;
  const r0 = 142;
  const r1 = r0 + (long ? 9 : 5);
  return `M ${(C + Math.cos(a) * r0).toFixed(1)},${(C + Math.sin(a) * r0).toFixed(1)} L ${(C + Math.cos(a) * r1).toFixed(1)},${(C + Math.sin(a) * r1).toFixed(1)}`;
}).join(" ");
const OCT = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 - Math.PI / 8;
  return `${(C + Math.cos(a) * 66).toFixed(1)},${(C + Math.sin(a) * 66).toFixed(1)}`;
}).join(" ");
const MODS = Array.from({ length: 4 }, (_, i) => {
  const a = (i / 4) * Math.PI * 2 - Math.PI / 4;
  return { x: C + Math.cos(a) * 116, y: C + Math.sin(a) * 116 };
});
const HUES = ["--p-apexgp", "--p-rates", "--p-portfolio", "--p-fx"];

function CoreFallback() {
  return (
    <svg viewBox="-28 -28 376 376" className="h-full w-full" fill="none" aria-hidden>
      <path d={TICKS} stroke="var(--ink)" strokeOpacity="0.26" strokeWidth="1" />
      <ellipse cx={C} cy={C} rx="118" ry="42" stroke="var(--ink)" strokeOpacity="0.4" strokeWidth="1.2" />
      <ellipse cx={C} cy={C} rx="46" ry="124" stroke="var(--accent)" strokeOpacity="0.42" strokeWidth="1.2" />
      <polygon points={OCT} fill="color-mix(in oklab, var(--cosmos) 45%, transparent)" stroke="var(--accent)" strokeWidth="1.4" />
      <polygon
        points={`${C},${C - 26} ${C + 24},${C} ${C},${C + 26} ${C - 24},${C}`}
        stroke="var(--p-fx)"
        strokeWidth="1.3"
        fill="none"
      />
      {MODS.map((m, i) => (
        <rect
          key={i}
          x={m.x - 9}
          y={m.y - 9}
          width="18"
          height="18"
          stroke={`var(${HUES[i]})`}
          strokeWidth="1.4"
          fill="none"
          transform={`rotate(45 ${m.x} ${m.y})`}
        />
      ))}
    </svg>
  );
}

export function HeroCore({ className }: { className?: string }) {
  const [use3d, setUse3d] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client capability read on mount
    setUse3d(!reduce && !small && webgl);
  }, []);

  return (
    <div className={className}>
      {use3d ? <Scene className="h-full w-full" /> : <CoreFallback />}
    </div>
  );
}
