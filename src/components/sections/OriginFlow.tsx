"use client";

import { useRef } from "react";
import { AnimatedBeam } from "@/components/ui/AnimatedBeam";

const NODES = [
  { id: "cs", label: "Computer Science", sub: "Arizona State · foundation" },
  { id: "fe", label: "Financial Engineering", sub: "Stevens · specialization" },
  { id: "quant", label: "Quant Finance", sub: "trading · research · risk" },
];

/** A connected CS → FE → Quant progression, linked with Magic UI beams. */
export function OriginFlow() {
  const container = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const c = useRef<HTMLDivElement>(null);
  const refs = [a, b, c];

  return (
    <div ref={container} className="relative flex flex-col gap-6">
      <AnimatedBeam containerRef={container} fromRef={a} toRef={b} duration={3.5} />
      <AnimatedBeam containerRef={container} fromRef={b} toRef={c} duration={3.5} delay={0.9} />
      {NODES.map((n, i) => (
        <div
          key={n.id}
          ref={refs[i]}
          className="panel relative z-10 rounded-xl p-5"
        >
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-amber">
            {String(i + 1).padStart(2, "0")}
          </div>
          <div className="font-display mt-1 text-xl leading-tight text-ink">
            {n.label}
          </div>
          <div className="mt-0.5 text-sm text-ink-faint">{n.sub}</div>
        </div>
      ))}
    </div>
  );
}
