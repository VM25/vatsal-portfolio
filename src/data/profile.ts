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

  /** The route actually taken. Drives the second chapter. */
  route: [
    { place: "Mumbai", note: "Where it starts" },
    { place: "Arizona", note: "Computer science", study: "asu" },
    { place: "New Jersey", note: "Financial engineering", study: "stevens" },
  ],

  status: "Graduating December 2026, and looking for full-time quantitative roles from January 2027.",
  availability: "Graduating December 2026 · open to full-time roles",
  interests: ["Trading", "Research", "Derivatives", "Risk"],
  email: "vatsalmaniar2003@gmail.com",
  phone: "+1 (571) 396-1185",
} as const;

export const links = {
  resume: "/resume/Maniar_Vatsal.pdf",
  prospectus: "/research/Maniar-Research-Prospectus.pdf",
  ssrn: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7469079",
  linkedin: "https://www.linkedin.com/in/vatsal-maniar/",
  github: "https://github.com/VM25",
  email: `mailto:${profile.email}`,
} as const;
