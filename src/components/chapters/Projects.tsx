import { projects } from "@/data/projects";

/** Projects (#projects). ScrollState re-measures the time in [data-time] [data-clocktime]. */
export function Projects() {
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
      </div>
    </section>
  );
}
