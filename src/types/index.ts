// Shared domain types for the portfolio content layer.

export interface NavItem {
  id: string;
  label: string;
}

export interface SkillGroup {
  id: string;
  title: string;
  blurb: string;
  /** Instruments inside the lab — rendered as data readouts, not pills. */
  skills: string[];
}

export type ProjectLinkKind = "live" | "repo" | "doc";

export interface ProjectLink {
  label: string;
  href: string;
  kind: ProjectLinkKind;
}

/** Only ever populated from evidence (resume / repo). Never fabricated. */
export interface ProjectMetric {
  value: string;
  label: string;
}

/** ApexGP-style mapping of market primitives onto the event domain. */
export interface MarketMapping {
  market: string;
  domain: string;
}

export interface Project {
  id: string;
  /** Short domain/category label, e.g. "Probabilistic Pricing". */
  tag: string;
  title: string;
  /** Institutional, one-line framing. */
  framing: string;
  period: string;
  stackLabel: string;
  /** The problem the system addresses. */
  problem: string;
  /** Methods / techniques actually used (evidence-backed). */
  methods: string[];
  /** Finance concepts demonstrated. */
  concepts: string[];
  /** Technical stack. */
  stack: string[];
  /** Evidence bullets, lifted from the resume / LinkedIn. */
  evidence: string[];
  /** What a recruiter should take away. */
  takeaway: string;
  /** Forward-looking extensions — kept explicitly separate from shipped work. */
  roadmap?: string[];
  links: ProjectLink[];
  metrics?: ProjectMetric[];
  mapping?: MarketMapping[];
  accent: "amber" | "copper" | "gold" | "ember";
}

export interface ExperienceItem {
  id: string;
  org: string;
  role: string;
  location: string;
  period: string;
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

export interface ResearchThread {
  title: string;
  body: string;
}
