"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { CHAPTERS, KEYS, keysFromLayout, type Chapter } from "@/lib/scene";

/*
  Scroll state for the whole page: progress p (0 at the top, 1 at the bottom),
  the active chapter, the chapter key positions measured from the live layout,
  and the OS reduced-motion setting. Progress and keys live only in the scene bus
  (read every frame by World), so scrolling never re-renders React; only a change
  of chapter does (useChapter, for aria-current).

  Scroll changes the scene only: no class, colour or text in the page follows p.
  <html> carries .rm and data-beats (the count of requestBeat calls).
*/

/** The two scene actions exhibits can take. */
export type SceneActions = {
  requestBeat(): void;
  setRush(v: number): void;
};

/** Mutable values the scene reads every frame without re-rendering React. */
export type SceneBus = {
  p: number;
  keys: number[];
  rush: number;
  flash: number;
  gust: number;
  dirty: boolean;
  reducedMotion: boolean;
};

/** What World gets: read the values, and the two writes a frame needs. */
export type SceneBusApi = {
  read(): Readonly<SceneBus>;
  markDirty(): void;
  /** Once per drawn frame: fade the flash and gust a step, clear dirty. */
  frameDone(): void;
};

const ActionsCtx = createContext<SceneActions | null>(null);
const BusCtx = createContext<SceneBusApi | null>(null);
const ChapterCtx = createContext<Chapter | null>(null);

const RM_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeRM(cb: () => void) {
  const mq = window.matchMedia(RM_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getRM = () => window.matchMedia(RM_QUERY).matches;
const getRMServer = () => false;

function progress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}

/**
 * Key positions come from where each chapter actually sits on the page: the scroll
 * progress at which its anchor lands (keysFromLayout in scene.ts), so a nav or menu
 * jump lands exactly on the chapter's own shot.
 */
function measureKeys(prev: number[]): number[] {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const tops: number[] = [];
  for (const id of CHAPTERS) {
    const s = document.querySelector<HTMLElement>(`[data-sec="${id}"]`);
    if (!s) return prev;
    tops.push(s.getBoundingClientRect().top + window.scrollY);
  }
  return keysFromLayout(tops, pad, max) ?? prev;
}

/** The hash's element id, or "" when there is none or it is malformed (/#%). */
function hashId(): string {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return "";
  }
}

function sameKeys(a: number[], b: number[]) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export function ScrollStateProvider({ children }: { children: ReactNode }) {
  const [chapter, setChapter] = useState<Chapter>("home");
  const reducedMotion = useSyncExternalStore(subscribeRM, getRM, getRMServer);

  const bus = useRef<SceneBus>({
    p: 0,
    keys: KEYS,
    rush: 0,
    flash: 0,
    gust: 0,
    dirty: true,
    reducedMotion: false,
  });
  const beats = useRef(0);

  // Reduced motion: a class for CSS, a flag for the scene.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("rm", reducedMotion);
    bus.current.reducedMotion = reducedMotion;
    bus.current.dirty = true;
    if (reducedMotion) {
      bus.current.flash = 0;
      bus.current.gust = 0;
    }
  }, [reducedMotion]);

  // Scroll and measurement.
  useEffect(() => {
    document.documentElement.setAttribute("data-beats", String(beats.current));

    const onScroll = () => {
      bus.current.p = progress();
      bus.current.dirty = true;
    };

    const measure = () => {
      const ks = measureKeys(bus.current.keys);
      if (!sameKeys(ks, bus.current.keys)) {
        bus.current.keys = ks;
        bus.current.dirty = true;
      }
    };

    const refresh = () => {
      measure();
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", refresh);
    window.addEventListener("load", refresh);
    // Content below can change height (fonts, exhibits opening); keys follow it.
    const ro = new ResizeObserver(refresh);
    ro.observe(document.body);
    let live = true;
    document.fonts?.ready.then(() => {
      if (live) refresh();
    });
    refresh();

    return () => {
      live = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("load", refresh);
      ro.disconnect();
    };
  }, []);

  /*
    The app has hydrated: mark <html> so the head script's five-second fallback (which
    drops .js when the bundle never arrives) stands down, and put .js back in case a
    slow bundle arrived after that fallback had already expanded the page.
  */
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-hydrated", "");
    root.classList.add("js");
  }, []);

  /*
    Deep links (/#research): the browser jumps to the anchor while the page is still
    settling (fonts swapping in, exhibits sizing). Once fonts are ready and the page has
    loaded, put the target back at the top once, unless the reader has already moved.
    Only on a fresh navigation (a reload or back/forward restores its own position) and
    only when the browser did jump: the target is within a viewport of its anchor
    position at mount.
  */
  useEffect(() => {
    const id = hashId();
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type !== "navigate") return;
    const padAt = () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    if (Math.abs(target.getBoundingClientRect().top - padAt()) > window.innerHeight) return;
    let moved = false;
    let live = true;
    const intents = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    const mark = () => {
      moved = true;
    };
    intents.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    const loaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true }));
    Promise.all([document.fonts?.ready ?? Promise.resolve(), loaded]).then(() => {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!live || moved) return;
          if (Math.abs(target.getBoundingClientRect().top - padAt()) > 2) {
            target.scrollIntoView({ block: "start", behavior: "instant" });
          }
        }),
      );
    });
    return () => {
      live = false;
      intents.forEach((e) => window.removeEventListener(e, mark));
    };
  }, []);

  /*
    Active chapter: the one crossing the band just above the middle of the viewport.
    While a boundary between two chapters is inside the band both intersect, and a fast
    jump can carry the page past that point between two observations, so the choice is
    made from the whole set of chapters in the band: the one holding the band's middle
    line, else the last of them in page order.
  */
  useEffect(() => {
    let current: Chapter = "home";
    const inBand = new Set<Chapter>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const id = (e.target as HTMLElement).dataset.sec as Chapter;
          if (e.isIntersecting) inBand.add(id);
          else inBand.delete(id);
        });
        const mid = window.innerHeight * 0.475;
        let next: Chapter | null = null;
        for (const id of CHAPTERS) {
          if (!inBand.has(id)) continue;
          next = id;
          const r = document.querySelector(`[data-sec="${id}"]`)?.getBoundingClientRect();
          if (r && r.top <= mid && r.bottom > mid) break;
        }
        if (!next || next === current) return;
        current = next;
        if (!bus.current.reducedMotion) bus.current.gust = 1;
        setChapter(next);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    document.querySelectorAll("[data-sec]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const requestBeat = useCallback(() => {
    beats.current += 1;
    document.documentElement.setAttribute("data-beats", String(beats.current));
    if (!bus.current.reducedMotion) bus.current.flash = 1;
  }, []);

  const setRush = useCallback((v: number) => {
    bus.current.rush = Math.max(0, Math.min(1, v));
    bus.current.dirty = true;
  }, []);

  const actions = useMemo(() => ({ requestBeat, setRush }), [requestBeat, setRush]);
  const api = useMemo<SceneBusApi>(
    () => ({
      read: () => bus.current,
      markDirty: () => {
        bus.current.dirty = true;
      },
      frameDone: () => {
        const b = bus.current;
        b.flash = Math.max(0, b.flash - 0.012);
        b.gust = Math.max(0, b.gust - 0.02);
        b.dirty = false;
      },
    }),
    [],
  );

  return (
    <BusCtx.Provider value={api}>
      <ActionsCtx.Provider value={actions}>
        <ChapterCtx.Provider value={chapter}>
          {children}
        </ChapterCtx.Provider>
      </ActionsCtx.Provider>
    </BusCtx.Provider>
  );
}

/**
 * Only the active chapter. A string, so a consumer re-renders when the chapter
 * changes and not on every scroll (the top bar uses this for aria-current).
 */
export function useChapter(): Chapter {
  const chapter = useContext(ChapterCtx);
  if (!chapter) throw new Error("useChapter must be used inside <ScrollStateProvider>");
  return chapter;
}

/**
 * Only the actions. Stable for the page's lifetime, so exhibits that need to
 * fire a beat or set the rush don't re-render on every scroll.
 */
export function useSceneActions(): SceneActions {
  const actions = useContext(ActionsCtx);
  if (!actions) throw new Error("useSceneActions must be used inside <ScrollStateProvider>");
  return actions;
}

/** For World only: the per-frame values, read without re-rendering. */
export function useSceneBus(): SceneBusApi {
  const bus = useContext(BusCtx);
  if (!bus) throw new Error("useSceneBus must be used inside <ScrollStateProvider>");
  return bus;
}
