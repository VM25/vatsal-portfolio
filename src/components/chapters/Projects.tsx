import { projects } from "@/data/projects";
import { Diffusion, type DiffusionCopy } from "@/components/exhibits/Diffusion";
import { Liquidity, type LiquidityCopy } from "@/components/exhibits/Liquidity";
import { ProjectRail, StageBody, type RailCopy } from "@/components/exhibits/ProjectRail";
import { NewTab } from "@/components/site/NewTab";

const dw = projects.diffusion;
const lp = projects.liquidity;
const railCopy: RailCopy = { label: projects.moreLabel, ...projects.railLinks };

/**
 * The cut's figures, as the prototype sets them: R in STIX italic, and the numbers
 * (4.2%, "1 to 2 bp", "11 to 12 bp") in the numeric face.
 */
function figures(text: string) {
  return text.split(/(R²|\d+(?:\.\d+)?%|\d+ to \d+ bp)/).map((part, i) => {
    if (i % 2 === 0) return part;
    if (part === "R²")
      return (
        <span key={i}>
          <span className="stix">
            <i>R</i>
          </span>
          ²
        </span>
      );
    return <b key={i}>{part}</b>;
  });
}

const lpCopy: LiquidityCopy = {
  canvasLabel: lp.canvasLabel,
  counters: lp.counters,
  caption: lp.caption,
  replay: lp.replay,
  rails: lp.rails,
  unit: lp.unit,
  finished: lp.finished,
};

/** "16 of 18" style counts inside running copy are set in the numeric face, as in the prototype. */
function counts(text: string) {
  return text.split(/(\d+ of \d+)/).map((part, i) => (i % 2 === 1 ? <b key={i}>{part}</b> : part));
}

const copy: DiffusionCopy = {
  controls: dw.controls,
  inputsLabel: dw.inputsLabel,
  annotations: dw.annotations,
  terms: dw.terms,
  treeLabel: dw.treeLabel,
  treeCaption: dw.treeCaption,
  treeCaptionAll: dw.treeCaptionAll,
  treeTable: dw.treeTable,
  treeMore: dw.treeMore,
  chartLabel: dw.chartLabel,
  chartCaption: dw.chartCaption,
  percentText: dw.percentText,
  say: dw.say,
};

/** Projects (#projects). */
export function Projects() {
  const [stampNum, ...stampRest] = dw.result.big.split(" ");
  const [cutNum, ...cutRest] = lp.result.big.split(" ");
  return (
    <section id="projects" className="sec projects g" data-sec="projects" tabIndex={-1} aria-labelledby="projects-h">
      <div className="veil" />
      <div className="inner">
        <div className="shead">
          <h2 id="projects-h">Projects</h2>
        </div>

        <Diffusion
          copy={copy}
          intro={
            <>
              <p className="fld">{dw.field}</p>
              <h3 id="dw-h">{dw.title}</h3>
              <p className="q">{dw.question}</p>
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

        <Liquidity
          copy={lpCopy}
          intro={
            <>
              <p className="fld">{lp.field}</p>
              <h3 id="lp-h">{lp.title}</h3>
              <p className="q">{lp.question}</p>
            </>
          }
          cut={
            <>
              <p className="big" data-beat>
                <em>{cutNum}</em> {cutRest.join(" ")}
              </p>
              <p>{figures(lp.result.forecast)}</p>
              <p>{figures(lp.result.losses)}</p>
              <p className="cap">{lp.result.caveat}</p>
              <div className="ex-links">
                <NewTab href={lp.live}>{lp.openLabel}</NewTab>
                <NewTab href={lp.code}>{lp.sourceLabel}</NewTab>
              </div>
            </>
          }
        />

        <div className="more" id="more">
          <h3>{projects.moreLabel}</h3>
          <ProjectRail items={projects.rail} copy={railCopy} />
          {/*
            Without JavaScript, or when the bundle never arrives (html.js removed): all six,
            each with its stage content under its title. Hidden under html.js.
          */}
          <div className="rail-all">
            {projects.rail.map((p) => (
              <div className="stage" key={p.title}>
                <StageBody p={p} copy={railCopy} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
