// Identity + canonical links. Sourced from résumé and LinkedIn — no invented facts.

export const profile = {
  name: "Vatsal Maniar",
  shortName: "Vatsal",
  location: "Jersey City, NJ",
  region: "New York City metro",
  email: "vatsalmaniar2003@gmail.com",
  phone: "+1 (571) 396-1185",

  // Discipline chips for the hero.
  disciplines: [
    "Quant Finance",
    "Derivatives Risk",
    "Trading Systems",
    "Portfolio Engineering",
  ],

  degreeLine:
    "M.S. Financial Engineering, Stevens Institute of Technology · B.S. Computer Science, Arizona State University",

  // Primary positioning line (provided by Vatsal).
  positioning:
    "Building market-risk systems, probabilistic pricing engines, and portfolio analytics at the intersection of financial engineering and software.",

  // LinkedIn thesis line.
  thesis:
    "I build quantitative models that turn uncertainty into something you can price, hedge, and explain.",

  trajectory:
    "Mumbai → Arizona → New Jersey → New York. The trajectory is intentional.",

  // Adapted from résumé summary — kept accurate.
  summary:
    "MFE candidate with a Computer Science foundation, building derivatives pricing engines, MLE-calibrated stochastic risk models, and live options market-making systems. Core work spans Monte Carlo simulation, VaR/CVaR, options Greeks, fixed-income analytics, and systematic trading frameworks.",

  status:
    "Recruiting for 2026 internships and co-ops across quant trading, quant research, derivatives, and risk.",

  certification: "GARP Financial Risk Manager (FRM) — Part I Candidate, Aug 2026",
} as const;

export const links = {
  resume: "/resume/Vatsal-Maniar-Resume.pdf",
  linkedin: "https://www.linkedin.com/in/vatsal-maniar/",
  github: "https://github.com/VM25",
  email: `mailto:${profile.email}`,
  apexgpLive: "https://apexgp-markets.netlify.app",
  apexgpRepo: "https://github.com/VM25/apexgp-markets",
  // Kept only as an internal reference of what NOT to repeat — never surfaced prominently.
  oldPortfolio: "https://maniar-portfolio.netlify.app",
} as const;
