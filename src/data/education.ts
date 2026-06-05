import type { EducationItem } from "@/types";

export const education: EducationItem[] = [
  {
    id: "stevens",
    school: "Stevens Institute of Technology",
    degree: "M.S. Financial Engineering",
    detail: "GPA 3.67 / 4.00 · Graduate Certificate in Financial Risk Engineering",
    period: "Sep 2025 – Dec 2026 (expected)",
    location: "Hoboken, NJ",
    coursework: [
      "Stochastic Calculus",
      "Pricing & Hedging",
      "Advanced Derivatives",
      "Computational Methods in Finance",
      "Market Microstructure & Trading",
      "Risk Engineering & Management",
    ],
  },
  {
    id: "asu",
    school: "Arizona State University",
    degree: "B.S. Computer Science",
    detail: "GPA 3.74 / 4.00 · Magna Cum Laude",
    period: "Aug 2021 – May 2025",
    location: "Tempe, AZ",
    coursework: [
      "Data Structures & Algorithms",
      "Systems Programming (C++)",
      "Software Engineering",
      "Operating Systems",
      "Probability & Statistics",
      "Numerical Computing",
    ],
    honors: ["Magna Cum Laude"],
  },
];
