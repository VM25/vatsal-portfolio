"use client";

import { useEffect, useRef } from "react";
import { sceneState, type Uniforms } from "@/lib/scene";
import { FRAGMENT_SRC, UNIFORMS, VERTEX_SRC } from "./shader";
import { useSceneBus } from "./ScrollState";

/*
  The world behind the page: one full-screen fragment shader driven by scroll,
  or the stills when the shader can't run. The stills are the default in the
  markup, so the page is never blank: before the first frame, without
  JavaScript, and after any fallback trigger.

  Fallback triggers: no WebGL, a shader that fails to compile or link, a lost
  context, or a GPU too slow for the scene. "Too slow" is measured as GPU work,
  not frame spacing: every fifth drawn frame is timed through draw plus a 1×1
  readPixels sync, and if the median of those samples over a 3 s window is
  above 50 ms (with at least 5 samples), the scene drops to the stills.
  Throttled requestAnimationFrame (Low Power Mode, occluded windows, embedded
  panes) and one-off stalls (GC, an alert, devtools) don't count: any frame
  interval above 250 ms is treated as a suspension and restarts the window.

  Budget: device-pixel-ratio capped at 1, at most 30 fps in both modes, paused
  while the tab is hidden. Under reduced motion time is frozen, the reflection
  is fully converged, there are no gusts, flashes, rush or pointer drift, and
  the scene redraws only when scroll or size changes (still within the cap).

  Tests may set window.__CLEARING_TEST__ = { watchdog: false } to switch off
  the watchdog only, or { watchdogMs: n } to change its threshold (-1 always
  trips it once enough samples exist).
*/

type Reason = "no-webgl" | "shader" | "context-lost" | "slow";
type Renderer = {
  draw(s: Uniforms): void;
  /** Block until the GPU has finished the last draw. */
  sync(): void;
  /** Give the context back to the browser. */
  release(): void;
};
type TestHook = { watchdog?: boolean; watchdogMs?: number };

const FRAME_MS = 1000 / 30;
// Accept a frame a little early so a 60 Hz display holds 30 fps rather than
// slipping to 20 fps on timer jitter.
const FRAME_SLACK_MS = 4;
const WATCHDOG_MS = 50;
const WATCHDOG_WINDOW_MS = 3000;
const WATCHDOG_EVERY = 5;
const WATCHDOG_MIN_SAMPLES = 5;
const SUSPENDED_MS = 250;
const STILL_TIME = 11;

function makeGL(canvas: HTMLCanvasElement): Renderer | Reason {
  let gl: WebGLRenderingContext | null = null;
  try {
    gl =
      canvas.getContext("webgl", { preserveDrawingBuffer: true, antialias: false }) ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
  } catch {
    gl = null;
  }
  if (!gl) return "no-webgl";
  const g = gl;
  const release = () => g.getExtension("WEBGL_lose_context")?.loseContext();
  const sh = (type: number, src: string) => {
    const s = g.createShader(type);
    if (!s) return null;
    g.shaderSource(s, src);
    g.compileShader(s);
    return g.getShaderParameter(s, g.COMPILE_STATUS) ? s : null;
  };
  const v = sh(g.VERTEX_SHADER, VERTEX_SRC);
  const f = sh(g.FRAGMENT_SHADER, FRAGMENT_SRC);
  const prog = v && f ? g.createProgram() : null;
  if (!prog || !v || !f) {
    release();
    return "shader";
  }
  g.attachShader(prog, v);
  g.attachShader(prog, f);
  g.linkProgram(prog);
  if (!g.getProgramParameter(prog, g.LINK_STATUS)) {
    release();
    return "shader";
  }
  g.useProgram(prog);
  const buf = g.createBuffer();
  g.bindBuffer(g.ARRAY_BUFFER, buf);
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
  const loc = g.getAttribLocation(prog, "p");
  g.enableVertexAttribArray(loc);
  g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
  const uRes = g.getUniformLocation(prog, "uRes");
  const locs = UNIFORMS.map((n) => g.getUniformLocation(prog, n));
  const px = new Uint8Array(4);
  return {
    draw(s) {
      g.viewport(0, 0, canvas.width, canvas.height);
      g.uniform2f(uRes, canvas.width, canvas.height);
      UNIFORMS.forEach((n, i) => g.uniform1f(locs[i], s[n]));
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
    },
    sync() {
      g.readPixels(0, 0, 1, 1, g.RGBA, g.UNSIGNED_BYTE, px);
    },
    release,
  };
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function World() {
  const bgRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bus = useSceneBus();

  useEffect(() => {
    const bg = bgRef.current;
    const canvas = canvasRef.current;
    if (!bg || !canvas) return;

    const hook: TestHook = (window as unknown as { __CLEARING_TEST__?: TestHook }).__CLEARING_TEST__ ?? {};
    const watchdogOn = hook.watchdog !== false;
    const watchdogMs = typeof hook.watchdogMs === "number" ? hook.watchdogMs : WATCHDOG_MS;

    let raf = 0;
    let stopped = false;
    let renderer: Renderer | null = null;
    let lastN = -1;
    const writeN = (n: number) => {
      if (n === lastN) return;
      lastN = n;
      document.querySelectorAll<HTMLElement>("[data-n]").forEach((e) => {
        e.textContent = String(n);
      });
    };

    const onContextLost = () => fallback("context-lost");

    const fallback = (reason: Reason) => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      bg.dataset.mode = "stills";
      bg.dataset.fallback = reason;
      // The stills are the converged scene.
      writeN(512);
      // Give the GPU back. Unhook first so our own loseContext isn't reported as a loss.
      canvas.removeEventListener("webglcontextlost", onContextLost);
      if (reason === "slow") renderer?.release();
      renderer = null;
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    // The layer's size, read on resize only so frames never force layout.
    let w = 1;
    let h = 1;
    let mx = 0;
    const t0 = performance.now();

    /** Draw one frame of the scene at time `now`. */
    const paint = (r: Renderer, now: number) => {
      const b = bus.read();
      const still = b.reducedMotion;
      const t = still ? STILL_TIME : (now - t0) / 1000;
      const k = still ? 9 : Math.min(9, Math.floor((now - t0) / 1000 / 1.1));
      const n = 2 ** k;
      writeN(n);
      const st = sceneState(b.p, w / h, t, b.keys);
      st.uN = n;
      st.uFlash = still ? 0 : Math.min(1, b.flash * 1.6);
      st.uFog = Math.min(0.97, st.uFog + (still ? 0 : b.gust * 0.35));
      st.uRush = still ? 0 : b.rush;
      st.uPar += still ? 0 : mx * 0.03;
      r.draw(st);
      bus.frameDone();
    };

    const resize = () => {
      const b = bg.getBoundingClientRect();
      const nw = Math.max(1, b.width);
      const nh = Math.max(1, b.height);
      const pr = Math.min(1, window.devicePixelRatio || 1);
      const cw = Math.round(nw * pr);
      const ch = Math.round(nh * pr);
      bg.dataset.orientation = nw / nh >= 1 ? "land" : "port";
      // iOS resizes the viewport as its toolbar slides while scrolling; an
      // unchanged backing size must not clear the canvas.
      if (cw === canvas.width && ch === canvas.height && nw === w && nh === h) return;
      w = nw;
      h = nh;
      if (cw !== canvas.width || ch !== canvas.height) {
        canvas.width = cw;
        canvas.height = ch;
      }
      bus.markDirty();
      // Resizing cleared the drawing buffer: repaint now, before the browser paints.
      if (renderer && !stopped) paint(renderer, performance.now());
    };
    resize();
    window.addEventListener("resize", resize);

    const onPointer = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const made = makeGL(canvas);
    if (typeof made === "string") {
      fallback(made);
      return () => {
        canvas.removeEventListener("webglcontextlost", onContextLost);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onPointer);
      };
    }
    renderer = made;

    let last = 0;
    let shown = false;
    let drawn = 0;
    // Watchdog window: sampled GPU times since winStart.
    let winStart = 0;
    let samples: number[] = [];
    const resetWindow = () => {
      winStart = 0;
      samples = [];
    };

    const frame = (now: number) => {
      const r = renderer;
      if (stopped || !r) return;
      raf = requestAnimationFrame(frame);
      // 30 fps cap in both modes; under reduced motion a dirty scene waits for
      // the next allowed frame and stays dirty until it is drawn.
      if (now - last < FRAME_MS - FRAME_SLACK_MS) return;
      const b = bus.read();
      const still = b.reducedMotion;
      if (still) {
        resetWindow();
        if (!b.dirty) return;
      }
      const dt = now - last;
      last = now;

      if (!shown) {
        paint(r, now);
        shown = true;
        bg.dataset.mode = "gl";
        return;
      }

      // A long gap is a suspension (throttled or stalled), not a slow GPU.
      const suspended = dt > SUSPENDED_MS;
      if (suspended) resetWindow();
      const sample = watchdogOn && !still && !suspended && ++drawn % WATCHDOG_EVERY === 0;
      const s0 = sample ? performance.now() : 0;
      paint(r, now);
      if (!sample) return;
      r.sync();
      samples.push(performance.now() - s0);

      if (winStart === 0) winStart = now;
      if (now - winStart < WATCHDOG_WINDOW_MS) return;
      if (samples.length >= WATCHDOG_MIN_SAMPLES && median(samples) > watchdogMs) fallback("slow");
      else resetWindow();
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      resetWindow();
      if (!document.hidden && !stopped) {
        last = 0;
        bus.markDirty();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    if (!document.hidden) raf = requestAnimationFrame(frame);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [bus]);

  return (
    <div className="bg" ref={bgRef} aria-hidden="true">
      <canvas id="world" ref={canvasRef} />
      <div className="stills" />
    </div>
  );
}
