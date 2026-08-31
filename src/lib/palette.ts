/**
 * The full brand palette. Every one of these is used somewhere in the journey —
 * as a light, a material, a surface or type — not parked in a token file.
 */
export const C = {
  // blacks
  noir: "#1b1716",
  carbon: "#171717",
  onyx: "#020202",
  raspberry: "#14130a",
  // whites
  praxeti: "#f6f7ed",
  snow: "#ececdc",
  creamy: "#ffecc3",
  arctic: "#f1f6f4",
  // blues
  aqua: "#a0c9cb",
  blue: "#004e72",
  navy: "#092634",
  midnight: "#001f3f",
  nocturnal: "#114c5a",
  oceanic: "#172b36",
  // oranges
  saffron: "#ff9932",
  toxic: "#ff6037",
  garnet: "#733635",
  kite: "#351e1c",
} as const;

export type ColourName = keyof typeof C;

/** Hex → 0xRRGGBB for three.js. */
export const hex = (c: string) => parseInt(c.replace("#", ""), 16);

/**
 * Six worlds the camera travels through. Each owns a slice of the palette so
 * that across the whole journey every colour above does real work.
 */
export const WORLDS = [
  {
    id: "approach",
    name: "Approach",
    ground: C.onyx,
    fog: C.onyx,
    key: C.praxeti,
    fill: C.aqua,
    accent: C.saffron,
  },
  {
    id: "origin",
    name: "Origin",
    ground: C.midnight,
    fog: C.midnight,
    key: C.arctic,
    fill: C.nocturnal,
    accent: C.aqua,
  },
  {
    id: "foundation",
    name: "Foundation",
    ground: C.carbon,
    fog: C.oceanic,
    key: C.snow,
    fill: C.blue,
    accent: C.aqua,
  },
  {
    id: "work",
    name: "The Work",
    ground: C.navy,
    fog: C.navy,
    key: C.creamy,
    fill: C.garnet,
    accent: C.saffron,
  },
  {
    id: "question",
    name: "The Question",
    ground: C.raspberry,
    fog: C.kite,
    key: C.creamy,
    fill: C.toxic,
    accent: C.toxic,
  },
  {
    id: "arrival",
    name: "Arrival",
    ground: C.noir,
    fog: C.noir,
    key: C.praxeti,
    fill: C.aqua,
    accent: C.saffron,
  },
] as const;

export type World = (typeof WORLDS)[number];
