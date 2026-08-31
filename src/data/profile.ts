// Identity and canonical links. Sourced from the résumé, LinkedIn, and the
// repositories themselves — nothing here is invented.

export const profile = {
  name: "Vatsal Maniar",
  shortName: "Vatsal",
  location: "Jersey City, NJ",
  region: "New York City metro",
  email: "vatsalmaniar2003@gmail.com",
  phone: "+1 (571) 396-1185",

  /** Masthead standfirst. One sentence, no hedging. */
  thesis:
    "I build risk systems that turn uncertainty into something you can price, hedge, and explain — and I publish the results that don't work.",

  /** Sits under the standfirst. The claim the record has to support. */
  positioning:
    "Seven systems across rates, FX, credit, allocation, and derivatives numerics. Every figure on this page reconciles to a committed artifact.",

  degreeLine:
    "M.S. Financial Engineering, Stevens Institute of Technology · B.S. Computer Science, Arizona State University",

  summary:
    "MFE candidate with a Computer Science foundation, building Treasury rates-risk attribution engines, FX options risk frameworks, credit and payments decision engines, multi-asset allocation analytics, systematic signal research, and C++ derivatives numerics. The through-line is measurement: curve-shock attribution, Monte Carlo VaR/ES, Greeks, factor exposure, calibration, and validation evidence.",

  status:
    "Open to a Fall 2026 quant co-op / internship and Full-Time 2027 roles across quant trading, quant research, derivatives, and risk.",

  availability: "Fall 2026 Co-op · Full-Time 2027",

  targets: ["Quant Trading", "Quant Research", "Derivatives Risk", "Market-Making"],

  certification: "GARP Financial Risk Manager (FRM) — Part I Candidate, Aug 2026",

  /** Set in the colophon. */
  edition: "Fourth edition",
} as const;

export const links = {
  resume: "/resume/Maniar_Vatsal.pdf",
  memo: "/research/Maniar-Research-Memo.pdf",
  prospectus: "/research/Maniar-Research-Prospectus.pdf",
  linkedin: "https://www.linkedin.com/in/vatsal-maniar/",
  github: "https://github.com/VM25",
  email: `mailto:${profile.email}`,
} as const;
