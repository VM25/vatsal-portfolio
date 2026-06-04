"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useStore } from "@/store/useStore";

/**
 * Maps scroll progress to the camera `journey` (0→1) via a scrubbed
 * ScrollTrigger. As the visitor scrolls, the camera flies through the 3D scene
 * stations — scroll advances the scene rather than revealing a flat stack.
 * (DOM pinning was intentionally avoided: combined with Lenis it destabilized
 * scroll positions and anchor navigation.)
 */
export function JourneyController() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const setJourney = useStore.getState().setJourney;

    const master = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onUpdate: (self) => setJourney(self.progress),
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const ti = window.setTimeout(refresh, 800);

    return () => {
      master.kill();
      window.removeEventListener("load", refresh);
      window.clearTimeout(ti);
    };
  }, []);

  return null;
}
