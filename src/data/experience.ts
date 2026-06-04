import type { ExperienceItem } from "@/types";

// Relevant history since Oct 2021, sourced from LinkedIn. Bullets are written
// fresh for this site (not copied from the résumé/LinkedIn) and stay
// public-facing: finance-adjacent where the role is, operational/analytical/
// technical where it is.
export const experience: ExperienceItem[] = [
  {
    id: "alcove-ridge",
    org: "Alcove Ridge Consulting",
    role: "Software & Platform Development Intern",
    location: "Remote",
    period: "Sep 2024 – Jun 2025",
    frame: "Analytics and reporting infrastructure for private-market investments.",
    bullets: [
      "Turned manual reporting into a repeatable pipeline — automating P&L and capital-deployment views across a book of private-market positions.",
      "Modeled scenarios and risk-adjusted returns across asset classes, and reconciled data between modules so analysts could trust the output without re-checking it.",
      "Owned the engagement largely solo — scoping, building, and presenting the analysis end to end.",
    ],
  },
  {
    id: "asu-eoss",
    org: "ASU · EOSS Technology Team",
    role: "IT Project Management Consultant",
    location: "Tempe, AZ",
    period: "Jun 2024 – Sep 2024",
    frame: "Performance analysis across institutional technology systems.",
    bullets: [
      "Profiled performance across institutional systems and translated bottlenecks into measurable improvement targets.",
      "Built KPI baselines and milestone tracking across concurrent technology initiatives, tightening delivery and reducing rework.",
    ],
  },
  {
    id: "asu-cam",
    org: "ASU · Capital Assets Management",
    role: "Asset Management Specialist",
    location: "Tempe, AZ",
    period: "May 2024 – May 2025",
    frame: "Controls and reconciliation across a $1.5B institutional asset book.",
    bullets: [
      "Reconciled records across a large asset book and held data integrity near-perfect under sponsor-audit scrutiny.",
      "Designed traceability standards for high-value infrastructure and software assets so ownership and valuation stayed defensible end to end.",
    ],
  },
  {
    id: "asu-ugta",
    org: "ASU · Ira A. Fulton Schools of Engineering",
    role: "Undergraduate Teaching Assistant",
    location: "Tempe, AZ",
    period: "Aug 2023 – Dec 2023",
    frame: "Teaching and support for foundational engineering coursework.",
    bullets: [
      "Coached students through foundational engineering problems, turning abstract material into something they could reason about.",
      "Ran lab sections and tightened grading turnaround without lowering the bar.",
    ],
  },
  {
    id: "asu-verification",
    org: "ASU · Admission Services",
    role: "Verification Supervisor",
    location: "Tempe, AZ",
    period: "May 2022 – May 2024",
    frame: "Leading a high-volume, compliance-sensitive verification operation.",
    bullets: [
      "Led a 60-person team processing tens of thousands of records a year, setting throughput benchmarks while holding accuracy at 98%.",
      "Rebuilt quality-control and audit documentation so the operation stayed clean through repeated compliance cycles.",
    ],
  },
  {
    id: "asu-data-analyst",
    org: "ASU · Admission Services",
    role: "Data Analyst (Verifier)",
    location: "Tempe, AZ",
    period: "Oct 2021 – May 2022",
    frame: "Validating large volumes of records inside compliance-bound workflows.",
    bullets: [
      "Validated tens of thousands of structured records at high accuracy under strict data-integrity rules.",
      "Streamlined intake and documentation to move more volume without dropping quality.",
    ],
  },
];

export const honors = ["Magna Cum Laude — Arizona State University"];
