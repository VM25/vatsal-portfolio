"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Code2, TrendingUp, Briefcase, Film, BarChart3 } from "lucide-react";

export const AboutSection = () => {
  const cards = [
    {
      title: "Technical Stack",
      icon: <Code2 className="w-12 h-12 mx-auto" />,
      accent: "text-primary",
      gradient: "from-primary/15 to-primary/5",
      body:
        "Fluent in Python, C++, Java, JavaScript, and SQL. Comfortable across full-stack development and quantitative modeling.",
      span: "", // normal card
    },
    {
      title: "Quant Toolkit",
      icon: <BarChart3 className="w-12 h-12 mx-auto" />,
      accent: "text-accent",
      gradient: "from-accent/15 to-accent/5",
      body:
        "Hands-on with Excel, MATLAB, and Python libraries (NumPy, PyTorch) for data analysis, modeling, and simulations.",
      span: "", // normal card
    },
    {
      title: "Professional Skills",
      icon: <Briefcase className="w-12 h-12 mx-auto" />,
      accent: "text-success",
      gradient: "from-success/15 to-success/5",
      body:
        "Analytical, detail-oriented, and collaborative. I turn messy requirements into clear deliverables and repeatable workflows.",
      span: "", // normal card
    },
    {
      title: "Goals",
      icon: <TrendingUp className="w-12 h-12 mx-auto" />,
      accent: "text-primary",
      gradient: "from-primary/15 to-primary/5",
      body:
        "Short-term: sharpen skills in quant research and trading. Long-term: build at the intersection of technology and capital markets.",
      span: "lg:col-span-2", // make this one a bit wider on large screens
    },
    {
      title: "Outside Work",
      icon: <Film className="w-12 h-12 mx-auto" />,
      accent: "text-accent",
      gradient: "from-accent/15 to-accent/5",
      body:
        "Movies and filmmaking, NBA, and Formula 1—I like great stories, clutch plays, and fast pit stops.",
      span: "", // normal card
    },
  ];

  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Evolution to <span className="text-gradient">Quantitative Finance</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            My journey from computer science fundamentals to quantitative finance represents
            a strategic evolution, combining technical expertise with financial acumen.
          </p>
        </motion.div>

        {/* New Cards Grid (timeline removed) */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {cards.map((c, i) => (
            <Card
              key={i}
              className={`trading-card text-center bg-gradient-to-br ${c.gradient} ${c.span}`}
            >
              <div className={`${c.accent} mb-4`}>{c.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{c.title}</h3>
              <p className="text-muted-foreground mb-3">{c.body}</p>
            </Card>
          ))}
        </motion.div>

        {/* Keep the old timeline code commented out below (in case needed later) */}
        {/*
        <div className="relative mt-24">
          ...timeline code here (commented out)...
        </div>
        */}
      </div>
    </section>
  );
};