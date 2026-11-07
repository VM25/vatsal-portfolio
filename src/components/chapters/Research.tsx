import { research } from "@/data/research";

/** Research (#research). The leading time in [data-time] is re-measured by ScrollState. */
export function Research() {
  return (
    <section id="research" className="sec research g" data-sec="research" aria-labelledby="research-h">
      <div className="veil" />
      <div className="inner paper">
        <div className="shead" style={{ marginBottom: 0 }}>
          <p className="t" data-time>
            4:45 a.m. · {research.kicker}
          </p>
          <h2 id="research-h">{research.title}</h2>
        </div>
      </div>
    </section>
  );
}
