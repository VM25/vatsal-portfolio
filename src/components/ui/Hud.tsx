"use client";

import { WORLDS } from "@/lib/palette";

/**
 * A travel readout, not navigation furniture: where you are on the route and
 * how far along it. It never covers the world.
 */
export function Hud({ world, progress }: { world: number; progress: number }) {
  return (
    <>
      <div className="hud left-0 right-0 top-0 px-[var(--gutter)] pt-5">
        <div className="flex items-baseline justify-between gap-6">
          <span className="text-praxeti">Vatsal Maniar</span>
          <span className="hidden sm:block">
            {String(world + 1).padStart(2, "0")} / {String(WORLDS.length).padStart(2, "0")}
            <span className="ml-3 text-praxeti">{WORLDS[world].name}</span>
          </span>
        </div>
        <div className="hud-bar mt-4">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>

      <a
        href="#arrival"
        className="hud pointer-events-auto bottom-6 right-[var(--gutter)] hidden text-creamy transition-colors hover:text-saffron md:block"
      >
        Contact ↓
      </a>
    </>
  );
}
