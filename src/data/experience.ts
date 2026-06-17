import type { ExperienceItem } from "@/types";

// Relevant history since Oct 2021, sourced from LinkedIn. Each role carries a
// short professional `tag` for the timeline (its category) and a separate
// `metric` shown in the detail card (its impact) - the two complement rather
// than repeat. Prose is written fresh for this site, kept specific and plain.
export const experience: ExperienceItem[] = [
  {
    id: "alcove-ridge",
    org: "Alcove Ridge Consulting",
    role: "Software & Platform Development Intern",
    location: "Remote",
    period: "Sep 2024 - Jun 2025",
    tag: "Platform build",
    frame: "Built the analytics and reporting platform for a private-markets investment book.",
    metric: { value: "End-to-end", label: "UI · workflow · data layer" },
    bullets: [
      "Built a private-markets analytics platform end to end - the interface, the front-end, and the workflow and data layer behind it.",
      "Designed reporting views across a book of private-market positions and reconciled data between modules so analysts could trust the output.",
      "Scoped, built, and presented the engagement directly to the client.",
    ],
  },
  {
    id: "asu-eoss",
    org: "ASU · EOSS Technology Team",
    role: "IT Project Management Consultant",
    location: "Tempe, AZ",
    period: "Jun 2024 - Sep 2024",
    tag: "Project mgmt",
    frame: "Performance analysis and milestone tracking across institutional technology systems.",
    metric: { value: "Multi-track", label: "concurrent IT initiatives" },
    bullets: [
      "Profiled performance across institutional systems and turned bottlenecks into measurable improvement targets.",
      "Tracked milestones and documentation across several concurrent technology initiatives to keep them on schedule.",
    ],
  },
  {
    id: "asu-cam",
    org: "ASU · Capital Assets Management",
    role: "Asset Management Specialist",
    location: "Tempe, AZ",
    period: "May 2024 - May 2025",
    tag: "Asset controls",
    frame: "Controls and reconciliation across a large institutional asset book.",
    metric: { value: "$1.5B", label: "asset book reconciled" },
    bullets: [
      "Reconciled records across a $1.5B asset book and held data integrity near-perfect under sponsor-audit scrutiny.",
      "Set traceability standards for high-value infrastructure and software assets so ownership and valuation stayed defensible.",
    ],
  },
  {
    id: "asu-ugta",
    org: "ASU · Ira A. Fulton Schools of Engineering",
    role: "Undergraduate Teaching Assistant",
    location: "Tempe, AZ",
    period: "Aug 2023 - Dec 2023",
    tag: "Teaching",
    frame: "Teaching and lab support for foundational engineering coursework.",
    metric: { value: "Eng. core", label: "labs & grading" },
    bullets: [
      "Coached students through foundational engineering problems, making abstract material easier to reason about.",
      "Ran lab sections and kept grading turnaround tight without lowering the bar.",
    ],
  },
  {
    id: "asu-verification",
    org: "ASU · Admission Services",
    role: "Verification Supervisor",
    location: "Tempe, AZ",
    period: "May 2022 - May 2024",
    tag: "Ops lead",
    frame: "Led a high-volume, compliance-sensitive verification operation.",
    metric: { value: "60-person", label: "team · 98% accuracy" },
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
    period: "Oct 2021 - May 2022",
    tag: "Data QA",
    frame: "Validated large volumes of records inside compliance-bound workflows.",
    metric: { value: "10k+", label: "records validated" },
    bullets: [
      "Validated tens of thousands of structured records at high accuracy under strict data-integrity rules.",
      "Streamlined intake and documentation to move more volume without dropping quality.",
    ],
  },
];

export const honors = ["Magna Cum Laude - Arizona State University"];
