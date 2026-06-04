import { profile, links } from "@/data/profile";
import { ArrowUpRight } from "@/components/ui/icons";

const footerLinks = [
  { label: "Email", href: links.email },
  { label: "LinkedIn", href: links.linkedin, external: true },
  { label: "GitHub", href: links.github, external: true },
  { label: "Résumé", href: links.resume, external: true },
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line bg-base/40 py-14 backdrop-blur-sm">
      <div className="shell flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
            {profile.location} · {profile.region}
          </div>
          <p className="font-display mt-3 max-w-md text-pretty text-2xl leading-tight text-ink">
            {profile.thesis}
          </p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {footerLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              {...(l.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="group inline-flex items-center gap-1 font-mono text-sm uppercase tracking-[0.14em] text-ink-dim transition-colors hover:text-amber"
            >
              {l.label}
              <ArrowUpRight className="text-xs opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          ))}
        </div>
      </div>

      <div className="shell mt-10 flex flex-col gap-2 border-t border-line pt-6 font-mono text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>Built with Next.js, React Three Fiber, GSAP &amp; Framer Motion.</span>
      </div>
    </footer>
  );
}
