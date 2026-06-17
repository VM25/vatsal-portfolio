import type { NavItem } from "@/types";

// Section anchors, in document order. Drives both the in-page nav and scrollspy.
export const navItems: NavItem[] = [
  { id: "home", label: "Home" },
  { id: "origin", label: "Origin" },
  { id: "capabilities", label: "Capabilities" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "research", label: "Research" },
  { id: "contact", label: "Contact" },
];

export const sectionIds = navItems.map((n) => n.id);
