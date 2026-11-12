import Image from "next/image";
import { profile } from "@/data/profile";
import { posts } from "@/data/posts";
import { frm, route, study } from "@/data/study";

/** Path (#path). */
export function Path() {
  const last = route.length - 1;
  return (
    <section id="path" className="sec path g" data-sec="path" tabIndex={-1} aria-labelledby="path-h">
      <div className="veil" />
      <div className="inner">
        <div className="shead">
          <h2 id="path-h">{route.map((r) => r.place).join(", ")}</h2>
        </div>
        <div className="who">
          <Image
            className="portrait"
            src="/images/vatsal-maniar.jpg"
            alt={profile.name}
            width={1200}
            height={1601}
            sizes="(min-width: 900px) 220px, 160px"
            loading="lazy"
          />
          <div className="route">
            {route.map((r, i) => {
              const s = "study" in r ? study.find((x) => x.id === r.study) : undefined;
              return (
                <div className={i === last ? "stop here" : "stop"} key={r.place}>
                  <h3>{r.place}</h3>
                  <p className="w">{r.note}</p>
                  {s && (
                    <p className="d">
                      {s.detail.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="frm">
          <b>
            <em>{frm.body}</em> {frm.title}
          </b>
          <span>
            {frm.full}, {frm.sitting}
          </span>
        </div>
        <div className="roles">
          <h3>Experience</h3>
          {posts.map((p) => (
            <div className="role" key={p.id}>
              <b>{p.role}</b>
              <span>{p.org}</span>
              <span>{p.period}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
