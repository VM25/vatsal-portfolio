import { route } from "@/data/study";

/** Path (#path). ScrollState re-measures the time in [data-time] [data-clocktime]. */
export function Path() {
  return (
    <section id="path" className="sec path g" data-sec="path" tabIndex={-1} aria-labelledby="path-h">
      <div className="veil" />
      <div className="inner">
        <div className="shead">
          <p className="t" data-time>
            <span data-clocktime>5:40 a.m.</span> · along the river
          </p>
          <h2 id="path-h">{route.map((r) => r.place).join(", ")}</h2>
        </div>
      </div>
    </section>
  );
}
