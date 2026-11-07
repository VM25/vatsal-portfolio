import { research } from "@/data/research";
import { ResearchBeat, type ClaimsCopy } from "@/components/exhibits/Claims";
import { NewTab } from "@/components/site/NewTab";

const copy: ClaimsCopy = { claims: research.claims, evidence: research.evidence };

/**
 * Research (#research). Refinement R7: the premise sits beside the paper (its title,
 * question and SSRN link), then three findings, each a row with its figure.
 */
export function Research() {
  return (
    <section id="research" className="sec research g" data-sec="research" tabIndex={-1} aria-labelledby="research-h">
      <div className="veil" />
      <div className="inner paper">
        <div className="shead" style={{ marginBottom: 0 }}>
          <h2 id="research-h">{research.title}</h2>
        </div>
        <ResearchBeat
          premise={research.premise}
          paper={
            /* The paper's link ends its own description, as a citation would. */
            <p className="ask">
              <i>{research.paperTitle}</i> {research.ask}{" "}
              <NewTab href={research.links.ssrn.href}>{research.links.ssrn.label}</NewTab>
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
      </div>
    </section>
  );
}
