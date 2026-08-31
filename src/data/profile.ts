export const profile = {
  name: "Vatsal Maniar",
  location: "Jersey City, New Jersey",

  /** The hero. Three words, set very large. */
  heroLine: ["Measuring", "what", "risk"],

  /** Sits under the name. Plain sentence, no jargon. */
  standfirst:
    "I build systems that measure risk — across interest rates, currencies, credit and portfolios — and I publish the answers that came out wrong as readily as the ones that came out right.",

  /** The one pull quote on the page. */
  quote:
    "A number you cannot explain is not a measurement. It is a guess with decimal places.",

  /** About section. Written to be read by a person, not scanned by a filter. */
  about: [
    "I came to finance through computer science, which is an unusual order to do it in and turns out to be the useful one. Building things taught me that a result you cannot reproduce is not a result, and that habit is the thing I actually brought with me.",
    "Now I work on the measurement side of markets — what a position is worth, what it could lose, and which part of it is responsible. Seven of those systems are on this page. Two of them concluded that the clever idea did not beat the simple one, and I have left those conclusions where they are.",
  ],

  status: "Looking for a quantitative role — Fall 2026 internship, full-time 2027.",
  availability: "Available Fall 2026",
  interests: ["Trading", "Research", "Derivatives", "Risk"],
  certification: "FRM Part I candidate, August 2026",
  email: "vatsalmaniar2003@gmail.com",
  phone: "+1 (571) 396-1185",
} as const;

export const links = {
  resume: "/resume/Maniar_Vatsal.pdf",
  memo: "/research/Maniar-Research-Memo.pdf",
  prospectus: "/research/Maniar-Research-Prospectus.pdf",
  linkedin: "https://www.linkedin.com/in/vatsal-maniar/",
  github: "https://github.com/VM25",
  email: `mailto:${profile.email}`,
} as const;
