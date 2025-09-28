"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Linkedin, Github, FileText } from "lucide-react";

export const ContactSection = () => {
  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      description: "Best way to reach me",
      action: "vmaniar1@stevens.edu",
      href: "mailto:vmaniar1@stevens.edu",
      variant: "trading" as const,
    },
    {
      icon: <Linkedin className="w-6 h-6" />,
      title: "LinkedIn",
      description: "Professional networking",
      action: "Connect with me",
      href: "https://linkedin.com/in/vatsal-maniar/",
      variant: "default" as const,
    },
    {
      icon: <Github className="w-6 h-6" />,
      title: "GitHub",
      description: "Code repositories",
      action: "View Portfolio Code",
      href: "https://github.com/VM25/vatsal-portfolio.git",
      variant: "outline" as const,
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Resume",
      description: "Download CV",
      action: "Get my resume",
      href: "/Maniar_Vatsal.pdf",
      variant: "accent" as const,
      newTab: true,
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Let&apos;s <span className="text-gradient">Connect</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Open to discussing quantitative finance, career opportunities, or why my code
            works better with coffee. Feel free to reach out!
          </p>
        </motion.div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="trading-card">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-card/50">
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{method.title}</h3>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
                <Button
                  variant={method.variant}
                  className="w-full"
                  asChild
                >
                  <a
                    href={method.href}
                    target={method.newTab || method.href.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                  >
                    {method.action}
                  </a>
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.div
          className="text-center mt-12 pt-8 border-t border-border/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-muted-foreground font-mono">
            © {new Date().getFullYear()} Vatsal Maniar. Built with React, Next.js, Framer, ShadCN.
          </p>
        </motion.div>
      </div>
    </section>
  );
};