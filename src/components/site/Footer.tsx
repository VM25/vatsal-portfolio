import { profile, links } from "@/data/profile";

export function Footer() {
  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-7">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 items-center justify-center bg-ink px-1.5 font-mono text-[0.74rem] font-bold leading-none tracking-tight text-paper">
            VM
          </span>
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-3">
            {profile.name} · {profile.region}
          </span>
        </div>
        <div className="flex items-center gap-5 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-3">
          <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ink">
            LinkedIn
          </a>
          <a href={links.github} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ink">
            GitHub
          </a>
          <a href={links.email} className="transition-colors hover:text-ink">
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
