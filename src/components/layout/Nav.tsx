"use client";

import { useEffect, useState } from "react";
import { navItems } from "@/data/nav";
import { profile, links } from "@/data/profile";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { Download } from "@/components/ui/icons";

export function Nav() {
  const activeSection = useStore((s) => s.activeSection);
  const setActiveSection = useStore((s) => s.setActiveSection);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    document
      .querySelectorAll("section[data-section]")
      .forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [setActiveSection]);

  return (
    <>
      <a
        href="#origin"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-amber focus:px-4 focus:py-2 focus:text-sm focus:text-[#1a1206]"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
          scrolled
            ? "border-b border-line bg-[rgba(12,10,9,0.72)] backdrop-blur-md"
            : "border-b border-transparent",
        )}
      >
        <nav className="shell flex h-16 items-center justify-between">
          <a
            href="#hero"
            className="group flex items-center gap-3"
            aria-label="Back to top"
          >
            <span className="grid h-8 w-8 place-items-center rounded-md border border-line-strong font-display text-sm font-semibold text-amber">
              VM
            </span>
            <span className="hidden font-mono text-xs uppercase tracking-[0.18em] text-ink-dim transition-colors group-hover:text-ink sm:block">
              {profile.name}
            </span>
          </a>

          <div className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={cn(
                  "relative font-mono text-xs uppercase tracking-[0.16em] transition-colors",
                  activeSection === item.id
                    ? "text-amber"
                    : "text-ink-faint hover:text-ink",
                )}
              >
                {item.label}
                {activeSection === item.id ? (
                  <span className="absolute -bottom-2 left-0 h-px w-full bg-amber" />
                ) : null}
              </a>
            ))}
            <a
              href={links.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-1.5 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-colors hover:border-amber/60 hover:text-amber"
            >
              <Download className="text-sm" />
              Résumé
            </a>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line-strong text-ink md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <span className="relative block h-3 w-4">
              <span
                className={cn(
                  "absolute left-0 h-px w-4 bg-current transition-all",
                  open ? "top-1.5 rotate-45" : "top-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1.5 h-px w-4 bg-current transition-opacity",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 h-px w-4 bg-current transition-all",
                  open ? "top-1.5 -rotate-45" : "top-3",
                )}
              />
            </span>
          </button>
        </nav>

        {open ? (
          <div className="border-t border-line bg-[rgba(12,10,9,0.96)] backdrop-blur-md md:hidden">
            <div className="shell flex flex-col gap-1 py-4">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2.5 font-mono text-sm uppercase tracking-[0.14em] text-ink-dim hover:bg-[rgba(237,230,218,0.04)] hover:text-ink"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={links.resume}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex items-center gap-2 rounded-md px-2 py-2.5 font-mono text-sm uppercase tracking-[0.14em] text-amber"
              >
                <Download className="text-base" /> Résumé
              </a>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
