"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/store/useStore";
import { cameraForJourney, STATIONS } from "@/lib/journey";

const target = new THREE.Vector3();
const lookTarget = new THREE.Vector3();

/**
 * Drives the camera from the shared `journey` value. Used identically in both
 * canvases so background and foreground layers stay locked together. When a
 * project chamber is open, the camera dollies to the Observatory station — so
 * the project interaction moves both DOM state and the 3D camera.
 */
export function ScrollCameraRig({ reduced = false }: { reduced?: boolean }) {
  useFrame((state) => {
    const s = useStore.getState();
    const { pos, look } = cameraForJourney(reduced ? 0 : s.journey);

    if (s.activeProject) {
      const w = STATIONS.work;
      target.set(w[0], w[1] + 0.3, w[2] + 7);
      lookTarget.set(w[0], w[1], w[2]);
    } else {
      target.set(
        pos[0] + state.pointer.x * 0.6,
        pos[1] + state.pointer.y * 0.4,
        pos[2],
      );
      lookTarget.set(look[0], look[1], look[2]);
    }

    state.camera.position.lerp(target, reduced ? 1 : 0.06);
    state.camera.lookAt(lookTarget);
  });

  return null;
}
