"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useScroll, useMotionValue } from "framer-motion";
import { useStore } from "@/store/useStore";
import type { SceneId } from "@/lib/scenes";
import { useCinematic } from "@/hooks/useCinematic";
import { ChapterProgressProvider } from "@/components/experience/chapter-context";

/**
 * A pinned cinematic chapter. The outer <section> is tall; an inner stage is
 * `position: sticky` so it locks to the viewport while the section scrolls
 * past. The section's internal scroll progress (0→1) is handed to the scene as
 * a MotionValue, which drives camera-like depth, panel assembly, instrument
 * draw-on and text reveal — IN PLACE. Vertical wheel, never a horizontal strip.
 *
 * On narrow viewports or under reduced motion it degrades to a normal,
 * fully-readable stacked section (progress pinned at 1 = assembled state).
 */
export function Chapter({
  id,
  pin = 1.6,
  children,
}: {
  id: SceneId;
  /** Extra screens of scroll room. Section height = (1 + pin) × 100vh. */
  pin?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const cinematic = useCinematic();
  const setActiveScene = useStore((s) => s.setActiveScene);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const settled = useMotionValue(1);

  // Active chapter = the section crossing the viewport's center line.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveScene(id);
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [id, setActiveScene]);

  if (!cinematic) {
    return (
      <section
        id={id}
        ref={ref}
        data-scene={id}
        className="relative flex min-h-screen w-full flex-col justify-center py-24"
      >
        <ChapterProgressProvider value={settled}>
          {children}
        </ChapterProgressProvider>
      </section>
    );
  }

  return (
    <section
      id={id}
      ref={ref}
      data-scene={id}
      className="relative"
      style={{ height: `${(1 + pin) * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <ChapterProgressProvider value={scrollYProgress}>
          {children}
        </ChapterProgressProvider>
      </div>
    </section>
  );
}
