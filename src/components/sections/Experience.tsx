import { posts, honour } from "@/data/posts";
import { Disclosure } from "@/components/ui/Disclosure";
import { R, Head } from "@/components/ui/Bits";

/** Same rule as the work: a role and a place, and the rest on request. */
export function Experience() {
  return (
    <section id="experience" className="section">
      <Head n="04 — Experience" title="Where I've worked" />

      <R>
        <div className="border-t border-edge">
          {posts.map((p, i) => (
            <Disclosure
              key={p.id}
              index={String(i + 1).padStart(2, "0")}
              title={p.role}
              meta={p.org}
              aside={p.period}
            >
              <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12 lg:pl-[5rem]">
                <div className="lg:col-span-7 min-w-0">
                  <p className="body">{p.detail}</p>
                  <ul className="mt-6 grid gap-3">
                    {p.points.map((b) => (
                      <li
                        key={b}
                        className="relative max-w-[62ch] pl-5 text-[0.9375rem] leading-relaxed text-fg-2 before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-accent"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:col-span-4 lg:col-start-8 min-w-0">
                  <div className="stat">
                    <div className="num text-[1.375rem] leading-none text-fg">
                      {p.figure.value}
                    </div>
                    <div className="mt-2 text-[0.8125rem] text-fg-3">
                      {p.figure.label}
                    </div>
                  </div>
                  <p className="num mt-6 text-[0.8125rem] text-fg-4">
                    {p.location}
                  </p>
                </div>
              </div>
            </Disclosure>
          ))}
        </div>
      </R>

      <R>
        <p className="mt-7 flex items-center gap-3 text-[0.875rem] text-fg-3">
          <span className="h-[7px] w-[7px] flex-none bg-accent" aria-hidden />
          {honour}
        </p>
      </R>
    </section>
  );
}
