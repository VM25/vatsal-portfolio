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
  context, or frames averaging slower than 50 ms over 3 s.

  Budget: device-pixel-ratio capped at 1, at most 30 fps, paused while the tab
  is hidden. Under reduced motion time is frozen, the reflection is fully
  converged, there are no gusts, flashes, rush or pointer drift, and the scene
  redraws only when scroll or size changes.

  Tests may set window.__CLEARING_TEST__ = { watchdog: false } to switch off
  the frame-time watchdog only (software WebGL in headless browsers is slow),
  or { watchdogMs: n } to change its threshold.
*/

type Reason = "no-webgl" | "shader" | "context-lost" | "slow";
type Renderer = { draw(s: Uniforms): void };
type TestHook = { watchdog?: boolean; watchdogMs?: number };

const FRAME_MS = 1000 / 30;
// Accept a frame a little early so a 60 Hz display holds 30 fps rather than
// slipping to 20 fps on timer jitter.
const FRAME_SLACK_MS = 4;
const WATCHDOG_MS = 50;
const WATCHDOG_WINDOW_MS = 3000;
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
  const sh = (type: number, src: string) => {
    const s = g.createShader(type);
    if (!s) return null;
    g.shaderSource(s, src);
    g.compileShader(s);
    return g.getShaderParameter(s, g.COMPILE_STATUS) ? s : null;
  };
  const v = sh(g.VERTEX_SHADER, VERTEX_SRC);
  const f = sh(g.FRAGMENT_SHADER, FRAGMENT_SRC);
  if (!v || !f) return "shader";
  const prog = g.createProgram();
  if (!prog) return "shader";
  g.attachShader(prog, v);
  g.attachShader(prog, f);
  g.linkProgram(prog);
  if (!g.getProgramParameter(prog, g.LINK_STATUS)) return "shader";
  g.useProgram(prog);
  const buf = g.createBuffer();
  g.bindBuffer(g.ARRAY_BUFFER, buf);
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
  const loc = g.getAttribLocation(prog, "p");
  g.enableVertexAttribArray(loc);
  g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
  const uRes = g.getUniformLocation(prog, "uRes");
  const locs = UNIFORMS.map((n) => g.getUniformLocation(prog, n));
  return {
    draw(s) {
      g.viewport(0, 0, canvas.width, canvas.height);
      g.uniform2f(uRes, canvas.width, canvas.height);
      UNIFORMS.forEach((n, i) => g.uniform1f(locs[i], s[n]));
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
    },
  };
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
    let lastN = -1;
    const writeN = (n: number) => {
      if (n === lastN) return;
      lastN = n;
      document.querySelectorAll<HTMLElement>("[data-n]").forEach((e) => {
        e.textContent = String(n);
      });
    };

    const fallback = (reason: Reason) => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      bg.dataset.mode = "stills";
      bg.dataset.fallback = reason;
      // The stills are the converged scene.
      writeN(512);
    };

    // The layer's size, read on resize only so frames never force layout.
    let w = 1;
    let h = 1;

    const onContextLost = () => fallback("context-lost");
    canvas.addEventListener("webglcontextlost", onContextLost);

    const resize = () => {
      const b = bg.getBoundingClientRect();
      w = Math.max(1, b.width);
      h = Math.max(1, b.height);
      bg.dataset.orientation = w / h >= 1 ? "land" : "port";
      const pr = Math.min(1, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * pr);
      canvas.height = Math.round(h * pr);
      bus.markDirty();
    };
    resize();
    window.addEventListener("resize", resize);

    let mx = 0;
    const onPointer = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const r = makeGL(canvas);
    if (typeof r === "string") {
      fallback(r);
      return () => {
        canvas.removeEventListener("webglcontextlost", onContextLost);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onPointer);
      };
    }

    const t0 = performance.now();
    let last = 0;
    let shown = false;
    // Watchdog window: sum and count of frame intervals since winStart.
    let winStart = 0;
    let winSum = 0;
    let winCount = 0;
    const resetWindow = () => {
      winStart = 0;
      winSum = 0;
      winCount = 0;
    };

    const frame = (now: number) => {
      if (stopped) return;
      raf = requestAnimationFrame(frame);
      const b = bus.read();
      const still = b.reducedMotion;
      if (still) {
        resetWindow();
        if (!b.dirty) return;
      } else if (now - last < FRAME_MS - FRAME_SLACK_MS) {
        return;
      }
      const dt = now - last;
      last = now;

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

      if (!shown) {
        shown = true;
        bg.dataset.mode = "gl";
        return;
      }
      if (still || !watchdogOn) return;
      if (winStart === 0) {
        winStart = now;
        return;
      }
      winSum += dt;
      winCount += 1;
      if (now - winStart >= WATCHDOG_WINDOW_MS) {
        if (winSum / winCount > watchdogMs) fallback("slow");
        else resetWindow();
      }
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
