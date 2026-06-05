"use client";

import { SceneShell } from "@/components/experience/SceneShell";
import { Cue } from "@/components/experience/cues";
import { Button } from "@/components/ui/Button";
import { ContactForm } from "@/components/ui/ContactForm";
import { profile, links } from "@/data/profile";
import { Mail, Linkedin, Github, Download } from "@/components/ui/icons";

/**
 * Signal — the system's final output state. Seeking-side framing (not hiring),
 * a direct message channel, and the essentials. Answers: how to reach him?
 */
export function ContactScene() {
  return (
    <SceneShell index="06" label="Signal">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Cue at={0}>
            <div className="flex items-center gap-2 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-ink-faint">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-up bead" aria-hidden />
              Open to opportunities · 2026–27
            </div>
          </Cue>

          <Cue at={0.05}>
            <h2 className="scene-title mt-5 text-ink">
              Let&rsquo;s talk <span className="text-brass">markets.</span>
            </h2>
          </Cue>

          <Cue at={0.11}>
            <p className="mt-5 max-w-md text-pretty leading-relaxed text-ink-dim">
              {profile.status}
            </p>
          </Cue>

          <Cue at={0.17}>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button href={links.email} variant="outline" icon={<Mail />}>
                {profile.email}
              </Button>
              <Button href={links.linkedin} variant="ghost" external icon={<Linkedin />}>
                LinkedIn
              </Button>
              <Button href={links.github} variant="ghost" external icon={<Github />}>
                GitHub
              </Button>
              <Button href={links.resume} variant="ghost" external icon={<Download />}>
                Résumé
              </Button>
            </div>
          </Cue>

          <Cue at={0.24}>
            <dl className="mt-8 grid grid-cols-3 gap-x-6 gap-y-4 border-t border-line pt-6">
              {[
                { k: "Based", v: profile.location },
                { k: "Focus", v: "Trading · Research · Derivatives · Risk" },
                { k: "Available", v: profile.availability },
              ].map((row) => (
                <div key={row.k}>
                  <dt className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-ink-faint">
                    {row.k}
                  </dt>
                  <dd className="mt-1 text-sm leading-snug text-ink-dim">{row.v}</dd>
                </div>
              ))}
            </dl>
          </Cue>
        </div>

        <div className="lg:col-span-6">
          <Cue at={0.14} x={24}>
            <ContactForm />
          </Cue>
        </div>
      </div>

      <Cue at={0.36}>
        <div className="mt-10 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-ink-faint/70">
          // end of system — Vatsal Maniar · {profile.region}
        </div>
      </Cue>
    </SceneShell>
  );
}
