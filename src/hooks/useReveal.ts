"use client";

import { useEffect } from "react";

/**
 * One observer for the whole page. Each element marked `data-r` gets `.in` once
 * and is then dropped from the watch list, so nothing runs while scrolling.
 * The motion itself is CSS — opacity, translate, blur — which is why it behaves
 * the same in every browser.
 */
export function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-r]");
    if (nodes.length === 0) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still || typeof IntersectionObserver === "undefined") {
      nodes.forEach((n) => n.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
}
