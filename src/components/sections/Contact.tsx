"use client";

import { profile, links } from "@/data/profile";
import { R } from "@/components/ui/Bits";
import { ContactForm } from "@/components/ui/ContactForm";

const CHANNELS = [
  { k: "Email", v: profile.email, href: links.email, out: false },
  { k: "LinkedIn", v: "vatsal-maniar", href: links.linkedin, out: true },
  { k: "GitHub", v: "VM25", href: links.github, out: true },
  {
    k: "Phone",
    v: profile.phone,
    href: `tel:${profile.phone.replace(/[^\d+]/g, "")}`,
    out: false,
  },
];

export function Contact() {
  return (
    <section
      id="contact"
      className="section pb-[clamp(4rem,8vw,7rem)]"
      style={{ ["--accent"]: "var(--saffron)" } as React.CSSProperties}
    >
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-7">
            <div className="sec-head !mb-0">
              <R>
                <p className="tag">05 — Contact</p>
              </R>
              <R d={1}>
                <h2 className="mega !text-[clamp(2.5rem,6.5vw,5rem)]">
                  Let&rsquo;s talk
                </h2>
              </R>
              <R d={2}>
                <p className="lede">{profile.status}</p>
              </R>
            </div>
            <R d={3}>
              <div className="mt-8">
                <ContactForm />
              </div>
            </R>
          </div>

          <R d={2} className="min-w-0 lg:col-span-4 lg:col-start-9">
            <ul className="border-t border-nocturnal/50">
              {CHANNELS.map((c) => (
                <li
                  key={c.k}
                  className="flex flex-wrap items-center gap-x-6 border-b border-nocturnal/50 py-1"
                >
                  <span className="num w-20 shrink-0 text-[0.68rem] uppercase tracking-[0.16em] text-aqua">
                    {c.k}
                  </span>
                  <a
                    href={c.href}
                    className="link !normal-case !tracking-normal !text-[0.9rem]"
                    {...(c.out ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                  >
                    {c.v}
                    {c.out ? " ↗" : ""}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={links.resume}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn--ghost mt-6"
            >
              Résumé
            </a>
            <p className="num mt-8 text-[0.7rem] uppercase tracking-[0.14em] text-aqua">
              © 2026 · {profile.location}
            </p>
          </R>
        </div>
      </div>
    </section>
  );
}
