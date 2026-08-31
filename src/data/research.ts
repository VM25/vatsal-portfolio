/**
 * The paper. Closed it is a title; the argument only appears if someone opens
 * it or downloads it.
 */
export const paper = {
  title: "Stock–Bond Diversification in an Inflation-Driven Rates Regime",
  period: "2007–2026",

  /** One line, shown alongside the title. */
  premise:
    "For forty years, bonds cushioned the fall when shares dropped. In 2022 they stopped.",

  detail:
    "The paper asks a narrow version of a large question: if you only react to what you can actually see at the time, and you pay real costs to trade, does noticing that the cushion is failing help you at all? It tests a rule that watches for the warning signs against a plain 60/40 split, then takes the bond side apart to find out where the money actually went.",

  finding:
    "Noticing did not help. The reactive rule does not beat 60/40 once risk is accounted for. What it does do is make the failure legible — and taking 2022 apart shows the loss came almost entirely from real interest rates rising, not from inflation expectations, which is the opposite of the intuitive story.",

  figures: [
    { value: "0.48 vs 0.66", label: "Reactive rule against plain 60/40" },
    { value: "−19%", label: "Loss on the bond side in 2022" },
    { value: "13", label: "Markets tested" },
  ],

  limit:
    "One episode, examined closely. Not a claim that any of this can be predicted.",
} as const;
