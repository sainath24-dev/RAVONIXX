"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

import { Crosshair, BookOpen, Users, ShoppingBag, Trophy, Sparkles } from "lucide-react";

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
      icon: <Crosshair className="w-8 h-8 text-primary" />,
    },
    {
      title: "Proper Coaching",
      description: "Access 1-on-1 gameplay sessions, VOD review libraries, and personalized strategies from pro coaches.",
      linkText: "APPLY FOR COACHING",
      linkPath: "/contact",
      icon: <BookOpen className="w-8 h-8 text-primary" />,
    },
    {
      title: "Proper Team Alignment",
      description: "Align with our active roster of top-tier professional esports players and climb the ranking tables.",
      linkText: "MEET OUR ROSTER",
      linkPath: "/team",
      icon: <Users className="w-8 h-8 text-primary" />,
    },
    {
      title: "Jersey & Merch Drops",
      description: "Get direct access to custom team apparel, limited-edition jersey drops, and exclusive club gear.",
      linkText: "BROWSE SHOP",
      linkPath: "/contact",
      icon: <ShoppingBag className="w-8 h-8 text-primary" />,
    },
    {
      title: "Invited Roster Slots",
      description: "Secure exclusive direct invitations to major community tournaments and verified custom league lobbies.",
      linkText: "CLAIM A SLOT",
      linkPath: "/contact",
      icon: <Trophy className="w-8 h-8 text-primary" />,
    },
    {
      title: "And Many More Things",
      description: "Unlock custom game presets, direct scrimmage codes, visual design overlays, and community events.",
      linkText: "EXPLORE BENEFITS",
      linkPath: "/about",
      icon: <Sparkles className="w-8 h-8 text-primary" />,
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
          viewport={{ once: true, margin: "150px" }}
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
