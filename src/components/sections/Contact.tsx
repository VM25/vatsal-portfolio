import { Section, SectionHeader } from "@/components/site/Section";
import { Reveal } from "@/components/site/motion";
import { ContactForm } from "@/components/ui/ContactForm";
import { profile, links } from "@/data/profile";
import { Mail, Linkedin, Github, Download, ArrowUpRight } from "@/components/ui/icons";

const CHANNELS = [
  { label: "Email", value: profile.email, href: links.email, icon: <Mail />, external: false },
  { label: "LinkedIn", value: "in/vatsal-maniar", href: links.linkedin, icon: <Linkedin />, external: true },
  { label: "GitHub", value: "github.com/VM25", href: links.github, icon: <Github />, external: true },
  { label: "Résumé", value: "Download PDF", href: links.resume, icon: <Download />, external: true },
];

export function Contact() {
  return (
    <Section id="contact">
      {/* Header on its own row so the huge title never collides with the form */}
      <SectionHeader index="06" kicker="Signal" title="Let's talk markets" lead={profile.status} />

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* channels + facts */}
        <div className="lg:col-span-6">
          <Reveal>
            <div className="grid grid-cols-1 gap-2.5">
              {CHANNELS.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-center gap-3 rounded-lg border border-line-2 bg-card px-4 py-3 transition-colors hover:border-accent"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-card-2 text-lg text-ink-2 transition-colors group-hover:text-accent">
                    {c.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">{c.label}</span>
                    <span className="block font-mono text-[0.74rem] text-ink-3">
                      {c.value}
                    </span>
                  </span>
                  <ArrowUpRight className="ml-auto shrink-0 text-base text-ink-3 transition-colors group-hover:text-accent" />
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <dl className="mt-6 grid grid-cols-3 gap-x-4 gap-y-4 border-t border-line pt-6">
              {[
                { k: "Based", v: profile.location },
                { k: "Focus", v: "Trading · Research · Risk" },
                { k: "Available", v: profile.availability },
              ].map((row) => (
                <div key={row.k}>
                  <dt className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-ink-3">
                    {row.k}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-snug text-ink-2">{row.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* form */}
        <div className="lg:col-span-6">
          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
