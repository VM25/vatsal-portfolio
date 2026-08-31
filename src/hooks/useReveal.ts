"use client";

import { useEffect } from "react";

/**
 * One IntersectionObserver for the entire page.
 *
 * Every element carrying `data-reveal` is observed once, gets `.is-in` when it
 * crosses into view, and is then unobserved — so the cost is a single observer
 * and one class flip per element for the life of the page. All the actual
 * animation is CSS (transform / opacity / clip-path only), which is what keeps
 * Safari and Chrome identical: no scroll listener, no rAF loop, no pinning.
 *
 * Anything already in view on load reveals on the first callback, so the fold
 * is never left blank.
 */
export function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (nodes.length === 0) return;

    // No observer (or motion turned off): show everything and stop.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      // Fire a little before the element's top edge lands, so the reveal reads
      // as the page settling rather than as a delayed pop.
      { rootMargin: "0px 0px -10% 0px", threshold: 0 },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);
}
