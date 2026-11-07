/** Figures are [value, label] pairs, e.g. ["10", "shock scenarios"]. */
export type FigurePair = [string, string];

export interface RailProject {
  title: string;
  field: string;
  year: string;
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

export interface Study {
  id: string;
  school: string;
  degree: string;
  detail: string;
}
