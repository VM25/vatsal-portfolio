import type { NavItem } from "@/types";

// Section anchors in document order. Drives the contents block, the running
// header, and the scrollspy. The masthead and colophon carry no numeral —
// they are the covers, not sections.
export const navItems: NavItem[] = [
  { id: "masthead", label: "Masthead" },
  { id: "abstract", label: "Abstract", numeral: "01" },
  { id: "methods", label: "Methods", numeral: "02" },
  { id: "systems", label: "Systems", numeral: "03" },
  { id: "record", label: "Record", numeral: "04" },
  { id: "research", label: "Research", numeral: "05" },
  { id: "correspondence", label: "Correspondence", numeral: "06" },
];

export const sectionIds = navItems.map((n) => n.id);

/** Everything except the masthead — what the contents block lists. */
export const contents = navItems.filter((n) => n.numeral);
