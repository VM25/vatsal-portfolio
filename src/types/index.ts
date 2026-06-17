// Shared domain types for the portfolio content layer.

export interface NavItem {
  id: string;
  label: string;
}

export interface SkillGroup {
  id: string;
  title: string;
  blurb: string;
  skills: string[];
  /** Project ids this capability shows up in - wires skills to evidence. */
  appearsIn: string[];
}

/** Only ever populated from evidence (resume / repo). Never fabricated. */
export interface ProjectMetric {
  value: string;
  label: string;
}

/** Which custom instrument renders for a project card. */
export type ProjectVisual = "apexgp" | "rates" | "portfolio" | "fx";

export interface Project {
  id: string;
  /** Short domain/category label, e.g. "Rates Risk". */
  category: string;
  title: string;
  /** The descriptive subtitle shown under the title. */
  subtitle: string;
  /** Three metric cards. */
  metrics: ProjectMetric[];
  /** "On The Record" evidence bullets. */
  record: string[];
  tags: string[];
  website?: string;
  github?: string;
  /** Key selecting the project's bespoke visual. */
  visual: ProjectVisual;
}

export interface ExperienceItem {
  id: string;
  org: string;
  role: string;
  location: string;
  period: string;
  /** Short professional category shown on the timeline (complements `metric`). */
  tag: string;
  /** Honest positioning of the role (operational / analytical / technical). */
  frame: string;
  /** At-a-glance impact, surfaced without a click. */
  metric: { value: string; label: string };
  bullets: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  detail: string;
  period: string;
  location: string;
  coursework?: string[];
  honors?: string[];
}
