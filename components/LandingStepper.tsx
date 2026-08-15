"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export default function LandingStepper() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll coordinates relative to the stepper section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Map scroll progress to the scaleX of the connecting line (fills as scroll progresses)
  const scaleX = useTransform(scrollYProgress, [0.35, 0.65], [0, 1]);

  const steps = [
    {
      num: "01",
      title: "LINK DISCORD SQUAD",
      desc: "Sync your competitive ID tracker, server region, and profile stats to register in our records.",
    },
    {
      num: "02",
      title: "CHOOSE A TIER DIVISION",
      desc: "Select a placement level from Bronze to Diamond depending on your current Heroic rank scores.",
    },
    {
      num: "03",
      title: "COORDINATE MATCHING",
      desc: "Our active leadership team contacts you via Discord with scrim sessions and custom rooms access.",
    },
  ];

  return (
    <div ref={containerRef} className="relative w-full max-w-5xl mx-auto py-12 px-6 rounded border border-hairline/40 bg-panel/30 overflow-hidden select-none">
      {/* Background Texture Asset with Low Opacity */}
      <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-screen -z-0">
        <Image
          src="/design_assets/randomdesign2.jpeg"
          alt="Stepper texture"
          fill
          sizes="(max-width: 1024px) 100vw, 1000px"
          className="object-cover object-center"
        />
      </div>

      {/* Horizontal Line connector (Visible on Desktop only) */}
      <div className="absolute top-[82px] left-[15%] right-[15%] h-[1px] bg-hairline z-0 hidden md:block">
        <motion.div
          style={{ scaleX, transformOrigin: "left" }}
          className="w-full h-full bg-primary"
        />
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            custom={idx}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="flex flex-col items-center text-center group"
          >
            {/* Step marker bubble (Avatar full-rounded exception) */}
            <div className="w-16 h-16 rounded-full border border-hairline bg-panel flex items-center justify-center mb-5 z-10 transition-colors duration-300 group-hover:border-primary">
              <span className="font-display font-bold text-lg text-primary tracking-normal">
                {step.num}
              </span>
            </div>

            {/* Step title */}
            <h4 className="font-display text-sm font-bold text-text-primary tracking-widest uppercase mb-2">
              {step.title}
            </h4>
            
            {/* Step description */}
            <p className="font-body text-xs text-text-muted leading-relaxed max-w-xs">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
