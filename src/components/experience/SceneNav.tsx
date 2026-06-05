"use client";

import { useStore } from "@/store/useStore";
import { SCENES } from "@/lib/scenes";
import { cn } from "@/lib/utils";

/**
 * A quiet right-edge scrubber. Sits in the margin, reads as a progress index,
 * and only names a chapter on hover/focus — present without competing with
 * content. Clicking jumps (Lenis smooth-scrolls the anchor). Wide screens only.
 */
export function SceneNav() {
  const active = useStore((s) => s.activeScene);

  return (
    <nav
      aria-label="Chapters"
      className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3.5 lg:flex"
    >
      {SCENES.map((s) => {
        const on = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={on ? "true" : undefined}
            aria-label={s.label}
            className="group flex items-center gap-2.5 py-0.5"
          >
            <span
              className={cn(
                "font-mono text-[0.58rem] uppercase tracking-[0.16em] opacity-0 transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
                on ? "text-brass" : "text-ink-dim",
              )}
            >
              {s.label}
            </span>
            <span
              className={cn(
                "h-px rounded-full transition-all duration-300",
                on
                  ? "w-7 bg-brass"
                  : "w-3.5 bg-ink-faint/40 group-hover:w-5 group-hover:bg-ink-dim",
              )}
            />
          </a>
        );
      })}
    </nav>
  );
}
