"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ScrollCameraRig } from "@/components/three/ScrollCameraRig";
import { Motes } from "@/components/three/stations";

/** A few faint panels riding near the camera path, at the edges, so they pass
 *  in front of the DOM content during transitions (true foreground depth). */
function DriftSlabs({ reduced }: { reduced?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);
  const slabs = useMemo(
    () =>
      [
        [-5.2, 1.4, -16],
        [5.2, -1.2, -44],
        [-5.6, 1.0, -72],
        [5.0, 0.8, -102],
      ] as [number, number, number][],
    [],
  );
  useFrame((_, d) => {
    if (group.current && !reduced) {
      t.current += d;
      group.current.children.forEach((c, i) => {
        c.position.y += Math.sin(t.current * 0.5 + i) * 0.0016;
      });
    }
  });
  return (
    <group ref={group}>
      {slabs.map((p, i) => (
        <mesh key={i} position={p} rotation={[0, 0.3, 0.12]}>
          <planeGeometry args={[1.5, 0.5]} />
          <meshBasicMaterial color="#e8a23d" transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/** Foreground canvas (z-30, non-interactive): sparse near-camera depth. */
export function ForegroundCanvas({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const R = reducedMotion;
  return (
    <Canvas
      className="!absolute !inset-0"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.6, 8.5], fov: 52, far: 220 }}
      frameloop={R ? "demand" : "always"}
      gl={{ antialias: true, alpha: true }}
    >
      <ScrollCameraRig reduced={R} />
      <Motes count={130} reduced={R} />
      <DriftSlabs reduced={R} />
    </Canvas>
  );
}
