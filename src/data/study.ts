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
    school: "Arizona State University",
    degree: "B.S. Computer Science",
    detail: "Aug 2021 – May 2025 · GPA 3.74 · Magna Cum Laude",
  },
  {
    id: "stevens",
    school: "Stevens Institute of Technology",
    degree: "M.S. Financial Engineering",
    detail: "Sep 2025 – Dec 2026 · GPA 3.67 · Graduate Certificate in Financial Risk Engineering",
  },
];

/** The only place the FRM appears on the site. */
export const frm = {
  text: "GARP FRM Part 1 Candidate · November 2026",
  body: "GARP",
  title: "FRM Part 1 Candidate",
  full: "Financial Risk Manager",
  sitting: "sitting November 2026",
} as const;
