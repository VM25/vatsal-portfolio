import type { Study } from "@/types";

/** Path data. The route, the two degrees and the credential live here and nowhere else. */
export const route = [
  { place: "Mumbai", note: "Where it starts." },
  { place: "Arizona", note: "B.S. Computer Science, Arizona State University", study: "asu" },
  {
    place: "New Jersey",
    note: "M.S. Financial Engineering, Stevens Institute of Technology",
    study: "stevens",
  },
] as const;

export const study: Study[] = [
  {
    id: "asu",
    detail: "Aug 2021 – May 2025 · GPA 3.74 · Magna Cum Laude",
  },
  {
    id: "stevens",
    detail: "Sep 2025 – Dec 2026 · GPA 3.67 · Graduate Certificate in Financial Risk Engineering",
  },
];

/** The only place the FRM appears on the site; Path renders it as "GARP FRM Part 1 Candidate" and "… sitting November 2026". */
export const frm = {
  body: "GARP",
  title: "FRM Part 1 Candidate",
  full: "Financial Risk Manager",
  sitting: "sitting November 2026",
} as const;
