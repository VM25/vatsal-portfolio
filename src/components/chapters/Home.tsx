import { profile } from "@/data/profile";
import { JumpLink } from "@/components/site/JumpLink";

/** Home (#top). */
export function Home() {
  return (
    <section id="top" className="sec hero g" data-sec="home" tabIndex={-1} aria-labelledby="home-h">
      <div className="veil" />
      <div className="inner" style={{ width: "100%" }}>
        <h1 id="home-h">{profile.name}</h1>
        <p className="lede">{profile.lede}</p>
        <p className="avail">
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
      </div>
    </section>
  );
}
