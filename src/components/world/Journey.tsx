"use client";

import { useCallback, useEffect, useState } from "react";
import { Stage } from "./Stage";
import { Hud } from "@/components/ui/Hud";
import { WORLDS } from "@/lib/palette";
import {
  Approach,
  Origin,
  Foundation,
  Work,
  Question,
  Arrival,
} from "@/components/chapters/Chapters";

/**
 * Ties the world to the reading. The chapter you are in sets `--here`, so the
 * accent colour of the interface travels with the camera.
 */
export function Journey() {
  const [world, setWorld] = useState(0);
  const [progress, setProgress] = useState(0);

  const onWorld = useCallback((i: number) => {
    setWorld(Math.min(WORLDS.length - 1, Math.max(0, i)));
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--here", WORLDS[world].accent);
  }, [world]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max =
          document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? window.scrollY / max : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <Stage onWorld={onWorld} />
      <Hud world={world} progress={progress} />
      <main className="relative z-10">
        <Approach />
        <Origin />
        <Foundation />
        <Work />
        <Question />
        <Arrival />
      </main>
    </>
  );
}
