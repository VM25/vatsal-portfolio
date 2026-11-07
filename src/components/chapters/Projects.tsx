import { projects } from "@/data/projects";

/** Projects (#projects). The leading time in [data-time] is re-measured by ScrollState. */
export function Projects() {
  return (
    <section id="projects" className="sec projects g" data-sec="projects" aria-labelledby="projects-h">
      <div className="veil" />
      <div className="inner">
        <div className="shead">
          <p className="t" data-time>
            3:20 a.m. · down at the waterline
          </p>
          <h2 id="projects-h">Projects</h2>
          <p className="sub">{projects.intro}</p>
        </div>
      </div>
    </section>
  );
}
