// Identity + canonical links. Sourced from résumé and LinkedIn - no invented facts.

export const profile = {
  name: "Vatsal Maniar",
  shortName: "Vatsal",
  location: "Jersey City, NJ",
  region: "New York City metro",
  email: "vatsalmaniar2003@gmail.com",
  phone: "+1 (571) 396-1185",

  // Discipline chips for the hero.
  disciplines: [
    "Derivatives Risk",
    "Rates & Fixed Income",
    "Portfolio Analytics",
    "Quant Software",
  ],

  degreeLine:
    "M.S. Financial Engineering, Stevens Institute of Technology · B.S. Computer Science, Arizona State University",

  // Primary positioning line.
  positioning:
    "Building market-risk systems, probabilistic pricing engines, and portfolio analytics at the intersection of financial engineering and software.",

  // Hero thesis line.
  thesis:
    "I build quantitative models that turn uncertainty into something you can price, hedge, and explain.",

  trajectory:
    "Mumbai → Arizona → New Jersey → New York. The trajectory is intentional.",

  // Accurate one-paragraph summary of the current body of work.
  summary:
    "MFE candidate with a Computer Science foundation, building Treasury rates-risk attribution engines, FX options risk frameworks, multi-asset portfolio analytics, and probabilistic event-market pricing systems. Core work spans curve-shock attribution, Monte Carlo VaR/ES, options Greeks, factor exposure, and hedge analysis.",

  status:
    "Open to a Fall 2026 quant co-op / internship and Full-Time 2027 roles - across quant trading, quant research, derivatives, and risk.",

  availability: "Fall 2026 Co-op / Internship · Full-Time 2027",

  targets: ["Quant Trading", "Quant Research", "Derivatives Risk", "Market-Making"],

  certification: "GARP Financial Risk Manager (FRM) - Part I Candidate, Aug 2026",
} as const;

export const links = {
  resume: "/resume/Vatsal-Maniar-Resume.pdf",
  writingSample: "/research/Maniar-Writing-Sample.pdf",
  linkedin: "https://www.linkedin.com/in/vatsal-maniar/",
  github: "https://github.com/VM25",
  email: `mailto:${profile.email}`,
  apexgpLive: "https://apexgp-markets.netlify.app",
  apexgpRepo: "https://github.com/VM25/apexgp-markets",
} as const;
