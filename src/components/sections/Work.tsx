import { work } from "@/data/work";
import { Disclosure } from "@/components/ui/Disclosure";
import { R, Head, Figures, Out } from "@/components/ui/Bits";

/**
 * Seven rows. Closed, each shows a name and a field and nothing else — the
 * description is behind the click, not in front of it.
 */
export function Work() {
  return (
    <section id="work" className="section">
      <Head
        n="01 — Work"
        title="Seven things I built"
        lead="Open one to see what it does and what it found."
      />

      <R>
        <div className="border-t border-edge">
          {work.map((w, i) => (
            <Disclosure
              key={w.id}
              index={String(i + 1).padStart(2, "0")}
              title={w.title}
              meta={w.field}
              aside={w.year}
            >
              <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12 lg:pl-[5rem]">
                <div className="lg:col-span-7 min-w-0">
                  <p className="body">{w.detail}</p>

                  <div className="mt-7 border-l-2 border-accent pl-5">
                    <p className="text-[1.0625rem] leading-relaxed text-fg">
                      {w.result}
                    </p>
                  </div>

                  <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3">
                    {w.live ? <Out href={w.live}>Open it</Out> : null}
                    {w.code ? <Out href={w.code}>Source</Out> : null}
                  </div>
                </div>

                <div className="lg:col-span-5 lg:col-start-8 min-w-0">
                  <Figures items={w.figures} />
                </div>
              </div>
            </Disclosure>
          ))}
        </div>
      </R>
    </section>
  );
}
