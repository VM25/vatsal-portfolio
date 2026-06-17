"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Scene = dynamic(
  () => import("./SpatialFieldScene").then((m) => m.SpatialFieldScene),
  { ssr: false },
);

/**
 * Mounts the 3D market-depth lattice only where it helps: desktop, motion
 * allowed, WebGL available. Otherwise renders nothing and the CSS backdrop
 * carries the environment. Client-only, so it never affects SSR / hydration.
 */
export function SpatialField({ className }: { className?: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 900;
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client capability read on mount
    setOn(!reduce && !small && webgl);
  }, []);

  if (!on) return null;
  return (
    <div className={className} style={{ opacity: 0.5 }}>
      <Scene className="h-full w-full" />
    </div>
  );
}
