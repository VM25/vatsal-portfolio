import { profile } from "@/data/profile";
import { JumpLink } from "@/components/site/JumpLink";

/** Home (#top). The place line's clock and the reflection count are written by the scene. */
export function Home() {
  return (
    <section id="top" className="sec hero g" data-sec="home" tabIndex={-1} aria-labelledby="home-h">
      <div className="veil" />
      <div className="inner" style={{ width: "100%" }}>
        <p className="place">
          <span data-clock>2:04 a.m.</span> · {profile.location}
        </p>
        <h1 id="home-h">{profile.name}</h1>
        <p className="lede">{profile.lede}</p>
        <p className="avail">
          <i aria-hidden="true" />
          {profile.availability}
        </p>
        <div className="acts">
          <JumpLink className="btn" href="#projects">
            See the work
          </JumpLink>
          <JumpLink className="tlink" href="#research">
            Read the research
          </JumpLink>
        </div>
        <p className="refl stix" aria-hidden="true">
          The lamp&apos;s reflection averages <i>n</i> = <b data-n>1</b> ripples. Its wobble shrinks like <i>σ</i>/√<i>n</i>.
        </p>
      </div>
    </section>
  );
}
