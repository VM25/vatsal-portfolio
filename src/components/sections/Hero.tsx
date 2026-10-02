"use client";

import Image from "next/image";
import { profile, links } from "@/data/profile";
import { R } from "@/components/ui/Bits";
import { Decode } from "@/components/ui/Decode";

/**
 * The name at full width, decoded once on load, and the portrait as a printed
 * plate beside it.
 */
export function Hero() {
  return (
    <header
      id="top"
      className="relative pb-[clamp(1rem,3vw,2rem)] pt-[calc(var(--bar)+clamp(2rem,5vw,3.75rem))]"
    >
      <div className="shell">
        <R>
          <p className="tag">{profile.location}</p>
        </R>

        <div className="mt-5 grid items-end gap-8 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            {/* not wrapped in a reveal: the name is on screen from the first paint */}
            <h1 className="mega">
              <Decode lines={["Vatsal", "Maniar"]} />
            </h1>
            <R d={3}>
              <p className="lede mt-6">{profile.standfirst}</p>
            </R>
            <R d={4}>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href="#projects" className="btn">
                  See the projects
                </a>
                <a href={links.resume} target="_blank" rel="noreferrer noopener" className="btn btn--ghost">
                  Résumé
                </a>
                <span className="num ml-1 text-[0.72rem] uppercase tracking-[0.16em] text-aqua">
                  {profile.availability}
                </span>
              </div>
            </R>
          </div>

          <R d={2} className="min-w-0 lg:col-span-4">
            <div className="card card--lit card--ticked relative overflow-hidden">
              {/* The photograph, as taken. No duotone, no screen, no filter. */}
              <Image
                src="/images/vatsal-maniar.jpg"
                alt={profile.name}
                width={1200}
                height={1601}
                priority
                sizes="(min-width: 1024px) 28vw, 80vw"
                className="block w-full"
              />
              <div className="flex items-baseline justify-between gap-3 border-t border-nocturnal/50 px-3 py-2.5">
                <span className="num text-[0.62rem] uppercase tracking-[0.16em] text-aqua">
                  M.S. Financial Engineering
                </span>
                <span className="num text-[0.62rem] text-saffron">Stevens</span>
              </div>
            </div>
          </R>
        </div>
      </div>

    </header>
  );
}
