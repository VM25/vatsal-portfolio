"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Calendar } from "lucide-react";

export const Experience = () => {
  const experiences = [
    {
      title: "Software & Platform Development Intern",
      company: "Alcove Ridge Consulting LLC",
      location: "Remote",
      period: "Sept 2024 - Jun 2025",
      type: "Capstone Project",
      description: [
        "Designed responsive platform dashboards for users, events, and deals — improving workflows and cutting admin time.",
        "Integrated APIs and streamlined internal operations to support MVP launch for investor demos.",
        "Optimized performance and accessibility, ensuring smoother user experience across devices."
      ],
      technologies: ["React", "Next.js", "TailwindCSS", "Shadcn UI", "tRPC", "Stripe", "PostgreSQL"],
      note: "Where I learned that 'it works on my machine' isn't an acceptable excuse in production."
    },
    {
      title: "Asset Specialist",
      company: "ASU Capital Assets Management Office",
      location: "Tempe, AZ", 
      period: "May 2024 - May 2025",
      type: "Institutional Operations",
      description: [
        "Managed tagging and reporting of high-value assets, supporting compliance for $1.5B+ in university property.",
        "Improved asset tracking processes, reducing reporting time and strengthening data accuracy.", 
        "Collaborated with auditors and campus teams to maintain financial accountability."
      ],
      technologies: ["Workday", "Excel"],
      note: "Discovered that “assets” aren’t just financial — sometimes it’s literally a microscope worth more than my tuition."
    },
    {
      title: "IT Project Management Consultant",
      company: "ASU Educational Outreach and Student Services (EOSS) Technology Team",
      location: "Tempe, AZ", 
      period: "June 2024 - Sept 2024",
      type: "Special Projects Consultant",
      description: [
        "Led short-term tech projects that improved infrastructure reliability and efficiency across multiple departments.",
        "Coordinated with cross-functional teams to align requirements and deliverables with strategic goals.", 
        "Streamlined documentation and workflows, reducing rework and enhancing project outcomes."
      ],
      technologies: ["Trello", "Notion", "Asana", "AirTable", "Excel", "TypeScript"],
      note: "Realized half of project management is renaming the same task across three different tools."
    },
    {
      title: "Verification Supervisor",
      company: "ASU Admission Services",
      location: "Tempe, AZ", 
      period: "May 2022 - May 2024",
      type: "Institutional Operations",
      description: [
        "Supervised a team of 60+ student verifiers handling 30,000+ applicant records with near-perfect accuracy.",
        "Trained and mentored peers into leadership roles, setting new departmental benchmarks for speed and quality.", 
        "Standardized onboarding and review processes, improving team productivity and compliance."
      ],
      technologies: ["PeopleSoft", "Citrix Workspace", "OnBase", "Excel"],
      note: "Learned that caffeine is a legitimate data-validation strategy."
    },
    {
      title: "Undergraduate Teaching Assistant (UGTA)",
      company: "Ira A. Fulton Schools of Engineering, ASU",
      location: "Tempe, AZ",
      period: "Aug 2023 - Dec 2023", 
      type: "Instructional Support",
      description: [
        "Supported 40+ students in mastering programming fundamentals and algorithms.",
        "Led labs and review sessions that boosted class performance and confidence.",
        "Assisted with grading and feedback, helping streamline course delivery."
      ],
      technologies: ["Arduino", "Java", "GitHub", "Canvas Instructor", "GradeScope"],
      note: "Teaching recursion made me question whether I truly understood recursion myself."
    },
    {
      title: "Data Analyst (Verifier)",
      company: "ASU Admission Services",
      location: "Tempe, AZ",
      period: "Oct 2021 - May 2022", 
      type: "Institutional Operations",
      description: [
        "Processed 15,000+ applications with strong attention to detail and accuracy.",
        "Helped streamline data entry and filing, improving team productivity.",
        "Ensured data quality through regular audits and validations."
      ],
      technologies: ["PeopleSoft", "Citrix Workspace", "OnBase", "Excel"],
      note: "Became a human OCR machine before AI tools made it cool."
    },
    {
      title: "Graphic Designer/Video Editor",
      company: "Multiple Clients",
      location: "Mumbai, MH, India",
      period: "Aug 2019 - Mar 2020", 
      type: "Freelance",
      description: [
        "Produced graphics and videos for diverse clients, delivering over 60 projects on time.",
        "Boosted client engagement with professional promotional content.",
        "Developed design skills while managing client expectations and deadlines.",
        "Utilized software like Adobe Photoshop, Illustrator, and Premiere Pro"
      ],
      technologies: ["Adobe Photoshop", "Adobe After Effects", "Adobe Premiere Pro"],
      note: "Discovered that “make it pop” is the most expensive phrase in design."
    },
  ];

const getTypeColor = (type: string) => {
  switch (type) {
    case "Capstone Project":
      return "text-success";
    case "Institutional Operations":
      return "text-primary";
    case "Special Projects Consultant":
      return "text-red-500";
    case "Instructional Support":
      return "text-accent";
    case "Freelance":
      return "text-pink-500";
    default:
      return "text-muted-foreground";
  }
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
            Professional <span className="text-gradient">Experience</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Building technical expertise while discovering my passion for quantitative finance.
          </p>
        </motion.div>

        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="trading-card">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-lg bg-accent/10">
                      <Briefcase className="w-8 h-8 text-accent" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-2">
                        <h3 className="text-xl font-semibold">{exp.title}</h3>
                        <Badge variant="outline" className={getTypeColor(exp.type)}>
                          {exp.type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-muted-foreground">
                        <div className="font-medium text-foreground">{exp.company}</div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {exp.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {exp.period}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {exp.description.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground italic">
                      {exp.note}
                    </p>
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