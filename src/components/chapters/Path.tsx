import { route } from "@/data/study";

/** Path (#path). The leading time in [data-time] is re-measured by ScrollState. */
export function Path() {
  return (
    <section id="path" className="sec path g" data-sec="path" aria-labelledby="path-h">
      <div className="veil" />
      <div className="inner">
        <div className="shead">
          <p className="t" data-time>
            5:40 a.m. · along the river
          </p>
          <h2 id="path-h">{route.map((r) => r.place).join(", ")}</h2>
        </div>
      </div>
    </section>
  );
}
