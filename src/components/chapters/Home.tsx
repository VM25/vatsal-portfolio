import { profile } from "@/data/profile";

/** Home (#top). The place line's clock is kept current by ScrollState. */
export function Home() {
  return (
    <section id="top" className="sec hero g" data-sec="home" tabIndex={-1} aria-labelledby="home-h">
      <div className="veil" />
      <div className="inner" style={{ width: "100%" }}>
        <p className="place">
          <span data-clock>2:04 a.m.</span> · {profile.location}
        </p>
        <h1 id="home-h">{profile.name}</h1>
      </div>
    </section>
  );
}
