"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SectionShell } from "@/components/ui/SectionShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { experience, honors } from "@/data/experience";
import { education } from "@/data/education";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";

export function Experience() {
  const [active, setActive] = useState(experience[0].id);
  const reduce = useReducedMotion();
  const role = experience.find((r) => r.id === active) ?? experience[0];

  return (
    <SectionShell id="experience">
      <SectionHeader
        index="04"
        eyebrow="Experience"
        title={
          <>
            Track <span className="text-gradient-amber">record.</span>
          </>
        }
        lead="A path through analytics, operations, and technical roles — the groundwork behind the quant focus. Select a role to read the detail."
      />

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Role rail */}
        <div className="flex flex-col gap-2 lg:col-span-5">
          {experience.map((r) => (
            <button
              key={r.id}
              onClick={() => setActive(r.id)}
              className={cn(
                "rounded-xl border px-5 py-4 text-left transition-colors",
                active === r.id
                  ? "border-amber/50 bg-[rgba(232,162,61,0.06)]"
                  : "border-line hover:border-line-strong",
              )}
            >
              <div className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-amber">
                {r.period}
              </div>
              <div className="font-display mt-1 text-lg leading-tight text-ink">
                {r.role}
              </div>
              <div className="text-xs text-ink-faint">{r.org}</div>
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-7">
          <div className="panel h-full rounded-2xl p-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={role.id}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: reduce ? 0 : 0.35 }}
              >
                <div className="font-mono text-xs uppercase tracking-[0.16em] text-ink-faint">
                  {role.location} · {role.period}
                </div>
                <h3 className="font-display mt-2 text-2xl leading-tight text-ink">
                  {role.role}
                </h3>
                <div className="mt-1 text-ink-dim">{role.org}</div>
                <p className="mt-3 font-display text-base italic text-ink-faint">
                  {role.frame}
                </p>
                <ul className="mt-5 space-y-3">
                  {role.bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-sm leading-relaxed text-ink-dim">
                      <span className="mt-2 h-px w-3 shrink-0 bg-amber" aria-hidden />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Education + credentials — compact secondary modules */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {education.map((ed) => (
          <div key={ed.id} className="panel rounded-2xl p-6">
            <div className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-faint">
              {ed.period}
            </div>
            <h4 className="font-display mt-2 text-lg leading-tight text-ink">
              {ed.school}
            </h4>
            <div className="text-sm text-ink-dim">{ed.degree}</div>
            <div className="mt-0.5 text-xs text-ink-faint">{ed.detail}</div>
          </div>
        ))}
        <div className="panel rounded-2xl p-6">
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-faint">
            Credentials
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-dim">
            {profile.certification}
          </p>
          <ul className="mt-3 space-y-1.5">
            {honors.map((h) => (
              <li key={h} className="text-sm text-gold">
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}
