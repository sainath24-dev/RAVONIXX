"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Hero from "@/components/Hero";
import MarqueeStrip from "@/components/MarqueeStrip";
import FeatureGrid from "@/components/FeatureGrid";
import LandingStepper from "@/components/LandingStepper";
import RosterTeaser from "@/components/RosterTeaser";
import PartnerStrip from "@/components/PartnerStrip";
import Testimonials from "@/components/Testimonials";
import FAQAccordion from "@/components/FAQAccordion";
import { clipReveal } from "@/lib/motion";

export default function Home() {
  return (
    <div className="flex flex-col w-full pb-20 overflow-x-hidden">
      {/* 1. Hero Landing Section */}
      <Hero />

      {/* 2. Marquee Slogan strip */}
      <MarqueeStrip />

      {/* 3. Feature Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="text-center md:text-left mb-16 select-none">
          <span className="text-[10px] font-display text-primary tracking-widest block uppercase mb-3 flex items-center justify-center md:justify-start gap-0.5">
            <span className="text-primary italic font-bold">/</span>FEATURES
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-wider text-text-primary">
            OUR FEATURES
          </h2>
        </div>
        <FeatureGrid />
      </section>

      {/* 4. Stepper Guide Section */}
      <section className="border-y border-hairline bg-panel/30 py-24 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 select-none">
            <span className="text-[10px] font-display text-primary tracking-widest block uppercase mb-3 flex items-center justify-center gap-0.5">
              <span className="text-primary italic font-bold">/</span>STEPS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-wider text-text-primary">
              HOW IT WORKS
            </h2>
          </div>
          <LandingStepper />
        </div>
      </section>

      {/* 5. Roster Teaser Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16 select-none">
          <div>
            <span className="text-[10px] font-display text-primary tracking-widest block uppercase mb-3 flex items-center gap-0.5">
              <span className="text-primary italic font-bold">/</span>ROSTER
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-wider text-text-primary">
              MEET OUR TEAM
            </h2>
          </div>
          <a
            href="/team"
            className="px-5 py-2.5 font-display text-xs tracking-widest text-text-primary border border-hairline hover:border-primary transition-colors duration-200 clip-card-sm font-semibold hover:bg-panel-raised"
          >
            VIEW FULL ROSTER
          </a>
        </div>
        <RosterTeaser />
      </section>

      {/* 6. Testimonials & Partner Strip */}
      <section className="border-t border-hairline bg-panel/20 py-24 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-20">
          {/* Testimonial walls */}
          <div>
            <div className="text-center mb-16 select-none">
              <span className="text-[10px] font-display text-primary tracking-widest block uppercase mb-3 flex items-center justify-center gap-0.5">
                <span className="text-primary italic font-bold">/</span>FEEDBACK
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-wider text-text-primary">
                WHAT THEY SAY
              </h2>
            </div>
            <Testimonials />
          </div>

          {/* Partner/Press Strip */}
          <div className="border-t border-hairline/60 pt-16">
            <div className="text-center mb-12 select-none">
              <span className="text-[10px] font-display text-text-dim tracking-widest block uppercase flex items-center justify-center gap-0.5">
                <span className="text-primary italic font-bold">/</span>SPONSORS & PARTNERS
              </span>
            </div>
            <PartnerStrip />
          </div>
        </div>
      </section>

      {/* 7. FAQ Accordion Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="text-center mb-16 select-none">
          <span className="text-[10px] font-display text-primary tracking-widest block uppercase mb-3 flex items-center justify-center gap-0.5">
            <span className="text-primary italic font-bold">/</span>FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-wider text-text-primary">
            FREQUENTLY ASKED QUESTIONS
          </h2>
        </div>
        <FAQAccordion />
      </section>

      {/* 8. CTA Band Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={clipReveal}
          className="relative p-[1px] bg-gradient-to-r from-primary to-primary-hi clip-card shadow-[0_0_30px_rgba(168,85,247,0.25)]"
        >
          <div className="relative bg-panel px-6 sm:px-12 py-16 clip-card text-center flex flex-col items-center select-none overflow-hidden">
            {/* Subtle Discord Asset Texture with Low Opacity */}
            <div className="absolute inset-0 pointer-events-none opacity-15 mix-blend-screen -z-0">
              <Image
                src="/design_assets/discord_background.jpeg"
                alt="Community background"
                fill
                sizes="(max-width: 1024px) 100vw, 1000px"
                className="object-cover object-center"
              />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <span className="text-[10px] font-display text-primary tracking-widest block uppercase mb-3 flex items-center justify-center gap-0.5">
                <span className="text-primary italic font-bold">/</span>READY?
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-wider text-text-primary max-w-xl leading-snug">
                JOIN RAVONIXX TODAY
              </h2>
              <p className="font-body text-xs text-text-muted mt-4 max-w-md leading-relaxed uppercase">
                /GET DIRECT ACCESS TO CUSTOM MATCHES, COACHING, AND MORE.
              </p>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.02 }}
                className="mt-8 px-8 py-4 font-display text-sm tracking-widest text-white bg-primary hover:bg-primary-hi transition-all duration-200 font-extrabold uppercase hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] rounded-none slanted"
              >
                CONTACT US
              </motion.a>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
