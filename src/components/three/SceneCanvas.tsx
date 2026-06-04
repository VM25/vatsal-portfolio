"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useStore } from "@/store/useStore";
import { ScrollCameraRig } from "@/components/three/ScrollCameraRig";
import { STATIONS } from "@/lib/journey";
import {
  VolatilitySurface,
  YieldRibbon,
  RiskLattice,
  OrderBookLadder,
  CaseFileSlabs,
  ArchiveNodes,
  EfficientFrontier,
  SignalRing,
  MonteCarloPaths,
  Motes,
} from "@/components/three/stations";

/** Background canvas (z-0): the world the camera flies through. */
export function SceneCanvas({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const setSceneReady = useStore((s) => s.setSceneReady);
  const R = reducedMotion;

  return (
    <Canvas
      className="!absolute !inset-0"
      dpr={[1, 1.6]}
      camera={{ position: [0, 0.6, 8.5], fov: 52, far: 220 }}
      frameloop={R ? "demand" : "always"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ scene }) => {
        scene.fog = new THREE.FogExp2("#0c0a09", 0.02);
        setSceneReady(true);
      }}
    >
      <ambientLight intensity={0.5} color="#f0e6d6" />
      <directionalLight position={[6, 10, 8]} intensity={1.0} color="#f2b65a" />
      <pointLight position={[0, 0, -2]} intensity={10} color="#e8a23d" distance={32} />
      <pointLight position={STATIONS.arsenalL} intensity={10} color="#c47b4a" distance={28} />
      <pointLight position={STATIONS.work} intensity={13} color="#e8a23d" distance={36} />
      <pointLight position={STATIONS.research} intensity={10} color="#d9a441" distance={30} />

      <ScrollCameraRig reduced={R} />

      <Motes reduced={R} />
      <VolatilitySurface position={STATIONS.arrival} reduced={R} />
      <YieldRibbon position={STATIONS.origin} reduced={R} />
      <RiskLattice position={STATIONS.arsenalL} reduced={R} />
      <OrderBookLadder position={STATIONS.arsenalR} reduced={R} />
      <CaseFileSlabs position={STATIONS.work} reduced={R} />
      <MonteCarloPaths
        position={[STATIONS.work[0], STATIONS.work[1] - 1.6, STATIONS.work[2] + 1]}
        reduced={R}
      />
      <ArchiveNodes position={STATIONS.experience} reduced={R} />
      <EfficientFrontier position={STATIONS.research} reduced={R} />
      <SignalRing position={STATIONS.contact} reduced={R} />

      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.22}
          luminanceSmoothing={0.3}
          mipmapBlur
          radius={0.7}
        />
        <Vignette eskil={false} offset={0.2} darkness={0.9} />
      </EffectComposer>
    </Canvas>
  );
}
