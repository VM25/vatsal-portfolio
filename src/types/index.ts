// Shape of the record. Every field here is filled from a real repo, paper, or
// résumé line — the site has no slot that can only be filled by invention.

export interface Metric {
  /** The figure itself. Set in mono, always. */
  value: string;
  /** What the figure measures. Sentence case, no trailing period. */
  label: string;
}

/** Which figure a system publishes alongside its entry. */
export type PlateKey =
  | "apexgp"
  | "yieldshock"
  | "pra"
  | "fxlab"
  | "credits"
  | "alpha"
  | "diffusion";

export interface System {
  id: PlateKey;
  /** Catalogue reference, e.g. "S-03". Ordering is editorial, not chronological. */
  ref: string;
  /** Plate number for the figure that accompanies this entry. */
  plate: number;
  /** Discipline, set as an eyebrow. */
  field: string;
  title: string;
  /** One line for the index table. Must fit on a single row at 1280px. */
  short: string;
  /** Two or three sentences for the full entry. */
  abstract: string;
  /**
   * The result, stated plainly — including when it is negative. This is the
   * field that separates a lab from a landing page, so it is required.
   */
  finding: string;
  metrics: Metric[];
  /** What was actually built. Verbs, not adjectives. */
  record: string[];
  /** Languages and libraries, for the index table's right column. */
  stack: string[];
  website?: string;
  github?: string;
}

export interface MethodGroup {
  id: string;
  title: string;
  blurb: string;
  skills: string[];
  /** Systems this shows up in — keeps capability wired to evidence. */
  appearsIn: PlateKey[];
}

export interface LedgerEntry {
  id: string;
  org: string;
  role: string;
  location: string;
  period: string;
  /** Category of the work, for the ledger's left rail. */
  tag: string;
  frame: string;
  metric: Metric;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  detail: string;
  period: string;
  location: string;
  coursework: string[];
  honors?: string[];
}

export interface NavItem {
  id: string;
  label: string;
  /** Section numeral, e.g. "01". Masthead and colophon carry none. */
  numeral?: string;
}
