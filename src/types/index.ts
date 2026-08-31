/**
 * Two levels for everything on this page: what you see, and what you get when
 * you ask. Nothing in the second level is shown until someone opens it.
 */

export interface Figure {
  value: string;
  label: string;
}

export interface Work {
  id: string;
  /** Shown closed: the name. */
  title: string;
  /** Shown closed: the field it belongs to. */
  field: string;
  /** Shown closed: when it was built. */
  year: string;
  /** Opened: what it is, in two or three sentences. */
  detail: string;
  /** Opened: what it actually established — including when the answer was no. */
  result: string;
  /** Opened: the numbers that matter. */
  figures: Figure[];
  live?: string;
  code?: string;
}

export interface Post {
  id: string;
  role: string;
  org: string;
  period: string;
  location: string;
  /** Opened: what the work was. */
  detail: string;
  /** Opened: two or three specifics. */
  points: string[];
  /** Opened: the one number worth remembering. */
  figure: Figure;
}

export interface Study {
  id: string;
  school: string;
  degree: string;
  detail: string;
  period: string;
  location: string;
  courses: string[];
}
