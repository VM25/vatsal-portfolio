import { profile, links } from "@/data/profile";
import { Section, Reveal, Eyebrow, Out, Action } from "@/components/record/Primitives";

const channels = [
  { label: "Email", value: profile.email, href: links.email },
  { label: "LinkedIn", value: "in/vatsal-maniar", href: links.linkedin, out: true },
  { label: "GitHub", value: "VM25", href: links.github, out: true },
  { label: "Phone", value: profile.phone, href: `tel:${profile.phone.replace(/[^\d+]/g, "")}` },
];

/**
 * §06. An address block, which is what a publication puts here. No form — a
 * form would be one more thing to maintain and one more step for the reader.
 */
export function Correspondence() {
  return (
    <Section
      id="correspondence"
      numeral="06"
      kicker="Correspondence"
      title={
        <>
          Reach me <em>directly</em>
        </>
      }
      lede={profile.status}
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-10">
        <div className="min-w-0 lg:col-span-7">
          <div className="border-t border-hair-3">
            {channels.map((c, i) => (
              <Reveal key={c.label} kind="rise" i={i}>
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-hair py-4">
                  <Eyebrow className="w-20 shrink-0">{c.label}</Eyebrow>
                  {c.out ? (
                    <Out href={c.href} className="data text-[0.9375rem]">
                      {c.value}
                    </Out>
                  ) : (
                    <a href={c.href} className="link data text-[0.9375rem]">
                      {c.value}
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal kind="fade" i={2}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Action href={links.email}>Start a conversation</Action>
              <Action href={links.resume} variant="ghost" external>
                Résumé
              </Action>
            </div>
          </Reveal>
        </div>

        <div className="min-w-0 lg:col-span-4 lg:col-start-9">
          <Reveal kind="fade" i={1}>
            <div className="border border-hair-2 bg-surface p-6">
              <Eyebrow className="block">Currently</Eyebrow>
              <p className="display display--sm mt-3">{profile.availability}</p>
              <ul className="mt-5 grid gap-2">
                {profile.targets.map((t) => (
                  <li key={t} className="flex items-center gap-3 text-[0.9375rem] text-ink-70">
                    <span className="tick" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-hair pt-4 text-[0.8125rem] leading-relaxed text-ink-55">
                Based in {profile.location}, in the {profile.region}.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
