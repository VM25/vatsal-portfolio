import { SectionShell } from "@/components/ui/SectionShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { skillGroups } from "@/data/skills";
import { cn } from "@/lib/utils";

export function Skills() {
  return (
    <SectionShell id="arsenal">
      <SectionHeader
        index="02"
        eyebrow="Quant Arsenal"
        title="The instruments I work with."
        lead="Grouped by where they sit on a desk — the methods, the systems that run them, and the platforms they plug into."
      />

      <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {skillGroups.map((group, gi) => (
          <Reveal key={group.id} delay={gi * 0.08}>
            <div className="panel flex h-full flex-col rounded-2xl p-6">
              <div className="flex items-center justify-between font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-faint">
                <span>CH.0{gi + 1}</span>
                <span className="text-amber">{group.skills.length} instruments</span>
              </div>
              <h3 className="font-display mt-3 text-2xl leading-tight text-ink">
                {group.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-faint">
                {group.blurb}
              </p>

              <ul className="mt-5 grid grid-cols-1 gap-x-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {group.skills.map((skill, si) => (
                  <li
                    key={skill}
                    className={cn(
                      "flex items-baseline gap-2.5 border-t border-line py-2 text-sm text-ink",
                    )}
                  >
                    <span className="font-mono text-[0.65rem] text-ink-faint">
                      {String(si + 1).padStart(2, "0")}
                    </span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
