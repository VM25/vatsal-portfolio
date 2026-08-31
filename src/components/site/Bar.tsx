"use client";

import { useEffect, useState } from "react";
import { useReveal } from "@/hooks/useReveal";

const items = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "paper", label: "Writing" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

/**
 * Fixed bar. It also owns the page's single reveal observer, since it is the
 * one component that is always mounted.
 */
export function Bar() {
  useReveal();
  const [here, setHere] = useState("");

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const seen = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.set(e.target.id, e.intersectionRatio);
          else seen.delete(e.target.id);
        }
        let best = "";
        let top = 0;
        for (const [id, ratio] of seen) {
          if (ratio >= top) {
            top = ratio;
            best = id;
          }
        }
        setHere(best);
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.3, 0.6, 1] },
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-edge bg-bg/85 backdrop-blur-md">
      <div className="shell flex h-[var(--bar)] items-center justify-between gap-6">
        <a href="#top" className="num text-[0.8125rem] font-medium text-fg">
          Vatsal Maniar
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-7 md:flex">
          {items.map((i) => (
            <a
              key={i.id}
              href={`#${i.id}`}
              aria-current={here === i.id ? "true" : undefined}
              className={`num text-[0.8125rem] transition-colors duration-200 ${
                here === i.id
                  ? "text-accent"
                  : "text-fg-4 hover:text-fg"
              }`}
            >
              {i.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="num text-[0.8125rem] text-accent md:hidden"
        >
          Contact
        </a>
      </div>
    </div>
  );
}
