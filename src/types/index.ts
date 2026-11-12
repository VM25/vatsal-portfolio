/** Figures are [value, label] pairs, e.g. ["10", "shock scenarios"]. */
export type FigurePair = [string, string];

export interface RailProject {
  title: string;
  field: string;
  question: string;
  result: string;
  figures: FigurePair[];
  live: string;
  code: string;
}

export interface Post {
  id: string;
  role: string;
  org: string;
  period: string;
}

/** The school and degree are in the route note; this is the line under it. */
export interface Study {
  id: string;
  /** One fact per line: dates, grade, honours. */
  detail: string[];
}
