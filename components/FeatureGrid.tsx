"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

interface FeatureItem {
  title: string;
  description: string;
  linkText: string;
  linkPath: string;
  icon: React.ReactNode;
}

export default function FeatureGrid() {
  const features: FeatureItem[] = [
    {
      title: "League & Paid Scrims",
      description: "Compete in custom rooms, register for high-stakes paid scrims, and test your team against elite squads.",
      linkText: "JOIN SCRIMS",
      linkPath: "/contact",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-primary">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="1" x2="12" y2="23" />
          <line x1="1" y1="12" x2="23" y2="12" />
        </svg>
      ),
    },
    {
      title: "Proper Coaching",
      description: "Access 1-on-1 gameplay sessions, VOD review libraries, and personalized strategies from pro coaches.",
      linkText: "APPLY FOR COACHING",
      linkPath: "/contact",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-primary">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <line x1="9" y1="9" x2="15" y2="9" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
      ),
    },
    {
      title: "Proper Team Alignment",
      description: "Align with our active roster of top-tier professional esports operators and climb the ranking tables.",
      linkText: "MEET OUR ROSTER",
      linkPath: "/team",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-primary">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      ),
    },
    {
      title: "Jersey & Merch Drops",
      description: "Get direct access to custom team apparel, limited-edition jersey drops, and exclusive club gear.",
      linkText: "BROWSE SHOP",
      linkPath: "/contact",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-primary">
          <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.62 2v6.23a2 2 0 001 1.73L6 15v7h12v-7l3-1.58a2 2 0 001-1.73V5.46a2 2 0 00-1.62-2z" />
        </svg>
      ),
    },
    {
      title: "Invited Roster Slots",
      description: "Secure exclusive direct invitations to major community tournaments and verified custom league lobbies.",
      linkText: "CLAIM A SLOT",
      linkPath: "/contact",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-primary">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M6 5v14M18 5v14" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      ),
    },
    {
      title: "And Many More Things",
      description: "Unlock custom game presets, direct scrimmage codes, visual design overlays, and community events.",
      linkText: "EXPLORE BENEFITS",
      linkPath: "/about",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-primary">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 select-none">
      {features.map((feature, idx) => (
        <motion.div
          key={feature.title}
          custom={idx}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          whileHover={{ y: -6, scale: 1.02 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative border border-hairline bg-panel p-8 flex flex-col justify-start clip-card h-88 cursor-pointer transition-colors duration-200 hover:bg-panel-raised group overflow-hidden"
        >
          {/* Subtle Background Texture Asset with Low Opacity */}
          <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-screen -z-0">
            <Image
              src="/design_assets/randomstyle1.jpeg"
              alt="Feature texture"
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover object-center"
            />
          </div>

          {/* Custom SVG Icon wrapped in Frosted Glass Container */}
          <div className="relative z-10 mb-6 flex-shrink-0 w-16 h-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
            {feature.icon}
          </div>

          {/* Heading */}
          <h3 className="display-font text-xl font-black italic tracking-wide text-text-primary mb-3 uppercase slanted">
            {feature.title}
          </h3>

          {/* Copy Description */}
          <p className="font-body text-sm text-text-muted leading-relaxed">
            {feature.description}
          </p>

          {/* Micro-interactive Arrow Link */}
          <a
            href={feature.linkPath}
            className="group/link mt-auto inline-flex items-center gap-2 text-xs font-display tracking-widest text-primary hover:text-primary-hi transition-colors"
          >
            {feature.linkText}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-3.5 h-3.5 transform group-hover/link:translate-x-1 transition-transform duration-150 ease-out"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </motion.div>
      ))}
    </div>
  );
}
