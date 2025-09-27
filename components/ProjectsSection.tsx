"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, Code, Layers, Sparkles } from "lucide-react";

export const ProjectsSection = () => {
  const projects = [
    {
      title: "Equity Quest",
      description:
        "EquityQuest is a virtual stock market simulator offering 100+ equities and ETFs, built to let users practice trading and portfolio management in a risk-free setting. It features ETF baskets mirroring real indices, a real-time execution engine with transaction tracking, and liquidity-driven price dynamics that replicate realistic market supply-demand mechanics.",
      tech: ["C#", "MVC", "SQLite3", "MySQL", "JavaScript", "HTML/CSS"],
      category: "Finance Game",
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: "from-primary/10 to-primary/5",
      featured: true,
    },
    {
      title: "MetricSphere",
      description:
        "Financial analytics portal deployed on ASU servers. Integrated 5+ data sources (stocks, weather, geolocation) via REST/SOAP; role-based access with XML-encrypted credentials.",
      tech: ["C#", "ASP.NET", "REST", "SOAP", "XML", "JSON", "WCF", "Visual Studio"],
      category: "Data Platform",
      icon: <BarChart3 className="w-6 h-6" />,
      gradient: "from-accent/10 to-accent/5",
    },
    {
      title: "Excelerate",
      description:
        "Java/JavaFX desktop app for teams: time tracking, project & member management, and Scrum documentation — built as a production-style coursework deliverable.",
      tech: ["Java", "JavaFX", "Agile/Scrum"],
      category: "Desktop App",
      icon: <Layers className="w-6 h-6" />,
      gradient: "from-success/10 to-success/5",
    },
    {
      title: "Network Ninja",
      description:
        "Lightweight social media manager for a university organization. Designed landing-page DB + workflows with Figma and React; iterated with user testing to improve usability.",
      tech: ["React", "JavaScript", "Figma"],
      category: "Product/UI",
      icon: <Code className="w-6 h-6" />,
      gradient: "from-primary/10 to-success/5",
    },
    {
      title: "LittleMinds",
      description:
        "Set of educational mini-games to develop fine motor skills for toddlers (1–3). Built in p5.js with simple, high-contrast interactions validated through user testing.",
      tech: ["p5.js", "JavaScript"],
      category: "EdTech",
      icon: <Sparkles className="w-6 h-6" />,
      gradient: "from-purple-500/10 to-purple-500/5",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Featured <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A showcase of work across finance, machine learning, and software engineering.
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 auto-rows-fr">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              className={project.featured ? "lg:col-span-2" : ""}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              viewport={{ once: true }}
            >
              <Card className={`trading-card h-full bg-gradient-to-br ${project.gradient}`}>
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-card/50">{project.icon}</div>
                      <div>
                        <h3 className="text-xl font-semibold">{project.title}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {project.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <Badge key={tech} variant="outline" className="bg-card/50 border-primary/20 text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};