"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Award, MapPin } from "lucide-react";

type Edu = {
  degree: string;
  school: string;
  location: string;
  period: string;
  status: "Current" | "Graduated";
  gpa?: string;
  highlights: string[];
  note: string;
};

export const Education = () => {
  const education: Edu[] = [
    {
      degree: "Master of Science in Financial Engineering",
      school: "Stevens Institute of Technology",
      location: "Hoboken, NJ",
      period: "Sept 2025 - Dec 2026",
      status: "Current",
      highlights: [
        "Quantitative Methods and Risk Management",
        "Algorithmic Trading Strategies",
        "Derivatives and Fixed Income Securities",
      ],
      note: "Because apparently a Bachelor's wasn't enough debt.",
    },
    {
      degree: "Bachelor of Science in Computer Science",
      school: "Arizona State University",
      location: "Tempe, AZ",
      period: "Aug 2021 - May 2025",
      status: "Graduated",
      gpa: "3.74/4.0",
      highlights: ["Magna Cum Laude", "Dean's List (4/8 Semesters)", "New American University (NAmU) Scholarship"],
      note: "Because debugging in 115°F weather builds character.",
    },
  ];

  const levelOf = (degree: string) =>
    degree.toLowerCase().includes("master") ? ("masters" as const) : ("bachelors" as const);

  const styles = (degree: string) => {
    const lvl = levelOf(degree);
    return lvl === "masters"
      ? {
          // primary styling (Stevens MFE)
          bar: "before:bg-primary/50",
          iconWrap: "bg-primary/12",
          icon: "text-primary",
          wash: "from-primary/12 via-primary/5 to-transparent",
          ring: "ring-1 ring-primary/15",
          chip: "bg-primary/10 text-primary border-primary/25",
          status: "bg-primary/12 text-primary border-primary/25",
        }
      : {
          // accent styling (ASU BS CS)
          bar: "before:bg-accent/50",
          iconWrap: "bg-accent/12",
          icon: "text-accent",
          wash: "from-accent/12 via-accent/5 to-transparent",
          ring: "ring-1 ring-accent/15",
          chip: "bg-accent/10 text-accent border-accent/25",
          status: "bg-accent/12 text-accent border-accent/25",
        };
  };

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Academic <span className="text-gradient">Foundation</span>
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Building quantitative expertise through rigorous academic training — one degree at a time.
          </p>
        </motion.div>

        <div className="space-y-8">
          {education.map((edu, index) => {
            const s = styles(edu.degree);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <Card
                  className={[
                    "trading-card relative overflow-hidden",
                    "border border-white/5 backdrop-blur-sm",
                    s.ring,
                    // left accent bar
                    "before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-xl",
                    s.bar,
                    // soft gradient wash (top-right)
                    "after:pointer-events-none after:absolute after:-z-10 after:-inset-12 after:rounded-[1.25rem]",
                    `after:bg-gradient-to-br after:${s.wash}`,
                  ].join(" ")}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className={`p-3 rounded-lg ${s.iconWrap}`}>
                        <GraduationCap className={`w-8 h-8 ${s.icon}`} />
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-2">
                          <h3 className="text-xl font-semibold">{edu.degree}</h3>
                          <Badge variant="outline" className={`${s.status} border`}>
                            {edu.status}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-muted-foreground">
                          <div className="font-medium text-foreground">{edu.school}</div>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {edu.location}
                            </span>
                            <span>{edu.period}</span>
                            {edu.gpa && (
                              <span className="flex items-center gap-1">
                                <Award className="w-4 h-4" />
                                {edu.gpa}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {edu.highlights.map((h, i) => (
                          <Badge key={i} variant="outline" className={`text-xs border ${s.chip}`}>
                            {h}
                          </Badge>
                        ))}
                      </div>

                      <p className="text-sm text-muted-foreground italic">{edu.note}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};