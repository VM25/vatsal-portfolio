"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown, TrendingUp, Mail } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: `url(/hero-background.jpg)` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/60" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        {/* 2-col grid on lg+; single column below */}
        <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          {/* LEFT: text */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.h1
                  className="text-4xl md:text-5xl lg:text-6xl font-bold"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  <span className="text-gradient">Vatsal Maniar</span>
                </motion.h1>

                <motion.div
                  className="text-lg lg:text-2xl max-w-3xl leading-tight mx-auto lg:mx-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Computer Science → Financial Engineering
                </motion.div>
              </div>

              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <h2 className="text-xl lg:text-3xl max-w-3xl leading-tight mx-auto lg:mx-0">
                  From debugging code to debugging markets —
                  <span className="text-accent-gradient"> one algorithm at a time</span>
                </h2>

                <p className="text-base text-muted-foreground max-w-3xl leading-relaxed mx-auto lg:mx-0">
                  Arizona State University graduate (BS Computer Science, Magna Cum Laude) pursuing an MS in
                  Financial Engineering at Stevens Institute of Technology. Bridging the gap between
                  computational problem-solving and quantitative finance through rigorous analysis,
                  mathematical modeling, and systematic trading strategies.
                </p>
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
              </motion.div>
            </motion.div>
          </div>

          {/* RIGHT: photo (in-flow, responsive) */}
          <motion.div
            className="justify-self-center lg:justify-self-end"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="w-[min(28vw,420px)] max-w-[420px]">
              <Image
                src="/vatsal_maniar.jpg"
                alt="Vatsal Maniar"
                width={420}
                height={560}
                priority
                className="rounded-xl shadow-lg object-cover select-none"
                draggable={false}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-6 h-6 text-muted-foreground" />
      </motion.a>
    </section>
  );
};