import { SectionShell } from "@/components/ui/SectionShell";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { profile, links } from "@/data/profile";
import { Download, Github, Linkedin, Mail } from "@/components/ui/icons";

export function Contact() {
  return (
    <SectionShell id="contact">
      <div className="panel relative overflow-hidden rounded-3xl px-6 py-16 sm:px-12 sm:py-20 md:px-16">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber/10 blur-3xl"
          aria-hidden
        />
        <Reveal>
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-ink-faint">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-up" aria-hidden />
            Open — 2026 internships &amp; co-ops
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <h2 className="font-display mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl">
            Let&rsquo;s build something that{" "}
            <span className="text-gradient-amber">prices, hedges, and explains.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-ink-dim">
            {profile.status} If you&rsquo;re hiring for quant trading, research,
            derivatives, or risk — or just want to talk markets — reach out.
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button href={links.email} variant="solid" icon={<Mail />}>
              {profile.email}
            </Button>
            <Button href={links.linkedin} variant="outline" external icon={<Linkedin />}>
              LinkedIn
            </Button>
            <Button href={links.github} variant="outline" external icon={<Github />}>
              GitHub
            </Button>
            <Button href={links.resume} variant="ghost" external icon={<Download />}>
              Résumé
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-12 grid grid-cols-1 gap-4 border-t border-line pt-8 font-mono text-xs uppercase tracking-[0.14em] text-ink-faint sm:grid-cols-3">
            <div>
              <div className="text-ink-dim">Based in</div>
              <div className="mt-1">{profile.location}</div>
            </div>
            <div>
              <div className="text-ink-dim">Graduating</div>
              <div className="mt-1">December 2026 · Stevens</div>
            </div>
            <div>
              <div className="text-ink-dim">Focus</div>
              <div className="mt-1">Quant · Derivatives · Risk</div>
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
