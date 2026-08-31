import { paper, directions } from "@/data/research";
import { links } from "@/data/profile";
import {
  Section,
  Reveal,
  Eyebrow,
  Action,
  Rule,
} from "@/components/record/Primitives";
import { Plate } from "@/components/plates/Plate";
import { CorrelationBreak } from "@/components/plates/CorrelationBreak";

/**
 * §05. The working paper, led by the result rather than by the pitch. The claim
 * that the regime-aware rule loses to 60/40 is the first thing a reader sees,
 * because it is the honest headline and the more interesting one.
 */
export function Research() {
  return (
    <Section
      id="research"
      numeral="05"
      kicker="Research"
      title={
        <>
          The hedge that <em>stopped working</em>
        </>
      }
      lede={paper.standfirst}
    >
      {/* the paper */}
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-10">
        <div className="min-w-0 lg:col-span-7">
          <Reveal kind="fade">
            <div className="flex items-baseline gap-3">
              <span className="numeral">Memo</span>
              <Eyebrow>{paper.status}</Eyebrow>
            </div>
          </Reveal>

          <Reveal kind="wipe" as="h3" className="mt-3">
            <span className="display display--md block max-w-[20ch]">
              {paper.title}
            </span>
          </Reveal>

          <Reveal kind="rise" i={1}>
            <p className="mt-3 text-[1.0625rem] leading-snug text-rule-70">
              {paper.subtitle}
            </p>
          </Reveal>

          <Reveal kind="rise" i={2}>
            <div className="mt-7">
              <Eyebrow className="mb-2 block">The result</Eyebrow>
              <p className="finding text-[1.125rem]">{paper.claim}</p>
            </div>
          </Reveal>

          {/* full-sample table */}
          <Reveal kind="fade" i={3}>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[30rem] border-collapse text-left">
                <caption className="sr-only">
                  Full-sample results, regime-aware rule against 60/40
                </caption>
                <thead>
                  <tr className="border-b border-hair-3">
                    {["Strategy", "Ann. return", "Vol.", "Sharpe", "Max DD"].map((h) => (
                      <th key={h} scope="col" className="pb-2 pr-4">
                        <Eyebrow>{h}</Eyebrow>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paper.results.map((r) => {
                    const wins = r.strategy.startsWith("60/40");
                    return (
                      <tr key={r.strategy} className="border-b border-hair">
                        <th
                          scope="row"
                          className="py-3 pr-4 text-[0.9375rem] font-[550] text-ink"
                        >
                          {r.strategy}
                        </th>
                        {[r.ret, r.vol, r.sharpe, r.dd].map((v, i) => (
                          <td
                            key={i}
                            className={`data py-3 pr-4 text-[0.9375rem] ${
                              i === 2 && wins ? "text-signal-ink" : "text-ink-70"
                            }`}
                          >
                            {v}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal kind="fade" i={4}>
            <div className="mt-7 flex flex-wrap gap-3">
              <Action href={links.memo} external>
                Read the memo
              </Action>
              <Action href={links.prospectus} variant="ghost" external>
                One-page prospectus
              </Action>
            </div>
          </Reveal>
        </div>

        {/* figure 1 */}
        <div className="min-w-0 lg:col-span-5">
          <Plate
            n={8}
            caption="The break, in one line. The path is an indicative rendering of the measured series; the three levels marked on it are computed — a mean near −0.43 through the 2010s, the +0.20 threshold the rule watches, and the +0.41 peak in 2022–23."
          >
            <CorrelationBreak />
          </Plate>

          <Reveal kind="fade" i={1}>
            <div className="mt-8">
              <Eyebrow className="block">The 2022 overlay test</Eyebrow>
              <ul className="mt-3 border-t border-hair-3">
                {paper.overlays.map((o) => (
                  <li
                    key={o.asset}
                    className="flex items-baseline gap-3 border-b border-hair py-2.5"
                  >
                    <span className="data w-10 shrink-0 text-[0.8125rem] font-medium text-ink">
                      {o.asset}
                    </span>
                    <span className="text-[0.875rem] text-ink-55">{o.note}</span>
                    <span
                      className={`data ml-auto text-[0.8125rem] ${
                        o.helped ? "text-rule" : "text-signal-ink"
                      }`}
                    >
                      {o.effect}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-55">
                Effect on the 60/40 drawdown. Adding long duration made 2022
                worse; commodities and cash defended.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* modules + signals */}
      <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-x-10">
        <div className="min-w-0 lg:col-span-7">
          <Reveal kind="fade">
            <Eyebrow className="block">Two linked modules</Eyebrow>
          </Reveal>
          <Rule weight="strong" className="mt-3" />
          {paper.modules.map((m, i) => (
            <Reveal key={m.id} kind="rise" i={i + 1}>
              <article className="border-b border-hair py-5">
                <div className="flex items-baseline gap-3">
                  <span className="numeral">{m.label}</span>
                  <h4 className="subhead text-[1.0625rem]">{m.question}</h4>
                </div>
                <p className="mt-2 max-w-[62ch] text-[0.9375rem] leading-relaxed text-ink-70">
                  {m.detail}
                </p>
              </article>
            </Reveal>
          ))}

          <Reveal kind="fade" i={3}>
            <div className="mt-7 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { v: paper.totals.loss, l: "Exact repriced 2022 loss" },
                { v: paper.totals.lossPct, l: "Of book value" },
                { v: paper.totals.dv01, l: "DV01" },
                { v: paper.totals.duration, l: "Modified duration" },
              ].map((f) => (
                <div key={f.l}>
                  <div className="data text-[1.0625rem] font-medium leading-none text-ink">
                    {f.v}
                  </div>
                  <div className="mt-2 text-[0.8125rem] leading-snug text-ink-55">
                    {f.l}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="min-w-0 lg:col-span-5">
          <Reveal kind="fade">
            <Eyebrow className="block">The signals, as written</Eyebrow>
          </Reveal>
          <Rule weight="strong" className="mt-3" />
          {paper.signals.map((s, i) => (
            <Reveal key={s.rule} kind="rise" i={i + 1}>
              <div className="border-b border-hair py-3.5">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[0.9375rem] text-ink">{s.rule}</span>
                  <span className="data shrink-0 text-[0.8125rem] text-signal-ink">
                    {s.trigger}
                  </span>
                </div>
                <p className="mt-1 text-[0.8125rem] text-ink-55">{s.reads}</p>
              </div>
            </Reveal>
          ))}
          <Reveal kind="fade" i={4}>
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-55">
              Transparent, judgment-based rules — not estimated optima. The
              active-signal count sets the regime: none is Normal, one is Watch,
              two or more is Defensive.
            </p>
          </Reveal>
        </div>
      </div>

      {/* open questions */}
      <div className="mt-16">
        <Reveal kind="fade">
          <Eyebrow className="block">Open questions</Eyebrow>
        </Reveal>
        <Rule weight="strong" className="mt-3" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          {directions.map((d, i) => (
            <Reveal key={d.id} kind="rise" i={i}>
              <div className="border-b border-hair py-5 sm:pr-6">
                <span className="numeral">{d.id}</span>
                <h4 className="subhead mt-2 text-[1rem]">{d.label}</h4>
                <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-55">
                  {d.aim}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal kind="fade">
          <p className="mt-6 max-w-[70ch] text-[0.875rem] leading-relaxed text-ink-55">
            {paper.limits}
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
