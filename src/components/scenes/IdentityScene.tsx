"use client";

import Image from "next/image";
import { SceneShell } from "@/components/experience/SceneShell";
import { Cue } from "@/components/experience/cues";
import { Button } from "@/components/ui/Button";
import { profile, links } from "@/data/profile";
import { Download, Github, Linkedin, Mail } from "@/components/ui/icons";

/**
 * Entry — a clean, confident open. The name carries it; one natural scroll moves
 * on. No instructions, no dossier chrome. Answers only: who is Vatsal?
 */
export function IdentityScene() {
  return (
    <SceneShell index="00" label="Entry">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Cue at={0}>
            <div className="flex items-center gap-2.5 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-ink-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-up bead" aria-hidden />
              Open to Fall 2026 · Full-Time 2027
            </div>
          </Cue>

          <Cue at={0.05}>
            <h1 className="font-display mt-6 text-[clamp(3.5rem,9.5vw,7.75rem)] font-semibold leading-[0.84] tracking-[-0.03em] text-ink">
              Vatsal
              <br />
              <span className="text-brass">Maniar</span>
            </h1>
          </Cue>

          <Cue at={0.11}>
            <p className="mt-7 max-w-lg text-pretty text-xl leading-relaxed text-ink-dim">
              {profile.thesis}
            </p>
          </Cue>

          <Cue at={0.17}>
            <div className="mt-7 flex flex-wrap gap-2">
              {profile.disciplines.map((d) => (
                <span
                  key={d}
                  className="rounded-full border border-line px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-dim"
                >
                  {d}
                </span>
              ))}
            </div>
          </Cue>

          <Cue at={0.23}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href={links.resume} variant="solid" external icon={<Download />}>
                Résumé
              </Button>
              <Button href={links.linkedin} variant="outline" external icon={<Linkedin />}>
                LinkedIn
              </Button>
              <Button href={links.github} variant="outline" external icon={<Github />}>
                GitHub
              </Button>
              <Button href={links.email} variant="ghost" icon={<Mail />}>
                Email
              </Button>
            </div>
          </Cue>
        </div>

        <div className="lg:col-span-5">
          <Cue at={0.12} x={28}>
            <figure className="panel relative mx-auto max-w-xs overflow-hidden rounded-[6px] p-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[3px]">
                <Image
                  src="/images/vatsal-maniar.jpg"
                  alt="Vatsal Maniar"
                  fill
                  priority
                  sizes="(max-width: 1024px) 70vw, 24vw"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-base via-base/10 to-transparent" aria-hidden />
              </div>
              <figcaption className="flex items-center justify-between px-2 pb-1 pt-2.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-ink-faint">
                <span>Financial Engineer</span>
                <span className="text-brass">NYC Metro</span>
              </figcaption>
            </figure>
          </Cue>
        </div>
      </div>
    </SceneShell>
  );
}
