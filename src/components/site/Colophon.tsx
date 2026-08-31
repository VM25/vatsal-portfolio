import { profile, links } from "@/data/profile";
import { systemCount } from "@/data/systems";
import { Eyebrow, Out } from "@/components/record/Primitives";

/**
 * A real colophon: what the thing is set in, what it is built with, and what it
 * contains. It is the last honest thing a printed record does.
 */
export function Colophon() {
  const year = 2026;
  return (
    <footer className="border-t border-hair-3 py-12">
      <div className="grid gap-8 md:grid-cols-12 md:gap-x-10">
        <div className="min-w-0 md:col-span-5">
          <Eyebrow className="block">Colophon</Eyebrow>
          <p className="prose mt-3 max-w-[42ch] text-[0.875rem]">
            Set in Instrument Serif, Archivo, and IBM Plex Mono. Built with
            Next.js and Tailwind, with no animation library and no WebGL — every
            transition here is a CSS transform driven by one intersection
            observer, which is why it renders the same in Safari as in Chrome.
          </p>
        </div>

        <div className="min-w-0 md:col-span-3">
          <Eyebrow className="block">Contents</Eyebrow>
          <ul className="mt-3 grid gap-1.5 text-[0.875rem] text-ink-55">
            <li className="data">{systemCount} systems</li>
            <li className="data">8 plates</li>
            <li className="data">1 research memo</li>
          </ul>
        </div>

        <div className="min-w-0 md:col-span-4">
          <Eyebrow className="block">Elsewhere</Eyebrow>
          <ul className="mt-3 grid gap-2 text-[0.875rem]">
            <li>
              <Out href={links.linkedin}>LinkedIn</Out>
            </li>
            <li>
              <Out href={links.github}>GitHub</Out>
            </li>
            <li>
              <a href={links.email} className="link">
                {profile.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-hair pt-5">
        <Eyebrow>
          © {year} {profile.name}
        </Eyebrow>
        <Eyebrow>{profile.edition} · {profile.location}</Eyebrow>
      </div>
    </footer>
  );
}
