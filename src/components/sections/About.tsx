import { profile } from "@/data/profile";
import { study } from "@/data/study";
import { R, Head, Label } from "@/components/ui/Bits";

export function About() {
  return (
    <section id="about" className="section">
      <Head n="02 — About" title="How I got here" />

      <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-7 min-w-0">
          {profile.about.map((p, i) => (
            <R key={i} d={i}>
              <p className="body mt-0 mb-6 last:mb-0">{p}</p>
            </R>
          ))}

          <R d={2}>
            <blockquote className="mt-12 border-t border-edge pt-10">
              <p className="quote max-w-[22ch]">
                A number you cannot explain is not a measurement. It is a{" "}
                <em>guess with decimal places.</em>
              </p>
            </blockquote>
          </R>
        </div>

        <div className="lg:col-span-4 lg:col-start-9 min-w-0">
          <R d={1}>
            <Label>Studied</Label>
          </R>
          {study.map((s, i) => (
            <R key={s.id} d={i + 2}>
              <div className="mt-5 border-t border-edge pt-5">
                <h3 className="h3 text-[1.0625rem]">{s.school}</h3>
                <p className="mt-1.5 text-[0.9375rem] text-fg-2">{s.degree}</p>
                <p className="num mt-1 text-[0.8125rem] text-fg-4">
                  {s.period} · {s.detail}
                </p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {s.courses.map((c) => (
                    <li key={c} className="tag">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </R>
          ))}

          <R d={4}>
            <p className="num mt-8 border-t border-edge pt-5 text-[0.8125rem] text-fg-3">
              {profile.certification}
            </p>
          </R>
        </div>
      </div>
    </section>
  );
}
