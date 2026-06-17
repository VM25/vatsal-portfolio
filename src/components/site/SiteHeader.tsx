"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { navItems } from "@/data/nav";
import { links } from "@/data/profile";
import { cn } from "@/lib/utils";
import { Close, Menu } from "@/components/ui/icons";

/**
 * Fixed in-page navigation. Sharp institutional treatment: a legible monogram
 * block (monospace VM so both letters render at any size), uppercase tracked nav
 * with an active underline, and a full-screen mobile sheet. Active section via
 * one IntersectionObserver.
 */
export function SiteHeader() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string>("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-55% 0px -42% 0px", threshold: 0 },
    );
    for (const item of navItems) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[var(--nav-h)] border-b border-line bg-paper/70 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between gap-3 px-4 sm:px-7">
        {/* Monogram - monospace so V and M both render crisply */}
        <a href="#home" aria-label="Home" className="group flex items-center gap-2.5">
          <span className="flex h-8 items-center justify-center bg-ink px-1.5 font-mono text-[0.82rem] font-bold leading-none tracking-tight text-paper transition-colors group-hover:bg-accent group-hover:text-accent-ink">
            VM
          </span>
          <span className="hidden font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink sm:block">
            Maniar<span className="text-ink-3">/quant</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav aria-label="Sections" className="hidden items-center gap-0.5 lg:flex">
          {navItems.map((item) => {
            const on = active === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={on ? "true" : undefined}
                className={cn(
                  "relative px-2.5 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.06em] transition-colors",
                  on ? "text-ink" : "text-ink-3 hover:text-ink",
                )}
              >
                {item.label}
                {on && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-2 -bottom-px h-[2px] bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={links.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden bg-ink px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-paper transition-colors hover:bg-accent hover:text-accent-ink sm:inline-flex"
          >
            Résumé
          </a>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-md border border-line-2 bg-card text-ink lg:hidden"
          >
            <Menu className="text-lg" />
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              aria-label="Close menu"
              className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={reduce ? false : { y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: -16, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
              className="absolute inset-x-0 top-0 border-b border-line bg-paper-2 px-5 pb-6 pt-4 shadow-[0_40px_80px_-40px_var(--scrim)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-ink">
                  Maniar<span className="text-ink-3">/quant</span>
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-md border border-line-2 bg-card text-ink"
                >
                  <Close className="text-lg" />
                </button>
              </div>
              <nav aria-label="Sections" className="mt-5 grid gap-0.5">
                {navItems.map((item, i) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-baseline justify-between border-b border-line py-3 transition-colors",
                      active === item.id ? "text-accent" : "text-ink hover:text-accent",
                    )}
                  >
                    <span className="h-card text-2xl uppercase">{item.label}</span>
                    <span className="font-mono text-xs text-ink-3 tnum">
                      {String(i).padStart(2, "0")}
                    </span>
                  </a>
                ))}
              </nav>
              <a
                href={links.resume}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="mt-5 flex items-center justify-center bg-ink px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-paper"
              >
                Download Résumé
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
