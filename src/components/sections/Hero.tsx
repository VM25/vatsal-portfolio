import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Parallax } from "@/components/ui/Parallax";
import { Button } from "@/components/ui/Button";
import { profile, links } from "@/data/profile";
import {
  ArrowDown,
  Download,
  Github,
  Linkedin,
  Mail,
} from "@/components/ui/icons";

export function Hero() {
  return (
    <section
      id="hero"
      data-section="hero"
      className="relative flex min-h-[100svh] w-full items-center overflow-clip"
    >
      {/* Legibility scrims over the global 3D environment */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-base/85 via-base/40 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-44 bg-gradient-to-b from-transparent to-base"
        aria-hidden
      />

      <div className="shell relative z-10 grid grid-cols-1 items-center gap-10 pb-24 pt-28 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-ink-faint">
              <span className="text-amber">{profile.location}</span>
              <span className="h-px w-8 bg-line-strong" aria-hidden />
              <span>Recruiting · 2026</span>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="font-display mt-6 text-[clamp(3.5rem,13vw,11rem)] font-semibold leading-[0.84] tracking-[-0.02em] text-ink">
              Vatsal
              <br />
              <span className="text-gradient-amber">Maniar</span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-7 font-mono text-xs uppercase tracking-[0.16em] text-ink-dim sm:text-sm">
              M.S. Financial Engineering, Stevens
              <span className="mx-2 text-ink-faint">/</span>
              B.S. Computer Science, ASU
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-dim">
              {profile.positioning}
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-7 flex flex-wrap gap-2">
              {profile.disciplines.map((d) => (
                <span
                  key={d}
                  className="rounded-full border border-line bg-[rgba(12,10,9,0.4)] px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-dim backdrop-blur-sm"
                >
                  {d}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button href="#work" variant="solid" icon={<ArrowDown />}>
                View Projects
              </Button>
              <Button href={links.resume} variant="outline" external icon={<Download />}>
                Résumé
              </Button>
              <div className="ml-1 flex items-center gap-1">
                <Button href={links.linkedin} variant="ghost" external ariaLabel="LinkedIn" icon={<Linkedin />}>
                  <span className="sr-only sm:not-sr-only">LinkedIn</span>
                </Button>
                <Button href={links.github} variant="ghost" external ariaLabel="GitHub" icon={<Github />}>
                  <span className="sr-only sm:not-sr-only">GitHub</span>
                </Button>
                <Button href={links.email} variant="ghost" ariaLabel="Email" icon={<Mail />}>
                  <span className="sr-only sm:not-sr-only">Email</span>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <Parallax speed={0.18}>
            <Reveal delay={0.2}>
              <figure className="relative mx-auto w-full max-w-sm">
                <div className="panel relative aspect-[4/5] overflow-hidden rounded-2xl">
                  <Image
                    src="/images/vatsal-maniar.jpg"
                    alt="Vatsal Maniar"
                    fill
                    priority
                    sizes="(max-width: 1024px) 80vw, 36vw"
                    className="object-cover object-top"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-base via-base/10 to-transparent"
                    aria-hidden
                  />
                  <span className="absolute left-3 top-3 h-4 w-4 border-l border-t border-amber/50" aria-hidden />
                  <span className="absolute right-3 top-3 h-4 w-4 border-r border-t border-amber/50" aria-hidden />
                  <figcaption className="absolute inset-x-4 bottom-4 flex items-end justify-between font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-dim">
                    <span>Vatsal Maniar</span>
                    <span className="text-amber">FE · NYC</span>
                  </figcaption>
                </div>
              </figure>
            </Reveal>
          </Parallax>
        </div>
      </div>

      <a
        href="#origin"
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-faint transition-colors hover:text-amber"
      >
        Scroll
        <ArrowDown className="animate-pulse text-base" />
      </a>
    </section>
  );
}
