"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useStore } from "@/store/useStore";

/**
 * Premium smooth wheel/trackpad scrolling via Lenis, driving the real document
 * scroll (so CSS `position: sticky` pinning and Framer Motion `useScroll` both
 * read it natively). Under reduced motion Lenis is skipped — native scroll, no
 * scrubbed choreography. No GSAP: pinning is CSS sticky, not ScrollTrigger.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    useStore.getState().setReducedMotion(prefersReduced);
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onAnchorClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.2 });
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      cancelAnimationFrame(raf);
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
      lenis.destroy();
    };
  }, [prefersReduced]);

  return <>{children}</>;
}
