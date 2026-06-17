"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { HeroCore } from "@/components/three/HeroCore";
import { links } from "@/data/profile";
import { Download, Github, Linkedin, Mail, ArrowRight } from "@/components/ui/icons";

/**
 * Cover. A poster-style systems/markets opening with its own distinct
 * environment (so the page's line-field starts only at Origin). The profile is
 * the subject - a large feathered portrait on the right - while the 3D "pricing
 * core" instrument sits in the middle/background, supporting the composition
 * rather than replacing it. The instrument is unboxed so it never clips, and it
 * carries the Hero -> Origin handoff: on scroll it recedes and dissolves into
 * the system while the name and portrait parallax at their own rates.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const nameY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -64]);
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -26]);
  const coreY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -120]);
  const coreScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.14]);
  const coreOpacity = useTransform(scrollYProgress, [0, 0.82], [reduce ? 0.5 : 0.6, reduce ? 0.5 : 0]);
  const coverY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -28]);
  const coverOpacity = useTransform(scrollYProgress, [0.25, 1], [1, reduce ? 1 : 0]);

  return (
    <section
      ref={ref}
      id="home"
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-20 pt-[calc(var(--nav-h)+1.75rem)]"
    >
      {/* Hero's own environment - opaque, so the global line-field starts at Origin */}
      <motion.div style={{ y: coverY, opacity: coverOpacity }} className="absolute inset-0 -z-20">
        <div className="absolute inset-0" style={{ background: "#08090d" }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 76% at 64% 46%, color-mix(in oklab, var(--cosmos) 85%, transparent) 0%, transparent 60%), radial-gradient(56% 56% at 14% 78%, color-mix(in oklab, var(--accent) 9%, transparent), transparent 60%), linear-gradient(180deg, #0b0d12 0%, #08090d 60%, var(--bg) 100%)",
          }}
        />
        {/* seam into the system below */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[var(--bg)]" />
      </motion.div>

      {/* The instrument - middle/background, unboxed so nothing is cropped */}
      <motion.div
        aria-hidden
        style={{ y: coreY, scale: coreScale, opacity: coreOpacity }}
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      >
        <div className="relative aspect-square w-[74vw] max-w-[94vw] sm:w-[min(62vh,620px)] lg:translate-x-[12%]">
          <HeroCore className="absolute inset-0" />
        </div>
      </motion.div>

      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-10 px-4 sm:px-7 lg:grid-cols-12 lg:gap-6">
        {/* Name + copy - own column, never covered. In the medium two-column band
            (lg: 1024-1279) the name gets an extra column so the big headline can
            never run under the photo; the proven 7/5 desktop split returns at xl. */}
        <motion.div style={{ y: nameY }} className="lg:col-span-8 xl:col-span-7">
          <div className="enter flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-ink-3">
              Financial engineering · systems &rarr; markets
            </span>
          </div>

          <h1
            className="display enter mt-5 text-[clamp(2.3rem,10vw,7.25rem)] uppercase"
            style={{ animationDelay: "0.05s" }}
          >
            Vatsal
            <br />
            Maniar
          </h1>

          <p
            className="enter mt-6 max-w-lg text-base leading-relaxed text-ink-2 sm:text-[1.05rem]"
            style={{ animationDelay: "0.12s" }}
          >
            I build pricing, rates, and risk systems — turning market uncertainty
            into something you can price, hedge, and explain. A computer-science
            core, sharpened through financial engineering.
          </p>

          <div className="enter mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.2s" }}>
            <Button href={links.resume} variant="solid" external icon={<Download />}>
              Résumé
            </Button>
            <Button href="#contact" variant="outline" icon={<ArrowRight />}>
              Get in touch
            </Button>
            <span className="mx-1 hidden h-6 w-px bg-line-2 sm:block" aria-hidden />
            <div className="flex items-center gap-1.5">
              {[
                { href: links.linkedin, label: "LinkedIn", icon: <Linkedin />, ext: true },
                { href: links.github, label: "GitHub", icon: <Github />, ext: true },
                { href: links.email, label: "Email", icon: <Mail />, ext: false },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  aria-label={l.label}
                  {...(l.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="grid h-10 w-10 place-items-center rounded-md border border-line-2 bg-card/50 text-lg text-ink-2 transition-colors hover:border-accent hover:text-ink"
                >
                  {l.icon}
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Profile - the subject, prominent and feathered into the field. In the
            medium band it takes one fewer column (shifts right + scales down a
            touch) to clear the headline; back to 5 columns at xl. */}
        <motion.div style={{ y: portraitY }} className="lg:col-span-4 xl:col-span-5">
          <div
            className="enter relative mx-auto w-full max-w-[19rem] sm:max-w-[21rem]"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="relative aspect-[4/5] w-full">
              <Image
                src="/images/vatsal-maniar-2.png"
                alt="Vatsal Maniar"
                fill
                priority
                sizes="(max-width: 1024px) 70vw, 21rem"
                className="object-cover object-top"
                style={{
                  WebkitMaskImage:
                    "radial-gradient(94% 80% at 50% 37%, #000 42%, rgba(0,0,0,0.35) 72%, transparent 84%)",
                  maskImage:
                    "radial-gradient(94% 80% at 50% 37%, #000 42%, rgba(0,0,0,0.35) 72%, transparent 84%)",
                  filter: "brightness(0.99) contrast(1.04)",
                }}
              />
              {/* only a faint grounding fade at the very bottom - the edges melt
                  into the field/instrument via the mask, so there is no rectangle */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
                style={{ background: "linear-gradient(180deg, transparent, color-mix(in oklab, var(--bg) 65%, transparent))" }}
              />
            </div>

            {/* operator caption: ties the portrait to the instrument behind it */}
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-line pt-3">
              <span className="font-mono text-[0.58rem] uppercase leading-relaxed tracking-[0.14em] text-ink-3">
                Pricing · rates · risk
              </span>
              <span className="flex shrink-0 items-center gap-1.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-up">
                <span className="h-1.5 w-1.5 rounded-full bg-up" /> live
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
