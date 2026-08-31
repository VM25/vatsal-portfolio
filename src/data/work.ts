import type { Work } from "@/types";

/**
 * Seven things I built. Closed, each is a name and a field — the detail only
 * appears if someone wants it. Every number below comes from the work itself.
 */
export const work: Work[] = [
  {
    id: "yieldshock",
    title: "YieldShock",
    field: "Interest rates",
    year: "2026",
    detail:
      "When interest rates move, a bond portfolio loses or gains money for several different reasons at once. This takes a Treasury portfolio, puts it through the rate moves of an inflationary year, and separates the result into the individual causes — so a loss stops being one number and becomes an explanation.",
    result:
      "Replaying 2022, almost the entire loss on a long-dated portfolio came from real interest rates rising, not from inflation expectations — which barely moved the needle. Hedging it back recovered less than a third.",
    figures: [
      { value: "10", label: "Rate scenarios" },
      { value: "200", label: "Portfolio states" },
      { value: "10,000", label: "Simulated paths" },
    ],
    live: "https://yieldshock.netlify.app",
    code: "https://github.com/VM25/inflation-lab",
  },
  {
    id: "alpha",
    title: "Signal Survival",
    field: "Trading strategy",
    year: "2026",
    detail:
      "Most trading ideas look good on paper and fall apart once you charge them for trading, test them on years they have not seen, and change their settings. This runs five well-known strategies through twenty years of real market data and puts each one through that gauntlet.",
    result:
      "Three survived, one only works as a brake rather than an engine, and one was thrown out — it trades so often that the costs eat everything it earns.",
    figures: [
      { value: "5", label: "Strategies tested" },
      { value: "20", label: "Years of data" },
      { value: "3 of 5", label: "Survived" },
    ],
    live: "https://alpha-research.netlify.app",
    code: "https://github.com/VM25/research-lab",
  },
  {
    id: "diffusion",
    title: "DiffusionWorks",
    field: "Options pricing",
    year: "2026",
    detail:
      "Pricing an option is easy to do and hard to trust. This prices them several independent ways, then runs fifteen experiments designed to find the places where the answers quietly stop agreeing with each other.",
    result:
      "Ten experiments came out clean and five found a real problem. The five are the interesting ones — including a correction taught in textbooks that turns out to be measurably wrong for one class of option.",
    figures: [
      { value: "15", label: "Experiments" },
      { value: "10 clean", label: "5 flagged, none failed" },
      { value: "2", label: "Independent pricing models" },
    ],
    live: "https://diffusionworks.netlify.app",
    code: "https://github.com/VM25/stochastic-lab",
  },
  {
    id: "fxlab",
    title: "Currency Options Desk",
    field: "Foreign exchange",
    year: "2026",
    detail:
      "A book of dollar–peso currency options, priced and then deliberately put under stress. It asks what a sharp move actually costs, which part of the position causes the damage, and what a hedge does and does not fix.",
    result:
      "A hedge removes the directional risk entirely and leaves everything else untouched — which is the point. What remains is the risk of the market moving sharply rather than simply moving.",
    figures: [
      { value: "$4.65M", label: "Position size" },
      { value: "95%", label: "Confidence on loss estimate" },
      { value: "100%", label: "Directional risk removed" },
    ],
    live: "https://fxrisklab.netlify.app",
    code: "https://github.com/VM25/fx-options-risk-lab",
  },
  {
    id: "credits",
    title: "Lending Decisions",
    field: "Credit risk",
    year: "2026",
    detail:
      "Turning what you know about a borrower or a payment into an actual decision — approve, review, decline, block — and then testing whether those decisions hold up. It also asks what happens to growth and losses when the thresholds move.",
    result:
      "The fraud side works well. The lending side does not work as well, and says so: its ability to separate good borrowers from bad is modest, so it is marked for monitoring rather than presented as solved.",
    figures: [
      { value: "95,000", label: "Applicants assessed" },
      { value: "180", label: "Policy scenarios" },
      { value: "1 of 3", label: "Models flagged, not hidden" },
    ],
    live: "https://credits-engine.netlify.app",
    code: "https://github.com/VM25/credits-lab",
  },
  {
    id: "pra",
    title: "Allocation Study",
    field: "Portfolios",
    year: "2026",
    detail:
      "Four different rules for splitting money across thirteen markets, run against each other over two decades and through the crashes of 2008, 2020 and 2022 — with trading costs charged and no ability to see the future.",
    result:
      "None of them wins. The rule that reacts to changing conditions does not beat a plain 60/40 split once you account for risk. That is reported as it happened rather than dressed up.",
    figures: [
      { value: "13", label: "Markets" },
      { value: "4", label: "Rules compared" },
      { value: "3", label: "Crashes tested" },
    ],
    live: "https://pra-analytics.netlify.app",
    code: "https://github.com/VM25/portfolio-lab",
  },
  {
    id: "apexgp",
    title: "ApexGP",
    field: "Prediction markets",
    year: "2025",
    detail:
      "A full Formula 1 season treated as a market. Every question a race raises becomes something you can take a position on, priced as the odds shift and settled when the flag drops — with real limits on how much can ride on any one of them.",
    result:
      "Treated as a market rather than a set of bets, a season behaves like any other book: it can be priced, limited, and audited from the first lap to the last.",
    figures: [
      { value: "500+", label: "Positions available" },
      { value: "24", label: "Races settled" },
      { value: "30% / 15%", label: "Exposure limits" },
    ],
    live: "https://apexgp-markets.netlify.app",
    code: "https://github.com/VM25/apexgp-markets",
  },
];
