/**
 * One identity colour per project, all mixed from the brand palette so nothing
 * new enters it. Each has to survive on a near-black ground, so the darker
 * brand blues are lifted toward the whites rather than used raw.
 */
export const ACCENT: Record<string, string> = {
  yieldshock: "var(--saffron)",
  alpha: "var(--aqua)",
  diffusion: "var(--toxic)",
  fxlab: "var(--creamy)",
  credits: "color-mix(in srgb, var(--nocturnal) 42%, var(--arctic))",
  pra: "color-mix(in srgb, var(--garnet) 45%, var(--creamy))",
  apexgp: "color-mix(in srgb, var(--blue) 40%, var(--aqua))",
};

/** Same idea for the roles, kept cooler so the work stays the loud part. */
export const ROLE_ACCENT = [
  "var(--aqua)",
  "color-mix(in srgb, var(--nocturnal) 40%, var(--arctic))",
  "color-mix(in srgb, var(--blue) 45%, var(--aqua))",
  "var(--snow)",
  "color-mix(in srgb, var(--nocturnal) 55%, var(--praxeti))",
  "color-mix(in srgb, var(--oceanic) 35%, var(--aqua))",
];
