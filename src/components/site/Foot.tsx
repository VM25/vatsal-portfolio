import { profile, links } from "@/data/profile";
import { Out } from "@/components/ui/Bits";

export function Foot() {
  return (
    <footer className="border-t border-edge py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-4">
        <span className="num text-[0.8125rem] text-fg-4">
          © 2026 {profile.name}
        </span>
        <div className="flex flex-wrap items-baseline gap-x-7 gap-y-3">
          <Out href={links.linkedin}>LinkedIn</Out>
          <Out href={links.github}>GitHub</Out>
          <a href={links.email} className="link link--tap num text-[0.9375rem]">
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
