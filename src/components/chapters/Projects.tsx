import { projects } from "@/data/projects";
import { Diffusion, type DiffusionCopy } from "@/components/exhibits/Diffusion";

const dw = projects.diffusion;

/** "16 of 18" style counts inside running copy are set in the numeric face, as in the prototype. */
function counts(text: string) {
  return text.split(/(\d+ of \d+)/).map((part, i) => (i % 2 === 1 ? <b key={i}>{part}</b> : part));
}

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

const copy: DiffusionCopy = {
  controls: dw.controls,
  readouts: dw.readouts,
  treeLabel: dw.treeLabel,
  treeCaption: dw.treeCaption,
  chartLabel: dw.chartLabel,
  chartCaption: dw.chartCaption,
  formulaLabel: dw.formulaLabel,
  assumptions: dw.assumptions,
};

/** Projects (#projects). ScrollState re-measures the time in [data-time] [data-clocktime]. */
export function Projects() {
  const [stampNum, ...stampRest] = dw.result.big.split(" ");
  return (
    <section id="projects" className="sec projects g" data-sec="projects" tabIndex={-1} aria-labelledby="projects-h">
      <div className="veil" />
      <div className="inner">
        <div className="shead">
          <p className="t" data-time>
            <span data-clocktime>3:20 a.m.</span> · down at the waterline
          </p>
          <h2 id="projects-h">Projects</h2>
          <p className="sub">{projects.intro}</p>
        </div>

        <Diffusion
          copy={copy}
          intro={
            <>
              <p className="fld">{dw.field}</p>
              <h3 id="dw-h">{dw.title}</h3>
              <p className="q">{dw.question}</p>
              <p className="note">{dw.note}</p>
            </>
          }
          formulas={
            <>
              <span className="fl">
                <i>u</i> = <i>e</i>
                <sup>
                  <i>σ</i>√Δ<i>t</i>
                </sup>
                ,&ensp; <i>d</i> = 1/<i>u</i>,&ensp; <i>p</i> = (<i>e</i>
                <sup>
                  <i>r</i>Δ<i>t</i>
                </sup>{" "}
                − <i>d</i>)/(<i>u</i> − <i>d</i>)
              </span>
              <span className="fl">
                <i>V</i> = <i>e</i>
                <sup>
                  −<i>r</i>Δ<i>t</i>
                </sup>
                [<i>p V</i>
                <sub>up</sub> + (1 − <i>p</i>)<i>V</i>
                <sub>down</sub>]
              </span>
              <span className="fl">
                <i>C</i> = <i>S N</i>(<i>d</i>
                <sub>1</sub>) − <i>K e</i>
                <sup>
                  −<i>rT</i>
                </sup>
                <i>N</i>(<i>d</i>
                <sub>2</sub>)
              </span>
              <span className="fl">
                <i>d</i>
                <sub>1,2</sub> = [ln(<i>S</i>/<i>K</i>) + (<i>r</i> ± <i>σ</i>
                <sup>2</sup>/2)<i>T</i>]/(<i>σ</i>√<i>T</i>)
              </span>
            </>
          }
          result={
            <>
              <p className="big" data-beat>
                <em>{stampNum}</em> {stampRest.join(" ")}
              </p>
              <p>{dw.result.line}</p>
              <p>{counts(dw.result.caveat)}</p>
              <div className="figs">
                {dw.result.figures.map(([n, label]) => (
                  <span key={label}>
                    <b>{n}</b>
                    {label}
                  </span>
                ))}
              </div>
              <div className="ex-links">
                <NewTab href={dw.live}>{dw.openLabel}</NewTab>
                <NewTab href={dw.code}>{dw.sourceLabel}</NewTab>
              </div>
            </>
          }
        />
      </div>
    </section>
  );
}
