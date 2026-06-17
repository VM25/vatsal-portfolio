"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

/**
 * The Hero's instrument: a "pricing core" - a faceted core wrapped by two gimbal
 * calibration rings, an inner kernel, four docked instrument modules (one per
 * project domain), and a dial of tick marks. It reads as an engineered market
 * mechanism (inputs -> core -> instruments), not a chart or a generic orb. GSAP
 * runs the assembly intro; a light rAF loop runs the continuous instrument
 * motion. Vanilla three.js, disposed cleanly on unmount.
 */
function cssVar(name: string, fb: string) {
  if (typeof window === "undefined") return fb;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
}

export function HeroCoreScene({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    // Camera pulled back so the full instrument (tick dial r~2.71, docked
    // modules r~2.35) sits well inside the frustum with margin on every side -
    // nothing gets cropped by the canvas edge.
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 9.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const C = {
      accent: new THREE.Color(cssVar("--accent", "#d3a24f")),
      cosmos: new THREE.Color(cssVar("--cosmos", "#16222e")),
      ink: new THREE.Color(cssVar("--ink", "#e9ebee")),
      amber: new THREE.Color(cssVar("--p-fx", "#c47e4e")),
      hues: [
        new THREE.Color(cssVar("--p-apexgp", "#d9a74f")),
        new THREE.Color(cssVar("--p-rates", "#6f9ec9")),
        new THREE.Color(cssVar("--p-portfolio", "#a9b7c9")),
        new THREE.Color(cssVar("--p-fx", "#c47e4e")),
      ],
    };

    const group = new THREE.Group();
    scene.add(group);
    group.rotation.x = 0.32;

    // faceted core (solid ghost + crisp edges)
    const coreGeo = new THREE.OctahedronGeometry(1.18, 0);
    const core = new THREE.Mesh(
      coreGeo,
      new THREE.MeshBasicMaterial({ color: C.cosmos, transparent: true, opacity: 0.4 }),
    );
    const coreEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(coreGeo),
      new THREE.LineBasicMaterial({ color: C.accent, transparent: true, opacity: 0.95 }),
    );
    group.add(core, coreEdges);

    // inner kernel - the pricing kernel
    const kernel = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.52, 0)),
      new THREE.LineBasicMaterial({ color: C.amber, transparent: true, opacity: 0.9 }),
    );
    group.add(kernel);

    // two gimbal calibration rings
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(1.72, 0.011, 8, 96),
      new THREE.MeshBasicMaterial({ color: C.ink, transparent: true, opacity: 0.55 }),
    );
    ring1.rotation.x = Math.PI / 2.1;
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.0, 0.009, 8, 96),
      new THREE.MeshBasicMaterial({ color: C.accent, transparent: true, opacity: 0.5 }),
    );
    ring2.rotation.y = Math.PI / 2.4;
    ring2.rotation.x = 0.4;
    group.add(ring1, ring2);

    // four docked instrument modules - one per project domain
    const orbit = new THREE.Group();
    const modules: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.26, 0.26),
        new THREE.MeshBasicMaterial({ color: C.hues[i], wireframe: true, transparent: true, opacity: 0.95 }),
      );
      m.position.set(Math.cos(a) * 2.35, Math.sin(a) * 2.35, 0);
      m.rotation.set(a, a, 0);
      modules.push(m);
      orbit.add(m);
    }
    group.add(orbit);

    // tick dial - a calibration scale
    const N = 64;
    const tickPos: number[] = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const r0 = 2.55;
      const long = i % 8 === 0;
      const r1 = r0 + (long ? 0.16 : 0.08);
      tickPos.push(Math.cos(a) * r0, Math.sin(a) * r0, 0, Math.cos(a) * r1, Math.sin(a) * r1, 0);
    }
    const dial = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(tickPos, 3)),
      new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: 0.28 }),
    );
    dial.rotation.x = Math.PI / 2.1;
    group.add(dial);

    function resize() {
      const w = mount!.clientWidth || 1;
      const h = mount!.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // pointer drift (subtle)
    const pointer = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const r = mount!.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointer.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove);

    // GSAP assembly intro
    group.scale.setScalar(reduce ? 1 : 0.55);
    if (!reduce) {
      gsap.to(group.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: "power3.out" });
      gsap.from(group.rotation, { y: -1.4, duration: 1.6, ease: "power3.out" });
      modules.forEach((m, i) => {
        gsap.from(m.scale, { x: 0, y: 0, z: 0, duration: 0.7, delay: 0.5 + i * 0.1, ease: "back.out(2)" });
      });
      gsap.from([ring1.scale, ring2.scale], { x: 0, y: 0, z: 0, duration: 1, delay: 0.3, ease: "power3.out", stagger: 0.12 });
    }

    let raf = 0;
    let running = true;
    const start = performance.now();
    const render = (now: number) => {
      const t = (now - start) / 1000;
      const s = reduce ? 0 : 1;
      group.rotation.y += 0.0022 * s;
      group.rotation.x = 0.32 + (reduce ? 0 : pointer.y * -0.18 + Math.sin(t * 0.3) * 0.03);
      group.rotation.z = reduce ? 0 : pointer.x * 0.1;
      kernel.rotation.y -= 0.01 * s;
      kernel.rotation.x += 0.006 * s;
      ring1.rotation.z += 0.004 * s;
      ring2.rotation.z -= 0.006 * s;
      orbit.rotation.z += 0.0016 * s;
      modules.forEach((m, i) => {
        m.rotation.x += 0.01 * s;
        m.rotation.y += 0.012 * s;
        void i;
      });
      renderer.render(scene, camera);
      if (running) raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      gsap.killTweensOf([group.scale, group.rotation, ring1.scale, ring2.scale, ...modules.map((m) => m.scale)]);
      scene.traverse((o) => {
        const any = o as THREE.Mesh;
        if (any.geometry) any.geometry.dispose();
        const mat = (any as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} />;
}
