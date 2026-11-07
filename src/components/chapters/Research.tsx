import { research } from "@/data/research";
import { ResearchBeat, type ClaimsCopy } from "@/components/exhibits/Claims";

function NewTab({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noopener">
      <span>
        {children} <span aria-hidden="true">↗</span>
      </span>
      <span className="sr-only">, opens in a new tab</span>
    </a>
  );
}

const copy: ClaimsCopy = { claims: research.claims, evidence: research.evidence };

/** Research (#research). ScrollState re-measures the time in [data-time] [data-clocktime]. */
export function Research() {
  return (
    <section id="research" className="sec research g" data-sec="research" tabIndex={-1} aria-labelledby="research-h">
      <div className="veil" />
      <div className="inner paper">
        <div className="shead" style={{ marginBottom: 0 }}>
          <p className="t" data-time>
            <span data-clocktime>4:45 a.m.</span> · {research.kicker}
          </p>
          <h2 id="research-h">{research.title}</h2>
        </div>
        <ResearchBeat
          premise={research.premise}
          ask={
            <p className="ask">
              <i>{research.paperTitle}</i> {research.ask}
            </p>
          }
          copy={copy}
          identity={
            /* The breakeven identity, set in STIX as the prototype has it. */
            <>
              Δ<i>y</i>
              <sub>nominal</sub> = Δ<i>y</i>
              <sub>real</sub> + Δ<i>b</i>,&ensp;
              <span className="where">
                where <i>b</i> = <i>y</i>
                <sub>nominal</sub> − <i>y</i>
                <sub>TIPS</sub>
              </span>
            </>
          }
        />
        <div className="now">
          <b>{research.now.label}</b>
          <p>{research.now.body}</p>
        </div>
        <p className="lim">{research.limit}</p>
        <div className="ex-links">
          <NewTab href={research.links.ssrn.href}>{research.links.ssrn.label}</NewTab>
          <NewTab href={research.links.prospectus.href}>{research.links.prospectus.label}</NewTab>
        </div>
      </div>
    </section>
  );
}
