"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * True only when the cinematic pinned-chapter experience should run: a wide
 * viewport with motion allowed. Otherwise chapters fall back to an accessible
 * vertical stack (mobile + reduced-motion). SSR-safe: starts false, upgrades
 * after mount to avoid hydration mismatch and tall sections on phones.
 */
export function useCinematic(): boolean {
  const reduced = usePrefersReducedMotion();
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return wide && !reduced;
}
