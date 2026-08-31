import { methodGroups } from "@/data/methods";
import { systems } from "@/data/systems";
import { Section, Reveal, Eyebrow } from "@/components/record/Primitives";

// Look up a system's catalogue reference so each method can point at the
// evidence that backs it rather than asserting the capability on its own.
const refOf = new Map(systems.map((s) => [s.id, s.ref]));
const titleOf = new Map(systems.map((s) => [s.id, s.title]));

/**
 * §02. The capability matrix, as ruled rows. Every group carries the catalogue
 * references of the systems it actually appears in — a claim with a link behind
 * it, which is the only kind worth printing.
 */
export function Methods() {
  return (
    <Section
      id="methods"
      numeral="02"
      kicker="Methods"
      title={
        <>
          What the tools <em>let me do</em>
        </>
      }
      lede="Grouped by capability, and wired to the systems where each one shows up. Nothing here is a claim without evidence behind it."
    >
      <div className="border-t border-hair-3">
        {methodGroups.map((g, i) => (
          <Reveal key={g.id} kind="rise" i={Math.min(i, 4)}>
            <article className="grid gap-4 border-b border-hair py-7 lg:grid-cols-12 lg:gap-x-10">
              <div className="min-w-0 lg:col-span-4">
                <h3 className="subhead text-[1.25rem]">{g.title}</h3>
                <p className="mt-2 max-w-[38ch] text-[0.9375rem] leading-relaxed text-ink-55">
                  {g.blurb}
                </p>
              </div>

              <div className="min-w-0 lg:col-span-5">
                <ul className="flex flex-wrap gap-1.5">
                  {g.skills.map((s) => (
                    <li key={s} className="chip">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="min-w-0 lg:col-span-3">
                <Eyebrow className="block">Appears in</Eyebrow>
                <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {g.appearsIn.map((id) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        className="data text-[0.8125rem] text-rule-70 underline decoration-hair-2 underline-offset-4 transition-colors hover:text-signal-ink hover:decoration-signal"
                        title={titleOf.get(id)}
                      >
                        {refOf.get(id)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
