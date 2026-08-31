import type { Post } from "@/types";

/** Where I have worked. Closed, each is a role and a place. */
export const posts: Post[] = [
  {
    id: "alcove-ridge",
    role: "Software & Platform Development Intern",
    org: "Alcove Ridge Consulting",
    period: "Sep 2024 — Jun 2025",
    location: "Remote",
    detail:
      "Built the reporting platform a private-markets investor uses to see what they own — the interface, the workflow behind it, and the data underneath.",
    points: [
      "Designed the reporting views across a book of private-market positions.",
      "Reconciled the numbers between parts of the system so analysts could trust what they saw.",
      "Scoped the work, built it, and presented it to the client myself.",
    ],
    figure: { value: "End to end", label: "Sole builder" },
  },
  {
    id: "asu-cam",
    role: "Asset Management Specialist",
    org: "Arizona State University",
    period: "May 2024 — May 2025",
    location: "Tempe, AZ",
    detail:
      "Kept the records straight on a very large book of university assets, under the kind of scrutiny where being approximately right is not good enough.",
    points: [
      "Reconciled a $1.5B book and held accuracy near perfect through sponsor audits.",
      "Set the standards for tracking high-value equipment so ownership and value stayed defensible.",
    ],
    figure: { value: "$1.5B", label: "Book reconciled" },
  },
  {
    id: "asu-verification",
    role: "Verification Supervisor",
    org: "Arizona State University",
    period: "May 2022 — May 2024",
    location: "Tempe, AZ",
    detail:
      "Ran a large team processing tens of thousands of records a year, where a mistake was expensive and the volume never stopped.",
    points: [
      "Led 60 people, set the pace, and held accuracy at 98%.",
      "Rebuilt the quality checks so the operation stayed clean through repeated audits.",
    ],
    figure: { value: "60", label: "People led" },
  },
  {
    id: "asu-eoss",
    role: "IT Project Management Consultant",
    org: "Arizona State University",
    period: "Jun 2024 — Sep 2024",
    location: "Tempe, AZ",
    detail:
      "Found where university systems were slow, turned that into targets someone could actually hit, and kept several projects moving at once.",
    points: [
      "Turned performance bottlenecks into measurable improvement targets.",
      "Tracked milestones across concurrent initiatives to keep them on schedule.",
    ],
    figure: { value: "Multi-track", label: "Concurrent projects" },
  },
  {
    id: "asu-ugta",
    role: "Undergraduate Teaching Assistant",
    org: "Arizona State University",
    period: "Aug 2023 — Dec 2023",
    location: "Tempe, AZ",
    detail:
      "Taught first-year engineering students the parts of the course that most people get stuck on.",
    points: [
      "Coached students through the problems that are hard to picture.",
      "Ran labs and returned marked work fast without lowering the bar.",
    ],
    figure: { value: "Engineering core", label: "Labs and grading" },
  },
  {
    id: "asu-data-analyst",
    role: "Data Analyst",
    org: "Arizona State University",
    period: "Oct 2021 — May 2022",
    location: "Tempe, AZ",
    detail:
      "Checked tens of thousands of records against strict rules, and made the checking faster without letting the quality slip.",
    points: [
      "Validated records at high accuracy under strict rules.",
      "Streamlined intake so more volume moved through without more mistakes.",
    ],
    figure: { value: "10,000+", label: "Records validated" },
  },
];

export const honour = "Magna Cum Laude, Arizona State University";
