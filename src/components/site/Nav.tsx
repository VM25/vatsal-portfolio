"use client";

import { useEffect, useState } from "react";
import scrollama from "scrollama";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReveal, useLit } from "@/hooks/useReveal";

const ITEMS = [
  { id: "projects", label: "Projects" },
  { id: "research", label: "Research" },
  { id: "background", label: "Background" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

/**
 * The bar, plus the page's shared behaviour: the reveal observer, the pointer
 * light on cards, a scroll progress line, and a light parallax on section
 * headings so the page has some depth as it moves.
 */
export function Nav() {
  useReveal();
  useLit();
  const [here, setHere] = useState("");
  const [p, setP] = useState(0);

  useEffect(() => {
    const scroller = scrollama();
    scroller
      .setup({ step: "section[id], header[id]", offset: 0.4 })
      .onStepEnter(({ element }) => setHere(element.id));

    let f = 0;
    const onScroll = () => {
      cancelAnimationFrame(f);
      f = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setP(max > 0 ? window.scrollY / max : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Headings drift slightly slower than the page. Small enough that it
      // reads as depth rather than as an effect.
      gsap.utils.toArray<HTMLElement>(".sec-head").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 14 },
          {
            y: -14,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.7 },
          },
        );
      });
    });

    const onResize = () => {
      scroller.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(f);
      ctx.revert();
      scroller.destroy();
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-nocturnal/45 bg-onyx/80 backdrop-blur-md">
      <div className="shell flex h-[var(--bar)] items-center justify-between gap-6">
        <a href="#top" className="num inline-flex min-h-[44px] items-center text-[0.78rem] font-bold uppercase tracking-[0.14em] text-praxeti">
          VM
        </a>
        <nav aria-label="Sections" className="hidden items-center gap-7 md:flex">
          {ITEMS.map((it) => (
            <a
              key={it.id}
              href={`#${it.id}`}
              aria-current={here === it.id ? "true" : undefined}
              className={`num inline-flex min-h-[44px] items-center text-[0.7rem] uppercase tracking-[0.14em] transition-colors duration-300 ${
                here === it.id ? "text-saffron" : "text-aqua hover:text-praxeti"
              }`}
            >
              {it.label}
            </a>
          ))}
        </nav>
        <a href="#contact" className="num inline-flex min-h-[44px] items-center text-[0.7rem] uppercase tracking-[0.14em] text-saffron">
          Get in touch
        </a>
      </div>
      <div className="h-px w-full bg-nocturnal/40">
        <div
          className="h-px origin-left bg-saffron transition-transform duration-100"
          style={{ transform: `scaleX(${p})` }}
        />
      </div>
    </div>
  );
}
