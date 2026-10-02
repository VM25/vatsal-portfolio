import type { Study } from "@/types";

export const study: Study[] = [
  {
    id: "stevens",
    school: "Stevens Institute of Technology",
    degree: "M.S. Financial Engineering",
    detail: "GPA 3.67 · Graduate Certificate in Financial Risk Engineering",
    period: "Sep 2025 — Dec 2026",
    location: "Hoboken, NJ",
    courses: [
      "Stochastic Calculus",
      "Pricing & Hedging",
      "Advanced Derivatives",
      "Computational Finance",
      "Portfolio Theory",
      "Risk Management",
    ],
  },
  {
    id: "asu",
    school: "Arizona State University",
    degree: "B.S. Computer Science",
    detail: "GPA 3.74 · Magna Cum Laude",
    period: "Aug 2021 — May 2025",
    location: "Tempe, AZ",
    courses: [
      "Data Structures & Algorithms",
      "Systems Programming",
      "Software Engineering",
      "Operating Systems",
      "Probability & Statistics",
      "Numerical Computing",
    ],
  },
];

/** The one place the FRM appears on the site. */
export const credential = {
  body: "GARP",
  title: "FRM Part 1 Candidate",
  full: "Financial Risk Manager",
  sitting: "November 2026",
} as const;
