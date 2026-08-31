import Image from "next/image";
import { profile, links } from "@/data/profile";
import { contents } from "@/data/nav";
import { systemCount } from "@/data/systems";
import { Reveal, Action, Eyebrow } from "@/components/record/Primitives";

/**
 * The front page. A masthead line of record metadata, the name at full width,
 * the standfirst, the portrait as a printed plate, and a contents block —
 * the same furniture a paper puts on its cover, doing the same job.
 */
export function Masthead() {
  return (
    <header id="masthead" className="pt-[calc(var(--head-h)+2rem)] pb-[clamp(3rem,7vw,6rem)]">
      {/* record metadata, set across the top rule */}
      <Reveal kind="fade">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-hair-3 pb-3">
          <Eyebrow>{profile.name} — working record</Eyebrow>
          <Eyebrow className="hidden sm:inline">{profile.location}</Eyebrow>
          <Eyebrow>
            {systemCount} systems · 1 memo · {profile.edition.toLowerCase()}
          </Eyebrow>
        </div>
      </Reveal>

      {/* the name, at full measure */}
      <Reveal kind="wipe" as="h1" className="mt-8 lg:mt-12">
        <span className="display display--xl block">Vatsal Maniar</span>
      </Reveal>

      <div className="mt-8 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-x-10">
        {/* standfirst */}
        <div className="min-w-0 lg:col-span-7">
          <Reveal kind="rise">
            <p className="display display--sm max-w-[30ch] text-pretty">
              I build risk systems that turn uncertainty into something you can{" "}
              <em>price, hedge, and explain</em> — and I publish the results that
              don&rsquo;t work.
            </p>
          </Reveal>

          <Reveal kind="rise" i={1}>
            <p className="prose mt-6 max-w-[52ch]">{profile.positioning}</p>
          </Reveal>

          <Reveal kind="rise" i={2}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Action href="#systems">Read the systems</Action>
              <Action href={links.resume} variant="ghost" external>
                Résumé
              </Action>
              <Action href={links.memo} variant="ghost" external>
                Research memo
              </Action>
            </div>
          </Reveal>

          <Reveal kind="rise" i={3}>
            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-hair pt-4">
              <span className="tick" aria-hidden />
              <span className="data text-[0.8125rem] text-ink">
                {profile.availability}
              </span>
              <span className="text-[0.8125rem] text-ink-55">
                — {profile.targets.join(" · ")}
              </span>
            </div>
          </Reveal>
        </div>

        {/* the plate */}
        <div className="min-w-0 lg:col-span-5">
          <Reveal kind="fade" i={1}>
            <div className="portrait mx-auto max-w-[19rem] lg:ml-auto lg:mr-0 lg:max-w-none">
              <Image
                src="/images/vatsal-maniar.jpg"
                alt={`${profile.name}, portrait`}
                width={1200}
                height={1601}
                priority
                sizes="(min-width: 1024px) 34vw, 76vw"
              />
              <span className="portrait__screen" aria-hidden />
              <span className="reg-mark reg-mark--tl" aria-hidden />
              <span className="reg-mark reg-mark--br" aria-hidden />
            </div>
            <p className="mt-3 text-right text-[0.75rem] text-ink-38">
              <span className="data">{profile.degreeLine.split(" · ")[0]}</span>
            </p>
          </Reveal>
        </div>
      </div>

      {/* contents */}
      <Reveal kind="fade" i={2}>
        <nav aria-label="Contents" className="mt-14 border-t border-hair-3 pt-4 lg:mt-20">
          <Eyebrow className="block">Contents</Eyebrow>
          <ul className="mt-4 grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
            {contents.map((c) => (
              <li key={c.id} className="border-b border-hair">
                <a
                  href={`#${c.id}`}
                  className="group flex items-baseline gap-4 py-3 transition-[padding] duration-300 hover:pl-2"
                >
                  <span className="numeral">§{c.numeral}</span>
                  <span className="subhead text-[1.05rem]">{c.label}</span>
                  <span
                    className="data ml-auto text-[0.8rem] text-ink-38 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-signal-ink"
                    aria-hidden
                  >
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Reveal>
    </header>
  );
}
