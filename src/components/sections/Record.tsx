import { ledger, honors } from "@/data/ledger";
import { Section, Reveal, Eyebrow } from "@/components/record/Primitives";

/**
 * §04. The working record as a ruled ledger: category on the left rail, the
 * work in the middle, its scale on the right. Reverse chronological, no
 * decorative timeline — a ledger is the honest shape for this content.
 */
export function Record() {
  return (
    <Section
      id="record"
      numeral="04"
      kicker="Record"
      title={
        <>
          Where the <em>discipline</em> came from
        </>
      }
      lede="Platform builds, reconciliation under audit, and running operations where being wrong was expensive. The habits the systems above depend on were learned here."
    >
      <div className="border-t border-hair-3">
        <div className="hidden gap-x-6 border-b border-hair pb-2 md:grid md:grid-cols-[8.5rem_minmax(0,1fr)_11rem]">
          <Eyebrow>Category</Eyebrow>
          <Eyebrow>Engagement</Eyebrow>
          <Eyebrow>Scale</Eyebrow>
        </div>

        {ledger.map((e, i) => (
          <Reveal key={e.id} kind="rise" i={Math.min(i, 5)}>
            <article className="ledger-row">
              <div>
                <span className="data text-[0.75rem] uppercase tracking-[0.1em] text-signal-ink">
                  {e.tag}
                </span>
                <p className="data mt-1 text-[0.75rem] text-ink-38">{e.period}</p>
              </div>

              <div>
                <h3 className="subhead text-[1.0625rem]">{e.role}</h3>
                <p className="mt-0.5 text-[0.9375rem] text-rule-70">
                  {e.org}
                  <span className="text-ink-38"> · {e.location}</span>
                </p>
                <p className="mt-2 max-w-[58ch] text-[0.9375rem] leading-relaxed text-ink-55">
                  {e.frame}
                </p>
                <ul className="mt-3 grid gap-1.5">
                  {e.bullets.map((b) => (
                    <li
                      key={b}
                      className="relative max-w-[62ch] pl-4 text-[0.9375rem] leading-relaxed text-ink-70 before:absolute before:left-0 before:top-[0.62em] before:h-px before:w-2 before:bg-hair-3"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:text-right">
                <div className="data text-[1.125rem] font-medium leading-none text-ink">
                  {e.metric.value}
                </div>
                <div className="mt-1.5 text-[0.8125rem] leading-snug text-ink-55">
                  {e.metric.label}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal kind="fade">
        <p className="mt-6 flex items-center gap-3 text-[0.875rem] text-ink-55">
          <span className="tick" aria-hidden />
          {honors.join(" · ")}
        </p>
      </Reveal>
    </Section>
  );
}
