import { paper } from "@/data/research";
import { links } from "@/data/profile";
import { R, Head, Label, Action, Figures } from "@/components/ui/Bits";

/**
 * One paper. The premise is enough to decide whether to read on; the argument
 * and the numbers sit below it for anyone who wants them.
 */
export function Paper() {
  return (
    <section id="paper" className="section">
      <Head n="03 — Writing" title="The hedge that stopped working" />

      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-7 min-w-0">
          <R>
            <p className="quote max-w-[20ch]">{paper.premise}</p>
          </R>

          <R d={1}>
            <div className="mt-10 border-t border-edge pt-7">
              <h3 className="h3">{paper.title}</h3>
              <p className="num mt-2 text-[0.8125rem] text-fg-4">
                {paper.period}
              </p>
            </div>
          </R>

          <R d={2}>
            <p className="body mt-6">{paper.detail}</p>
          </R>

          <R d={3}>
            <div className="mt-7 border-l-2 border-accent pl-5">
              <p className="text-[1.0625rem] leading-relaxed text-fg">
                {paper.finding}
              </p>
            </div>
          </R>

          <R d={4}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Action href={links.memo} external>
                Read it
              </Action>
              <Action href={links.prospectus} quiet external>
                Prospectus
              </Action>
            </div>
          </R>
        </div>

        <div className="lg:col-span-4 lg:col-start-9 min-w-0">
          <R d={2}>
            <Label>In numbers</Label>
            <div className="mt-5">
              <Figures items={paper.figures} stack />
            </div>
            <p className="mt-8 border-t border-edge pt-5 text-[0.8125rem] leading-relaxed text-fg-4">
              {paper.limit}
            </p>
          </R>
        </div>
      </div>
    </section>
  );
}
