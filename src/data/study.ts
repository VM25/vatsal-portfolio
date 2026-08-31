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
      "Market Microstructure",
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
