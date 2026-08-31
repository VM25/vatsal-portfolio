import { profile, links } from "@/data/profile";
import { R, Action } from "@/components/ui/Bits";

/**
 * Type is the hero. The name is set as large as the viewport allows and
 * everything else defers to it.
 */
export function Hero() {
  return (
    <header
      id="top"
      className="flex min-h-[92svh] flex-col justify-between pt-[calc(var(--bar)+clamp(3rem,9vw,7rem))] pb-[clamp(2.5rem,6vw,5rem)]"
    >
      <div>
        <R>
          <p className="label">{profile.location}</p>
        </R>

        <R d={1}>
          <h1 className="hero-type mt-[clamp(1.5rem,4vw,3rem)]">
            Vatsal
            <br />
            Maniar
          </h1>
        </R>
      </div>

      <div className="mt-[clamp(3rem,8vw,6rem)] grid gap-x-12 gap-y-8 lg:grid-cols-12">
        <R d={2} className="lg:col-span-6 min-w-0">
          <p className="sub max-w-[44ch]">{profile.standfirst}</p>
        </R>

        <R d={3} className="lg:col-span-6 lg:justify-self-end min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Action href="#work">See the work</Action>
            <Action href={links.resume} quiet external>
              Résumé
            </Action>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-edge pt-5">
            <span
              className="h-[7px] w-[7px] flex-none bg-accent"
              aria-hidden
            />
            <span className="num text-[0.8125rem] text-fg">
              {profile.availability}
            </span>
            <span className="text-[0.8125rem] text-fg-3">
              — {profile.interests.join(" · ")}
            </span>
          </div>
        </R>
      </div>
    </header>
  );
}
