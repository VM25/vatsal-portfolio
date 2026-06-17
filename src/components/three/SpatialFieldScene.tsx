"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * A dim market-depth lattice: a wide field of thin vertical bars (book depth)
 * receding into the distance, with the camera slowly swaying so the viewer
 * drifts through a structured space. Static geometry (deterministic heights) +
 * camera-only motion — cheap, smooth, and meaningful to the systems → markets
 * story. Vanilla three.js, paused offscreen, disposed on unmount.
 */
function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export function SpatialFieldScene({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    // build a lattice of vertical bars
    const GX = 64;
    const GZ = 36;
    const SPX = 1.5;
    const SPZ = 1.9;
    const positions: number[] = [];
    const colors: number[] = [];
    const cLow = new THREE.Color(cssVar("--cosmos", "#15384f"));
    const cHigh = new THREE.Color(cssVar("--accent", "#5d9bd8"));

    for (let gz = 0; gz < GZ; gz++) {
      for (let gx = 0; gx < GX; gx++) {
        const x = (gx - GX / 2) * SPX;
        const z = -gz * SPZ;
        // deterministic "book depth" height field
        const h =
          1.1 +
          Math.sin(gx * 0.45 + gz * 0.3) * 0.8 +
          Math.cos(gx * 0.17 - gz * 0.22) * 0.7 +
          Math.sin((gx + gz) * 0.09) * 0.5;
        const hh = Math.max(0.3, h);
        positions.push(x, 0, z, x, hh, z);
        const fade = 1 - gz / GZ; // far bars dimmer
        colors.push(cLow.r * fade, cLow.g * fade, cLow.b * fade);
        colors.push(cHigh.r * fade, cHigh.g * fade, cHigh.b * fade);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false });
    const bars = new THREE.LineSegments(geo, mat);
    bars.position.y = -3.2;
    bars.position.z = 8;
    scene.add(bars);

    function refreshColors() {
      const lo = new THREE.Color(cssVar("--cosmos", "#15384f"));
      const hi = new THREE.Color(cssVar("--accent", "#5d9bd8"));
      const col = geo.getAttribute("color") as THREE.BufferAttribute;
      let i = 0;
      for (let gz = 0; gz < GZ; gz++) {
        for (let gx = 0; gx < GX; gx++) {
          const fade = 1 - gz / GZ;
          col.setXYZ(i++, lo.r * fade, lo.g * fade, lo.b * fade);
          col.setXYZ(i++, hi.r * fade, hi.g * fade, hi.b * fade);
        }
      }
      col.needsUpdate = true;
    }
    void refreshColors;

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

    let raf = 0;
    let running = true;
    const start = performance.now();
    const render = (now: number) => {
      const t = (now - start) / 1000;
      const sway = reduce ? 0 : t * 0.06;
      camera.position.set(Math.sin(sway) * 5, 2.4 + Math.sin(t * 0.05) * 0.5, 14);
      camera.lookAt(0, -1.5, -22);
      bars.rotation.y = reduce ? 0 : Math.sin(t * 0.03) * 0.04;
      renderer.render(scene, camera);
      if (!reduce && running) raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const onVis = () => {
      if (reduce) return;
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
      document.removeEventListener("visibilitychange", onVis);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} />;
}
