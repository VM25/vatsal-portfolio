import { research } from "@/data/research";

/** Research (#research). ScrollState re-measures the time in [data-time] [data-clocktime]. */
export function Research() {
  return (
    <section id="research" className="sec research g" data-sec="research" aria-labelledby="research-h">
      <div className="veil" />
      <div className="inner paper">
        <div className="shead" style={{ marginBottom: 0 }}>
          <p className="t" data-time>
            <span data-clocktime>4:45 a.m.</span> · {research.kicker}
          </p>
          <h2 id="research-h">{research.title}</h2>
        </div>
      </div>
    </section>
  );
}
