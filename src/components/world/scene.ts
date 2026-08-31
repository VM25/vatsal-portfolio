import * as THREE from "three";
import { WORLDS, hex, C } from "@/lib/palette";

/**
 * The journey.
 *
 * One camera on a fixed spline through six environments. The path deliberately
 * changes character at every stage — a straight push in, a lateral drift, a
 * diagonal fall, a long sideways travelling shot, a climb, then a final push
 * into open space — so the movement never settles into a single direction.
 *
 * Scroll sets a single number, 0 to 1. Everything else is derived from it.
 */

// Waypoints, one segment per world. The camera reads position from this curve
// and aims a little further along it, which is what makes turns feel driven
// rather than snapped.
const PATH = [
  new THREE.Vector3(0, 0, 46),
  new THREE.Vector3(0, 0, 24), // approach — straight in
  new THREE.Vector3(-9, 3, 14),
  new THREE.Vector3(-20, 5, 4), // origin — drifts left and rises
  new THREE.Vector3(-16, -3, -6),
  new THREE.Vector3(-6, -15, -18), // foundation — falls diagonally
  new THREE.Vector3(2, -11, -22),
  new THREE.Vector3(22, -8, -26), // work — long travelling shot right, held back
                                  // from the row so all seven stay in frame
  new THREE.Vector3(18, -1, -55),
  new THREE.Vector3(7, 7, -64), // question — climbs
  new THREE.Vector3(2, 3, -76),
  new THREE.Vector3(0, 0, -92), // arrival — straight out
];

const CURVE = new THREE.CatmullRomCurve3(PATH, false, "catmullrom", 0.4);

/**
 * Each world's subject. The camera aims at a blend of "further along the path"
 * and "the thing this chapter is about", so travel still reads as travel but
 * the subject is always actually in frame. Aiming purely down the path leaves
 * the hero object drifting past in the periphery.
 */
const FOCUS = [
  new THREE.Vector3(7.4, 0.4, 13), // the portrait
  new THREE.Vector3(-15, 4.2, 8), // the route markers
  new THREE.Vector3(-13, -11, -16), // the structure
  new THREE.Vector3(16, -14, -37), // the seven
  new THREE.Vector3(12, 2, -60), // the open question
  new THREE.Vector3(0, 0, -84), // the ring
];

/** Where each world sits along the curve, as a 0–1 range. */
const SPAN = 1 / WORLDS.length;
export const worldAt = (t: number) =>
  Math.min(WORLDS.length - 1, Math.floor(t / SPAN));

export interface Journey {
  setProgress: (t: number) => void;
  resize: () => void;
  dispose: () => void;
  setPointer: (x: number, y: number) => void;
}

export function createJourney(
  canvas: HTMLCanvasElement,
  portraitUrl: string,
  opts: { still: boolean },
): Journey {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(hex(C.onyx), 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(hex(C.onyx), 0.026);

  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 260);

  // --- lighting ------------------------------------------------------------
  const key = new THREE.DirectionalLight(hex(C.praxeti), 2.1);
  key.position.set(6, 10, 8);
  scene.add(key);

  const fill = new THREE.DirectionalLight(hex(C.aqua), 0.9);
  fill.position.set(-8, -4, -6);
  scene.add(fill);

  const ambient = new THREE.AmbientLight(hex(C.oceanic), 1.4);
  scene.add(ambient);

  // A light that rides with the camera so nothing ever goes fully black.
  const lamp = new THREE.PointLight(hex(C.saffron), 24, 34, 2);
  scene.add(lamp);

  const disposables: Array<{ dispose: () => void }> = [];
  const track = <T extends { dispose: () => void }>(x: T) => {
    disposables.push(x);
    return x;
  };

  // === WORLD 1 — APPROACH ==================================================
  // Dust, and the portrait hanging in it.
  const dustGeo = track(new THREE.BufferGeometry());
  {
    const n = 1400;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 70;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 46;
      pos[i * 3 + 2] = 44 - Math.random() * 60;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  }
  const dust = new THREE.Points(
    dustGeo,
    track(
      new THREE.PointsMaterial({
        color: hex(C.aqua),
        size: 0.07,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    ),
  );
  scene.add(dust);

  // The portrait, as a lit plane the camera flies toward and then past.
  const loader = new THREE.TextureLoader();
  const portraitTex = loader.load(portraitUrl, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });
  const portrait = new THREE.Mesh(
    track(new THREE.PlaneGeometry(7.6, 10.1)),
    track(
      new THREE.MeshBasicMaterial({
        map: portraitTex,
        transparent: true,
        opacity: 0,
      }),
    ),
  );
  // Sits right of the centre line: the name occupies the left of the frame on
  // the way in, so a centred portrait would simply be read as texture.
  portrait.position.set(7.4, 0.4, 13);
  scene.add(portrait);

  // A frame around it, so it reads as an object in the world rather than a
  // sticker. Aligned to the picture — a rotated frame just looks like a stray
  // shape that happens to overlap a face.
  const portraitFrame = new THREE.LineSegments(
    track(new THREE.EdgesGeometry(new THREE.PlaneGeometry(8.4, 10.9))),
    track(
      new THREE.LineBasicMaterial({
        color: hex(C.saffron),
        transparent: true,
        opacity: 0,
      }),
    ),
  );
  portraitFrame.position.copy(portrait.position);
  portraitFrame.position.z -= 0.05;
  scene.add(portraitFrame);
  const portraitFrameMat = portraitFrame.material as THREE.LineBasicMaterial;

  // A second, offset frame — depth, and a hint that the picture sits in space.
  const portraitEcho = new THREE.LineSegments(
    track(new THREE.EdgesGeometry(new THREE.PlaneGeometry(9.4, 11.9))),
    track(
      new THREE.LineBasicMaterial({
        color: hex(C.aqua),
        transparent: true,
        opacity: 0,
      }),
    ),
  );
  portraitEcho.position.set(
    portrait.position.x - 0.5,
    portrait.position.y + 0.35,
    portrait.position.z - 1.4,
  );
  scene.add(portraitEcho);
  const portraitEchoMat = portraitEcho.material as THREE.LineBasicMaterial;

  // === WORLD 2 — ORIGIN ====================================================
  // Four markers, strung out along the drift. The route that was actually taken.
  const originGroup = new THREE.Group();
  const stops = ["Mumbai", "Arizona", "New Jersey", "New York"];
  const markerMat = track(
    new THREE.MeshStandardMaterial({
      color: hex(C.arctic),
      roughness: 0.35,
      metalness: 0.1,
      emissive: hex(C.nocturnal),
      emissiveIntensity: 0.5,
    }),
  );
  const markerGeo = track(new THREE.OctahedronGeometry(0.85, 0));
  stops.forEach((_, i) => {
    const m = new THREE.Mesh(markerGeo, markerMat);
    const f = i / (stops.length - 1);
    m.position.set(-4 - f * 22, 6 - f * 3, 20 - f * 20);
    m.userData.spin = 0.2 + i * 0.08;
    originGroup.add(m);

    // A thread between the stops — the trajectory itself.
    if (i > 0) {
      const prev = originGroup.children[i - 1] as THREE.Mesh;
      const line = new THREE.Line(
        track(
          new THREE.BufferGeometry().setFromPoints([prev.position, m.position]),
        ),
        track(
          new THREE.LineBasicMaterial({
            color: hex(C.aqua),
            transparent: true,
            opacity: 0.4,
          }),
        ),
      );
      originGroup.add(line);
    }
  });
  scene.add(originGroup);

  // === WORLD 3 — FOUNDATION ================================================
  // An orthogonal lattice the camera falls through. The engineering underneath.
  // Nested wireframe shells plus a floor grid: read as a built structure the
  // camera descends into. Hundreds of loose cubes only ever read as debris.
  const frameMat = track(
    new THREE.LineBasicMaterial({
      color: hex(C.blue),
      transparent: true,
      opacity: 0.85,
    }),
  );
  const innerMat = track(
    new THREE.LineBasicMaterial({
      color: hex(C.snow),
      transparent: true,
      opacity: 0.4,
    }),
  );

  const foundation = new THREE.Group();
  [
    { size: [46, 30, 40], mat: frameMat },
    { size: [30, 20, 26], mat: innerMat },
    { size: [16, 11, 14], mat: frameMat },
  ].forEach(({ size, mat }) => {
    const shell = new THREE.LineSegments(
      track(
        new THREE.EdgesGeometry(
          new THREE.BoxGeometry(size[0], size[1], size[2]),
        ),
      ),
      mat,
    );
    foundation.add(shell);
  });

  // A floor grid under it all — the horizon line that makes depth readable.
  const grid = new THREE.GridHelper(70, 14, hex(C.aqua), hex(C.nocturnal));
  grid.position.y = -16;
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.32;
  foundation.add(grid);

  // Nodes at the corners of the inner shell, so the structure has weight.
  const nodeGeo = track(new THREE.OctahedronGeometry(0.6, 0));
  const nodeMat = track(
    new THREE.MeshStandardMaterial({
      color: hex(C.oceanic),
      emissive: hex(C.snow),
      emissiveIntensity: 0.4,
      roughness: 0.4,
      metalness: 0.6,
    }),
  );
  for (const sx of [-1, 1])
    for (const sy of [-1, 1])
      for (const sz of [-1, 1]) {
        const n = new THREE.Mesh(nodeGeo, nodeMat);
        n.position.set(sx * 15, sy * 10, sz * 13);
        foundation.add(n);
      }

  foundation.position.set(-13, -11, -16);
  scene.add(foundation);

  // === WORLD 4 — THE WORK ==================================================
  // Seven slabs the camera tracks past, one per project.
  const workGroup = new THREE.Group();
  // Seven monoliths in a line, tall and set back far enough to read as a
  // skyline the camera tracks past rather than obstacles it weaves through.
  const slabGeo = track(new THREE.BoxGeometry(2.4, 20, 2.4));
  for (let i = 0; i < 7; i++) {
    const warm = i % 2 === 0 ? C.saffron : C.garnet;
    const m = new THREE.Mesh(
      slabGeo,
      track(
        new THREE.MeshStandardMaterial({
          color: hex(C.kite),
          emissive: hex(warm),
          emissiveIntensity: 0.5,
          roughness: 0.35,
          metalness: 0.6,
        }),
      ),
    );
    // Staggered depth so the row has perspective instead of reading flat.
    m.position.set(-6 + i * 7.4, -19 + (i % 3) * 1.2, -34 - (i % 2) * 6);
    m.userData.base = m.position.y;
    workGroup.add(m);
  }
  scene.add(workGroup);

  // === WORLD 5 — THE QUESTION ==============================================
  // One form, alone, lit hot. The open problem.
  const questionMat = track(
    new THREE.MeshStandardMaterial({
      color: hex(C.raspberry),
      emissive: hex(C.toxic),
      emissiveIntensity: 0.85,
      roughness: 0.25,
      metalness: 0.7,
      wireframe: true,
    }),
  );
  const question = new THREE.Mesh(
    track(new THREE.IcosahedronGeometry(5.2, 2)),
    questionMat,
  );
  question.position.set(12, 2, -60);
  scene.add(question);

  const questionCore = new THREE.Mesh(
    track(new THREE.IcosahedronGeometry(2.4, 1)),
    track(
      new THREE.MeshStandardMaterial({
        color: hex(C.kite),
        emissive: hex(C.creamy),
        emissiveIntensity: 0.5,
        roughness: 0.3,
      }),
    ),
  );
  questionCore.position.copy(question.position);
  scene.add(questionCore);

  // === WORLD 6 — ARRIVAL ===================================================
  // A ring you pass through, then nothing but space.
  const ring = new THREE.Mesh(
    track(new THREE.TorusGeometry(7, 0.055, 8, 96)),
    track(
      new THREE.MeshBasicMaterial({
        color: hex(C.saffron),
        transparent: true,
        opacity: 0.75,
      }),
    ),
  );
  ring.position.set(0, 0, -84);
  scene.add(ring);

  const farDustGeo = track(new THREE.BufferGeometry());
  {
    const n = 700;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = -50 - Math.random() * 60;
    }
    farDustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  }
  scene.add(
    new THREE.Points(
      farDustGeo,
      track(
        new THREE.PointsMaterial({
          color: hex(C.praxeti),
          size: 0.075,
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
        }),
      ),
    ),
  );

  // --- driving -------------------------------------------------------------
  let target = 0; // where scroll says we are
  let eased = 0; // where the camera actually is, damped
  let pointerX = 0;
  let pointerY = 0;
  let px = 0;
  let py = 0;
  let raf = 0;
  let running = true;

  const fogColour = new THREE.Color(hex(C.onyx));
  const nextFog = new THREE.Color();
  const lookAt = new THREE.Vector3();
  const focusNow = new THREE.Vector3();

  function frame(now: number) {
    if (!running) return;
    raf = requestAnimationFrame(frame);

    // Damping is what turns a scrollbar into a camera. Without it every
    // wheel notch reads as a jolt.
    eased += (target - eased) * (opts.still ? 1 : 0.075);
    px += (pointerX - px) * 0.05;
    py += (pointerY - py) * 0.05;

    const t = Math.min(0.999, Math.max(0, eased));
    CURVE.getPointAt(t, camera.position);

    // Aim: mostly at this chapter's subject, pulled toward the direction of
    // travel so turns still feel driven. Blends across the world boundary so
    // the camera swings rather than cuts.
    CURVE.getPointAt(Math.min(0.999, t + 0.05), lookAt);
    const fScaled = t * WORLDS.length;
    const fi = Math.min(FOCUS.length - 1, Math.floor(fScaled));
    const fj = Math.min(FOCUS.length - 1, fi + 1);
    focusNow.copy(FOCUS[fi]).lerp(FOCUS[fj], fScaled - fi);
    lookAt.lerp(focusNow, 0.62);
    lookAt.x += px * 3;
    lookAt.y += py * 2;
    camera.lookAt(lookAt);

    lamp.position.copy(camera.position);

    // Ground and fog cross-fade between adjacent worlds.
    const scaled = t * WORLDS.length;
    const idx = Math.min(WORLDS.length - 1, Math.floor(scaled));
    const nextIdx = Math.min(WORLDS.length - 1, idx + 1);
    const blend = scaled - idx;
    fogColour.set(hex(WORLDS[idx].fog));
    nextFog.set(hex(WORLDS[nextIdx].fog));
    fogColour.lerp(nextFog, blend);
    renderer.setClearColor(fogColour, 1);
    (scene.fog as THREE.FogExp2).color.copy(fogColour);
    lamp.color.set(hex(WORLDS[idx].accent));

    const s = opts.still ? 0 : now * 0.001;

    // Portrait fades up on approach and away once passed.
    const pOpacity = Math.max(0, 1 - Math.abs(t - 0.045) / 0.075);
    (portrait.material as THREE.MeshBasicMaterial).opacity = pOpacity;
    portraitFrameMat.opacity = pOpacity * 0.9;
    portraitEchoMat.opacity = pOpacity * 0.32;
    portraitEcho.rotation.z = Math.sin(s * 0.25) * 0.02;

    dust.rotation.y = s * 0.012;

    originGroup.children.forEach((c) => {
      if (c.userData.spin) c.rotation.y = s * c.userData.spin;
    });

    foundation.rotation.y = Math.sin(s * 0.09) * 0.05;

    workGroup.children.forEach((c, i) => {
      c.rotation.y = s * 0.06 + i * 0.1;
      c.position.y = (c.userData.base as number) + Math.sin(s * 0.5 + i) * 0.5;
    });

    question.rotation.x = s * 0.14;
    question.rotation.y = s * 0.19;
    questionCore.rotation.x = -s * 0.22;
    questionCore.rotation.y = -s * 0.17;

    ring.rotation.z = s * 0.08;

    renderer.render(scene, camera);
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    // Cap the pixel ratio — a retina display at full ratio quadruples the
    // fragment work for no visible gain on a scene this soft.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  resize();
  raf = requestAnimationFrame(frame);

  return {
    setProgress(t) {
      target = t;
      if (opts.still) eased = t;
    },
    setPointer(x, y) {
      pointerX = x;
      pointerY = y;
    },
    resize,
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      disposables.forEach((d) => d.dispose());
      portraitTex.dispose();
      renderer.dispose();
      // Hand the WebGL context back. Without this the canvas keeps a dead
      // context and the next renderer built on it fails — which in React's
      // development double-mount means the second, real instance never starts.
      renderer.forceContextLoss();
    },
  };
}
