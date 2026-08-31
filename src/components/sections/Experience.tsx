"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { posts, honour } from "@/data/posts";
import { ROLE_ACCENT } from "@/lib/accents";
import { R } from "@/components/ui/Bits";

/**
 * Roles as a ledger of rows that open in place. Same discipline as the work
 * rail — a role is a line until you ask for it — but laid out horizontally so
 * the two sections do not read as the same component twice.
 */
export function Experience() {
  const [open, setOpen] = useState<string | null>(null);
  const reduce = useReducedMotion();

  return (
    <section
      id="experience"
      className="section"
      style={{ ["--accent"]: "color-mix(in srgb, var(--nocturnal) 45%, var(--arctic))" } as React.CSSProperties}
    >
      <div className="shell">
        <div className="sec-head">
          <R>
            <p className="tag">04 — Experience</p>
          </R>
          <R d={1}>
            <h2 className="h1">Roles</h2>
          </R>
        </div>

        <R d={2}>
          <div className="border-t border-nocturnal/50">
            {posts.map((p, i) => {
              const on = open === p.id;
              return (
                <div
                  key={p.id}
                  style={{ ["--accent"]: ROLE_ACCENT[i % ROLE_ACCENT.length] } as React.CSSProperties}
                  className="border-b border-nocturnal/50"
                >
                  <button
                    type="button"
                    aria-expanded={on}
                    onClick={() => setOpen(on ? null : p.id)}
                    className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 py-5 text-left transition-[padding] duration-300 hover:pl-2 sm:grid-cols-[3rem_1.3fr_1fr_auto] sm:gap-x-6"
                  >
                    <span className="num text-[0.7rem] text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="h3 text-[1.05rem] transition-colors duration-300 group-hover:text-accent">
                      {p.role}
                    </span>
                    <span className="num hidden text-[0.72rem] uppercase tracking-[0.12em] text-aqua sm:block">
                      {p.org}
                    </span>
                    <span className="flex items-baseline gap-4">
                      <span className="num hidden text-[0.7rem] text-snow/50 md:block">
                        {p.period}
                      </span>
                      <span
                        className="num text-accent transition-transform duration-300"
                        style={{ transform: on ? "rotate(45deg)" : "none" }}
                        aria-hidden
                      >
                        +
                      </span>
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {on ? (
                      <motion.div
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-7 pb-8 lg:grid-cols-12">
                          <div className="min-w-0 lg:col-span-7 lg:col-start-2">
                            <p className="prose text-[0.95rem]">{p.detail}</p>
                            <ul className="mt-4 grid gap-2.5">
                              {p.points.map((b) => (
                                <li
                                  key={b}
                                  className="relative max-w-[64ch] pl-5 text-[0.9rem] leading-relaxed text-snow/85 before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-accent"
                                >
                                  {b}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="min-w-0 lg:col-span-3 lg:col-start-10">
                            <div className="stat">
                              <div className="stat__v">{p.figure.value}</div>
                              <div className="stat__k">{p.figure.label}</div>
                            </div>
                            <p className="num mt-5 text-[0.72rem] text-aqua">{p.location}</p>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </R>

        <R d={3}>
          <p className="num mt-6 text-[0.72rem] uppercase tracking-[0.14em] text-creamy">
            {honour}
          </p>
        </R>
      </div>
    </section>
  );
}
