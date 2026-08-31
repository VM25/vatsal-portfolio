import { profile, links } from "@/data/profile";
import { R, Label, Out, Action } from "@/components/ui/Bits";

export function Contact() {
  return (
    <section id="contact" className="section">
      <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-7 min-w-0">
          <R>
            <Label>05 — Contact</Label>
          </R>
          <R d={1}>
            <p className="hero-type mt-6 !text-[clamp(2.5rem,7vw,5.5rem)]">
              Let&rsquo;s talk.
            </p>
          </R>
          <R d={2}>
            <p className="sub mt-7">{profile.status}</p>
          </R>
          <R d={3}>
            <div className="mt-9 flex flex-wrap gap-3">
              <Action href={links.email}>Email me</Action>
              <Action href={links.resume} quiet external>
                Résumé
              </Action>
            </div>
          </R>
        </div>

        <div className="lg:col-span-4 lg:col-start-9 min-w-0">
          <R d={2}>
            <ul className="border-t border-edge">
              {[
                { k: "Email", v: profile.email, href: links.email, out: false },
                { k: "LinkedIn", v: "vatsal-maniar", href: links.linkedin, out: true },
                { k: "GitHub", v: "VM25", href: links.github, out: true },
                {
                  k: "Phone",
                  v: profile.phone,
                  href: `tel:${profile.phone.replace(/[^\d+]/g, "")}`,
                  out: false,
                },
              ].map((c) => (
                <li
                  key={c.k}
                  className="flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-edge py-4"
                >
                  <span className="label w-20 flex-none">{c.k}</span>
                  {c.out ? (
                    <Out href={c.href}>{c.v}</Out>
                  ) : (
                    <a href={c.href} className="link link--tap num text-[0.9375rem]">
                      {c.v}
                    </a>
                  )}
                </li>
              ))}
            </ul>
            <p className="num mt-6 text-[0.8125rem] text-fg-4">
              {profile.location}
            </p>
          </R>
        </div>
      </div>
    </section>
  );
}
