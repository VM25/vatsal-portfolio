import { profile } from "@/data/profile";
import { education } from "@/data/education";
import { Section, Reveal, Eyebrow, Rule } from "@/components/record/Primitives";

/**
 * §01. What the record is and who kept it. The two degrees sit here rather than
 * in their own section — they are provenance for the work, not an achievement
 * list, and they read better beside the summary than apart from it.
 */
export function Abstract() {
  return (
    <Section
      id="abstract"
      numeral="01"
      kicker="Abstract"
      title={
        <>
          A software foundation,
          <br />
          pointed at <em>market risk</em>
        </>
      }
      lede={profile.status}
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10">
        <div className="min-w-0 lg:col-span-7">
          <Reveal kind="rise">
            <p className="prose">{profile.summary}</p>
          </Reveal>

          <Reveal kind="rise" i={1}>
            <p className="prose mt-6">
              The Computer Science half is not background — it is why these
              systems are reproducible. Every result on this page regenerates
              from a committed pipeline, every figure traces to a stored record,
              and where the numerics fall short the shortfall is measured and
              kept rather than smoothed away.
            </p>
          </Reveal>

          <Reveal kind="fade" i={2}>
            <div className="mt-8 border-t border-hair pt-4">
              <Eyebrow className="block">Certification</Eyebrow>
              <p className="data mt-2 text-[0.9375rem] text-ink">
                {profile.certification}
              </p>
            </div>
          </Reveal>
        </div>

        {/* provenance */}
        <div className="min-w-0 lg:col-span-5 lg:col-start-8">
          <Reveal kind="fade">
            <Eyebrow className="block">Provenance</Eyebrow>
          </Reveal>
          <Rule weight="strong" className="mt-3" />
          {education.map((e, i) => (
            <Reveal key={e.id} kind="rise" i={i + 1}>
              <article className="border-b border-hair py-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="subhead text-[1.0625rem]">{e.school}</h3>
                  <span className="data shrink-0 text-[0.75rem] text-ink-38">
                    {e.period}
                  </span>
                </div>
                <p className="mt-1 text-[0.9375rem] text-ink-70">{e.degree}</p>
                <p className="data mt-1 text-[0.8125rem] text-ink-55">{e.detail}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {e.coursework.map((c) => (
                    <li key={c} className="chip">
                      {c}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
