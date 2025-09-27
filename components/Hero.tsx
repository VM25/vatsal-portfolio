"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronDown, TrendingUp, Mail } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: `url(/hero-background.jpg)` }}
      />
      
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/60" />
      
      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center lg:text-left lg:mr-[420px] xl:mr-[500px] 2xl:mr-[560px]">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Name & Title */}
          <div className="space-y-4">
            <motion.h1 
              className="text-5xl lg:text-7xl font-bold"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="text-gradient">Vatsal Maniar</span>
            </motion.h1>
            
            <motion.div
              className="text-lg lg:text-xl text-muted-foreground font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Computer Science → Financial Engineering
            </motion.div>
          </div>

          {/* Core Tagline */}
          <motion.div
            className="max-w-4xl mx-auto space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-xl lg:text-3xl max-w-3xl font-medium leading-tight">
              From debugging code to debugging markets — 
              <span className="text-accent-gradient"> one algorithm at a time</span>
            </h2>
            
            <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Arizona State University graduate (BS Computer Science, Magna Cum Laude) pursuing an MS in Financial Engineering at Stevens Institute of Technology. 
              Bridging the gap between computational problem-solving and quantitative finance through 
              rigorous analysis, mathematical modeling, and systematic trading strategies.
            </p>
          </motion.div>

          {/* Stats Row
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto py-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-gradient">3.74</div>
              <div className="text-xs text-muted-foreground">Undergrad GPA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-accent-gradient">Python</div>
              <div className="text-xs text-muted-foreground">Primary Language</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-gradient">∞</div>
              <div className="text-xs text-muted-foreground">Caffeine Dependency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-accent-gradient">NYC</div>
              <div className="text-xs text-muted-foreground">Next Destination</div>
            </div>
          </motion.div> */}

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
          </motion.div>

        </motion.div>
      </div>

{/* Photo (right side, lg+ only, full image; zero container/outline) */}
<motion.div
  className="hidden lg:flex items-center absolute inset-y-0 right-6 z-20"
  initial={{ opacity: 0, x: 40 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8, delay: 0.4 }}
>
  <img
    src="/vatsal_maniar.jpg"
    alt="Vatsal Maniar"
    className="
      relative block
      w-[400px] xl:w-[480px] 2xl:w-[560px]
      max-h-[78vh] h-auto
      object-contain
      rounded-2xl
      select-none
      [filter:none]
      [box-shadow:none]
      [outline:0]
      [background:transparent]
    "
    draggable={false}
  />
</motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-6 h-6 text-muted-foreground" />
      </motion.div>
    </section>
  );
};