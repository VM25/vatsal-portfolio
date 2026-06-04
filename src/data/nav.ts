import type { NavItem } from "@/types";

// Section anchors used across the page. The full ordered set drives scrollspy;
// the nav itself only surfaces a curated subset so it never dominates.
export const sectionIds = [
  "hero",
  "origin",
  "arsenal",
  "work",
  "apexgp",
  "market-making",
  "portfolio",
  "rates-fx",
  "experience",
  "research",
  "contact",
] as const;

export type SectionId = (typeof sectionIds)[number];

export const navItems: NavItem[] = [
  { id: "origin", label: "Origin" },
  { id: "arsenal", label: "Arsenal" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "research", label: "Research" },
  { id: "contact", label: "Contact" },
];
