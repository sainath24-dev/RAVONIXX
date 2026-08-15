"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden bg-void select-none pt-28 pb-20">

      {/* Background Texture Asset with Low Opacity */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30 mix-blend-luminosity">
        <Image
          src="/images/players/hero section_background .jpeg"
          alt="Hero backdrop"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Purple Gradient & Dark Radial Vignette Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(168, 85, 247, 0.18) 0%, rgba(8, 9, 12, 0.94) 75%)"
        }}
      />

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 relative z-10 w-full flex flex-col items-center text-center">

        {/* Official Free Fire Affiliation Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-6"
        >
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-black/75 border border-primary/50 backdrop-blur-md rounded-[2px] shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <div className="relative w-5 h-5 flex-shrink-0">
              <Image
                src="/images/ff logo/FF_SHORT_LOGO.PNG.png"
                alt="Free Fire"
                fill
                sizes="20px"
                className="object-contain"
                priority
              />
            </div>
            <span className="font-display font-black text-[11px] tracking-widest text-white uppercase">
              FREE FIRE ESPORTS DIVISION
            </span>
          </div>

          <div className="relative h-7 w-28 opacity-90">
            <Image
              src="/images/ff logo/BATTLE_IN_STYLE_SLOGAN.PNG.png"
              alt="Battle In Style"
              fill
              sizes="112px"
              className="object-contain"
            />
          </div>
        </motion.div>

        {/* Outline background typography watermark */}
        <div className="absolute top-[40px] select-none text-outline font-display font-black text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] tracking-tighter opacity-10 -z-10 slanted pointer-events-none">
          RAVONIXX
        </div>

        {/* Main Title Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-black uppercase italic tracking-tight text-white leading-[0.88] text-[clamp(3.8rem,9.5vw,7.5rem)] slanted"
        >
          <span className="text-primary font-black">/</span>RAVONIXX
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="font-body text-text-muted text-sm sm:text-base md:text-lg mt-5 leading-relaxed max-w-2xl uppercase tracking-wider"
        >
          /THE NEXT LEVEL OF COMPETITIVE PLAY. JOIN AN ELITE SQUAD OF ESPORTS CHAMPIONS AND MASTER YOUR PLAYBOOK.
        </motion.p>

        {/* Action Buttons & Title Logo */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-wrap items-center justify-center gap-5"
        >
          <Link
            href="/team"
            className="px-8 py-4 font-display text-sm tracking-widest text-white bg-primary hover:bg-primary-hi transition-all duration-200 font-black uppercase shadow-[0_0_25px_rgba(168,85,247,0.45)] hover:shadow-[0_0_35px_rgba(168,85,247,0.7)] slanted rounded-none"
          >
            EXPLORE ROSTER
          </Link>

          <Link
            href="/strategy"
            className="px-8 py-4 font-display text-sm tracking-widest text-text-primary border border-hairline hover:border-primary transition-all duration-200 font-bold uppercase bg-panel/60 hover:bg-panel-raised slanted rounded-none"
          >
            TACTICAL BOARD
          </Link>

          {/* Official Free Fire MAX Title Logo */}
          <div className="relative w-36 h-10 ml-2 opacity-90 hover:opacity-100 transition-opacity">
            <Image
              src="/images/ff logo/FREE_FIRE_MAX_LOGO.PNG.png"
              alt="Free Fire MAX"
              fill
              sizes="144px"
              className="object-contain"
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
