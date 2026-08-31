"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import scrollama from "scrollama";
import { createJourney, worldAt, type Journey } from "./scene";
import { WORLDS } from "@/lib/palette";

/**
 * Holds the canvas and translates scrolling into camera travel.
 *
 * Camera progress comes straight from the scroll offset, throttled to a frame.
 * GSAP handles per-chapter parallax, and scrollama marks which chapter you have
 * arrived in — the discrete signal the readout and chapter styling react to.
 */
export function Stage({
  onWorld,
}: {
  onWorld?: (index: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const journeyRef = useRef<Journey | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let journey: Journey;
    try {
      journey = createJourney(canvas, "/images/vatsal-maniar.jpg", { still });
    } catch (err) {
      // No WebGL, or the context could not be acquired. The page still reads
      // without the world, but swallowing this silently hides real failures —
      // so say so, and leave the canvas transparent rather than half-alive.
      console.error("[world] could not start:", err);
      return;
    }
    journeyRef.current = journey;
    // Fading the canvas in is a DOM update, not application state — routing it
    // through React only buys a cascading render.
    canvas.style.opacity = "1";

    gsap.registerPlugin(ScrollTrigger);

    /*
      Camera progress is read straight off the scroll offset, throttled to one
      frame. A whole-document ScrollTrigger measures body top-to-bottom before
      the chapters have settled their height, which pins progress at zero — this
      is both simpler and always correct.
    */
    let ticking = 0;
    let lastWorld = -1;
    const readScroll = () => {
      cancelAnimationFrame(ticking);
      ticking = requestAnimationFrame(() => {
        const max =
          document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        journey.setProgress(p);
        const w = worldAt(p);
        if (w !== lastWorld) {
          lastWorld = w;
          onWorld?.(w);
        }
      });
    };
    readScroll();
    window.addEventListener("scroll", readScroll, { passive: true });

    /*
      GSAP does the per-chapter work: each chapter's content is nudged as it
      passes through the frame, which gives the reading a little of the camera's
      momentum instead of sitting flat on top of it.
    */
    const ctx = gsap.context(() => {
      document.querySelectorAll("[data-chapter] .wrap").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 40 },
          {
            y: -40,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("[data-chapter]") as Element,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
      });
    });

    /*
      Scrollama marks which chapter you have actually arrived in. That drives
      `data-here`, which chapter styling hangs off.
    */
    const scroller = scrollama();
    scroller
      .setup({ step: "[data-chapter]", offset: 0.6 })
      .onStepEnter(({ element }) => {
        document
          .querySelectorAll("[data-chapter]")
          .forEach((n) => n.removeAttribute("data-here"));
        element.setAttribute("data-here", "");
      });

    const onResize = () => {
      journey.resize();
      scroller.resize();
      readScroll();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    // Pointer parallax, normalised to −1..1. Skipped when motion is reduced.
    const onPointer = (e: PointerEvent) => {
      if (still) return;
      journey.setPointer(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      );
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", readScroll);
      cancelAnimationFrame(ticking);
      ctx.revert();
      scroller.destroy();
      journey.dispose();
      journeyRef.current = null;
    };
  }, [onWorld]);

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ opacity: 0, transition: "opacity 900ms ease-out" }}
      />
      {/*
        Two scrims. The vignette keeps the edges of the frame from going pale,
        and the left wash sits under the column the text actually occupies —
        without it, reading over a lit structure is genuinely hard.
      */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(2,2,2,0.5)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(2,2,2,0.72)_0%,rgba(2,2,2,0.46)_34%,rgba(2,2,2,0.06)_58%,transparent_74%)]" />
    </div>
  );
}

export { WORLDS, worldAt };
