"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";

const AMBER = "#e8a23d";
const COPPER = "#c47b4a";
const GOLD = "#d9a441";
const UP = "#5bb98c";
const DOWN = "#d9596b";

export type StationProps = {
  position: [number, number, number];
  reduced?: boolean;
};

function useSpin(reduced: boolean | undefined, speed = 0.08) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (ref.current && !reduced) ref.current.rotation.y += d * speed;
  });
  return ref;
}

/** Hero station — a volatility surface as a glowing amber wireframe ridge. */
export function VolatilitySurface({ position, reduced }: StationProps) {
  const ref = useSpin(reduced, 0.05);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(6, 5, 40, 34);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(
        i,
        Math.sin(x * 0.7) * 0.4 +
          Math.cos(y * 0.6) * 0.3 +
          Math.exp(-((x * x + y * y) * 0.06)) * 1.1,
      );
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group ref={ref} position={position} rotation={[-Math.PI / 2.6, 0, 0]}>
      <mesh geometry={geo}>
        <meshStandardMaterial
          color={AMBER}
          wireframe
          transparent
          opacity={0.5}
          emissive="#c2410c"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

/** A family of yield curves stacked in depth. */
export function YieldRibbon({ position, reduced }: StationProps) {
  const ref = useSpin(reduced, 0.05);
  const curves = useMemo(
    () =>
      Array.from({ length: 6 }, (_, k) => {
        const pts: [number, number, number][] = [];
        for (let i = 0; i <= 40; i++) {
          const t = i / 40;
          const x = t * 8 - 4;
          const y = Math.sqrt(t) * 2.2 - 1;
          pts.push([x, y, k * 0.4 - 1.2]);
        }
        return pts;
      }),
    [],
  );
  return (
    <group ref={ref} position={position}>
      {curves.map((pts, k) => (
        <Line
          key={k}
          points={pts}
          color={k % 2 ? GOLD : AMBER}
          lineWidth={1}
          transparent
          opacity={0.3 - k * 0.025}
        />
      ))}
    </group>
  );
}

/** Risk cubes — a lattice of wireframe boxes. */
export function RiskLattice({ position, reduced }: StationProps) {
  const ref = useSpin(reduced, 0.12);
  const cubes = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let x = 0; x < 3; x++)
      for (let y = 0; y < 3; y++)
        for (let z = 0; z < 2; z++)
          arr.push([(x - 1) * 1.4, (y - 1) * 1.4, (z - 0.5) * 1.4]);
    return arr;
  }, []);
  return (
    <group ref={ref} position={position}>
      {cubes.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial
            color={i % 5 === 0 ? COPPER : AMBER}
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Order-book ladder — bid (green) and ask (red) depth bars. */
export function OrderBookLadder({ position, reduced }: StationProps) {
  const ref = useSpin(reduced, 0.05);
  const rows = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const bid = i < 7;
        const idx = bid ? i : i - 7;
        const depth = 1 + Math.random() * 2.4;
        const y = (bid ? -(idx + 1) : idx + 1) * 0.34;
        return { y, depth, bid };
      }),
    [],
  );
  return (
    <group ref={ref} position={position}>
      {rows.map((r, i) => (
        <mesh key={i} position={[(r.bid ? -1 : 1) * (r.depth / 2), r.y, 0]}>
          <boxGeometry args={[r.depth, 0.18, 0.18]} />
          <meshStandardMaterial
            color={r.bid ? UP : DOWN}
            transparent
            opacity={0.5}
            emissive={r.bid ? UP : DOWN}
            emissiveIntensity={0.18}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Institutional colonnade — a trading-floor architecture cue. */
export function ColumnArray({ position, reduced }: StationProps) {
  const ref = useSpin(reduced, 0.04);
  const cols = useMemo(() => Array.from({ length: 7 }, (_, i) => (i - 3) * 1.1), []);
  return (
    <group ref={ref} position={position}>
      {cols.map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <boxGeometry args={[0.5, 6, 0.5]} />
          <meshStandardMaterial color={AMBER} wireframe transparent opacity={0.3} />
        </mesh>
      ))}
      <Line points={[[-4, 3, 0], [4, 3, 0]]} color={COPPER} lineWidth={1} transparent opacity={0.25} />
      <Line points={[[-4, -3, 0], [4, -3, 0]]} color={COPPER} lineWidth={1} transparent opacity={0.25} />
    </group>
  );
}

/** Efficient frontier arc with a scattered factor constellation. */
export function EfficientFrontier({ position, reduced }: StationProps) {
  const ref = useSpin(reduced, 0.05);
  const arc = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 50; i++) {
      const t = i / 50;
      pts.push([t * 7 - 3.5, Math.sqrt(t) * 2.4 - 1.2, 0]);
    }
    return pts;
  }, []);
  const stars = useMemo(() => {
    const n = 60;
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      a[i * 3] = (Math.random() - 0.5) * 8;
      a[i * 3 + 1] = (Math.random() - 0.5) * 5 - 0.5;
      a[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(a, 3));
    return g;
  }, []);
  return (
    <group ref={ref} position={position}>
      <Line points={arc} color={GOLD} lineWidth={1.4} transparent opacity={0.55} />
      <points geometry={stars}>
        <pointsMaterial
          size={0.06}
          color={AMBER}
          transparent
          opacity={0.7}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/** Final signal — concentric converging rings. */
export function SignalRing({ position, reduced }: StationProps) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (ref.current && !reduced) {
      ref.current.rotation.x += d * 0.1;
      ref.current.rotation.y += d * 0.06;
    }
  });
  const rings = [1.6, 2.4, 3.2, 4.0];
  return (
    <group ref={ref} position={position}>
      {rings.map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.02, 8, 80]} />
          <meshStandardMaterial
            color={AMBER}
            emissive={AMBER}
            emissiveIntensity={0.4}
            transparent
            opacity={0.5 - i * 0.07}
          />
        </mesh>
      ))}
    </group>
  );
}

/** An arc of floating institutional case-file panels (the Observatory centerpiece). */
export function CaseFileSlabs({ position, reduced }: StationProps) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  const slabs = useMemo(
    () => [-2, -1, 0, 1, 2].map((i) => ({ angle: i * 0.3, y: i * 0.1 })),
    [],
  );
  useFrame((_, d) => {
    if (ref.current && !reduced) {
      t.current += d;
      ref.current.rotation.y = Math.sin(t.current * 0.18) * 0.1;
    }
  });
  return (
    <group ref={ref} position={position}>
      {slabs.map((s, i) => (
        <group
          key={i}
          rotation={[0, s.angle, 0]}
          position={[Math.sin(s.angle) * 3.4, s.y, -Math.cos(s.angle) * 3.4 + 3.4]}
        >
          <mesh>
            <boxGeometry args={[1.7, 2.3, 0.05]} />
            <meshStandardMaterial color="#16120f" transparent opacity={0.55} metalness={0.2} roughness={0.7} />
          </mesh>
          <mesh>
            <boxGeometry args={[1.72, 2.32, 0.06]} />
            <meshStandardMaterial color={i === 2 ? AMBER : COPPER} wireframe transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** A connected rail of record nodes (the Experience centerpiece). */
export function ArchiveNodes({ position, reduced }: StationProps) {
  const ref = useSpin(reduced, 0.05);
  const nodes = useMemo(
    () =>
      Array.from(
        { length: 6 },
        (_, i) => [(i - 2.5) * 1.2, Math.sin(i * 1.3) * 0.5, 0] as [number, number, number],
      ),
    [],
  );
  return (
    <group ref={ref} position={position}>
      <Line points={nodes} color={COPPER} lineWidth={1} transparent opacity={0.4} />
      {nodes.map((n, i) => (
        <mesh key={i} position={n}>
          <octahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.4} transparent opacity={0.75} />
        </mesh>
      ))}
    </group>
  );
}

/** Diverging simulated paths (Monte Carlo / event-market tracks). */
export function MonteCarloPaths({ position, reduced }: StationProps) {
  const ref = useSpin(reduced, 0.04);
  const paths = useMemo(
    () =>
      Array.from({ length: 14 }, () => {
        const pts: [number, number, number][] = [];
        let y = 0;
        for (let i = 0; i <= 30; i++) {
          y += (Math.random() - 0.48) * 0.25;
          pts.push([(i / 30) * 6 - 3, y, (Math.random() - 0.5) * 0.6]);
        }
        return pts;
      }),
    [],
  );
  return (
    <group ref={ref} position={position}>
      {paths.map((p, i) => (
        <Line
          key={i}
          points={p}
          color={i % 3 === 0 ? UP : i % 3 === 1 ? AMBER : DOWN}
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}
    </group>
  );
}

/** Ambient motes spanning the full journey depth. */
export function Motes({ count = 420, reduced }: { count?: number; reduced?: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 42;
      a[i * 3 + 1] = (Math.random() - 0.5) * 18;
      a[i * 3 + 2] = -Math.random() * 134 + 6;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(a, 3));
    return g;
  }, [count]);
  useFrame((_, d) => {
    if (ref.current && !reduced) ref.current.rotation.y += d * 0.005;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.03} color={GOLD} transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/** 3D editorial label that travels through depth with the camera. */
export function Label3D({
  children,
  position,
  rotation,
  fontSize = 1,
  color = "#ece3d6",
  opacity = 1,
}: {
  children: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  fontSize?: number;
  color?: string;
  opacity?: number;
}) {
  return (
    <Text
      position={position}
      rotation={rotation}
      fontSize={fontSize}
      color={color}
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.02}
      fillOpacity={opacity}
      material-toneMapped={false}
    >
      {children}
    </Text>
  );
}
