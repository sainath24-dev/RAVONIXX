"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { clipReveal, fadeUp } from "@/lib/motion";
import GamesWePlay from "@/components/GamesWePlay";

interface ManagementMember {
  name: string;
  role: string;
  photoUrl: string;
  handle: string;
  coordinates: string;
  objectives: string[];
}

function ImageFallback({
  src,
  alt,
  className,
  sizes,
  fallbackChar
}: {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  fallbackChar?: string;
}) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="absolute inset-0 bg-gradient-to-tr from-[#161B22] via-[#0C0F12] to-[#A855F7]/10 flex items-center justify-center z-[1] border-b border-hairline">
        <svg viewBox="0 0 100 100" className="w-20 h-20 text-white/5" fill="currentColor">
          <path d="M50 15 L25 35 L25 65 L50 85 L75 65 L75 35 Z M50 25 L65 40 L50 55 L35 40 Z" />
        </svg>
        {fallbackChar && (
          <span className="absolute font-display font-black text-2xl text-white/10">{fallbackChar}</span>
        )}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      onError={() => setError(true)}
      unoptimized
    />
  );
}

// 3D Tilt Flip Management card
function ManagementCard({ member, index }: { member: ManagementMember; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-150, 150], [10, -10]);
  const rotateY = useTransform(x, [-120, 120], [-10, 10]);

  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const rx = useSpring(rotateX, springConfig);
  const ry = useSpring(rotateY, springConfig);
  const scale = useSpring(1, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    scale.set(1.02);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    scale.set(1);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      style={{
        rotateX: rx,
        rotateY: ry,
        scale,
        boxShadow: isHovered ? "0 0 25px rgba(168, 85, 247, 0.3)" : "0 0 12px rgba(255, 255, 255, 0.02)",
        willChange: "transform",
      }}
      className="relative w-80 h-[400px] border-2 border-white/10 bg-panel overflow-hidden clip-card select-none transition-shadow duration-200"
    >
      {/* Headshot Portrait */}
      <div className="absolute inset-0 w-full h-full bg-[#07090D]">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-[2]" />
        <ImageFallback
          src={member.photoUrl}
          alt={`Portrait of ${member.name}`}
          className="object-cover object-center z-[1] select-none pointer-events-none"
          sizes="320px"
          fallbackChar={member.name[0]}
        />
      </div>

      {/* Default Overlay Header (Role Pill, Top Left) */}
      <div className="absolute top-2.5 left-2.5 z-10">
        <span className="display-font text-[10px] tracking-wider text-text-primary bg-panel-raised border border-hairline px-2 py-0.5 rounded-[2px] uppercase">
          OPERATIONS
        </span>
      </div>

      {/* Bottom Face Nameplate - Fades out on hover to avoid overlap */}
      <motion.div
        animate={{
          opacity: isHovered ? 0 : 1,
          y: isHovered ? 12 : 0
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="absolute bottom-4 left-4 right-4 z-10 flex flex-col justify-end"
      >
        <span className="display-font text-2xl font-bold tracking-wider text-text-primary flex items-center gap-0.5">
          <span className="text-primary italic font-bold">/</span>{member.name.split(" ")[0]}
        </span>
        <div className="flex flex-col mt-1 text-[10px] font-body text-text-muted">
          <span>{member.role}</span>
          <span className="font-display font-semibold tracking-wider block mt-0.5 text-[#00F0FF]">
            {member.handle}
          </span>
        </div>
      </motion.div>

      {/* Back Info Flip Panel (Reveals smoothly on hover) */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: isHovered ? "0%" : "100%" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 bg-[#0C0F12]/95 border-t-2 border-primary p-6 z-20 flex flex-col justify-between"
      >
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start border-b border-hairline pb-3">
            <div>
              <span className="font-display font-bold text-lg text-text-primary uppercase tracking-wide">
                {member.name}
              </span>
              <span className="font-mono text-[10px] text-[#00F0FF] block mt-0.5">
                {member.coordinates}
              </span>
            </div>
            <span className="text-[10px] font-mono border border-primary/50 px-1.5 py-0.5 rounded-[2px] text-primary">
              VERIFIED
            </span>
          </div>

          <div>
            <span className="display-font text-[10px] tracking-widest text-text-muted uppercase block mb-2 font-bold">
              FOCUS OBJECTIVES
            </span>
            <ul className="space-y-1.5">
              {member.objectives.map((obj, idx) => (
                <li key={idx} className="text-xs font-body text-text-primary flex items-center gap-2">
                  <span className="text-primary font-bold">{"//"}</span>
                  <span className="truncate">{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card bottom details */}
        <div className="flex items-center justify-between border-t border-hairline/50 pt-2 text-[10px] font-body mt-auto">
          <span className="text-text-muted font-display font-bold uppercase truncate max-w-[150px]">{member.role}</span>
          <span className="font-display font-semibold border border-primary/40 px-1.5 py-0.5 rounded-[2px] text-primary">
            HQ
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AboutPage() {
  const managementTeam: ManagementMember[] = [
    {
      name: "Mayur",
      role: "Managing Director ",
      photoUrl: "/images/players/owner1.jpg",
      handle: "@prabuddh_mayur",
      coordinates: "INDIA",
      objectives: [
        "Free Fire MAX India Community — SCOUT, Community Leader & TO",
        "The Esports Club (TEC) — Student Ambassador",
        "Tournament Director — TZ Esports, Nx9 Esports, Rage Genesis",
        "Founder & Owner — Ravonixx & DU Esports"
      ]
    },
    {
      name: "Khan",
      role: "Owner & Founder",
      photoUrl: "/images/players/owner2.jpeg",
      handle: "@khann.rtx",
      coordinates: "INDIA",
      objectives: [
        "Manages Organization, Creators & Pro Players",
        "Strategic Partnerships & Collaborations",
        "Social Media & Broadcasting Management",
        "Brand Operations & Media Presence"
      ]
    },
    {
      name: "Sainath",
      role: "Coach & Analyst",
      photoUrl: "/images/players/owner3.jpeg",
      handle: "@sai_here1105",
      coordinates: "BANGALORE, IN",
      objectives: [
        "Team Management & Player Development",
        "Match Operations & Tournament Schedules",
        "Team Work Coordination & Synergy",
        "VOD Reviews & Tactical Analysis"
      ]
    },
  ];

  return (
    <div className="flex flex-col w-full pb-24 overflow-x-hidden">
      {/* 1. Org Story Block */}
      <section className="relative w-full py-20 bg-void border-b border-hairline select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={clipReveal}
            className="border border-hairline bg-panel p-8 md:p-16 clip-card max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden"
          >
            {/* Background Texture Asset with Low Opacity */}
            <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-screen -z-0">
              <Image
                src="/design_assets/randomdesign5.jpeg"
                alt="Story backdrop"
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover object-center"
              />
            </div>

            {/* Emblem Image */}
            <div className="relative w-28 h-28 md:w-36 md:h-36 flex-shrink-0 drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">
              <Image
                src="/images/logo/ravonixx_white.png"
                alt="RAVONIXX Official Emblem"
                fill
                priority
                sizes="144px"
                className="object-contain"
              />
            </div>

            {/* Text details */}
            <div className="flex flex-col relative z-10">
              <h1 className="display-font font-black italic tracking-wide text-3xl sm:text-5xl text-text-primary uppercase slanted leading-none flex items-center mb-4">
                <span className="text-primary font-bold mr-1">/</span>FOUNDATIONS
              </h1>
              <p className="font-body text-xs sm:text-sm text-text-muted leading-relaxed max-w-xl">
                RAVONIXX was established to bridge the gap between casual configurations and tournament-level execution. We believe that competitive Free Fire is a game of millimeters and milliseconds, where player setups are as crucial as reflexes. Our operations are centered around tactical coaching, hardware specs standardization, and strict claw layouts, preparing squad members for international victory.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Management Team Grid (Operational BattleCards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-b border-hairline w-full">
        <div className="text-center mb-16 select-none flex flex-col items-center">
          {/* Slanted header */}
          <h2 className="display-font font-black italic tracking-wide text-2xl sm:text-4xl text-text-primary uppercase slanted flex items-center gap-1">
            <span className="text-primary font-bold">/</span>COMMAND DIRECTORS
          </h2>
        </div>

        {/* Leadership cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center max-w-5xl mx-auto">
          {managementTeam.map((member, idx) => (
            <ManagementCard key={member.name} member={member} index={idx} />
          ))}
        </div>
      </section>

      {/* 3. Games We Play Section */}
      <section className="bg-panel/30 py-24 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
          <div className="text-center select-none flex flex-col items-center">
            {/* Slanted header */}
            <h2 className="display-font font-black italic tracking-wide text-2xl sm:text-4xl text-text-primary uppercase slanted flex items-center gap-1">
              <span className="text-primary font-bold">/</span>GAMES WE PLAY
            </h2>
            <p className="font-body text-xs sm:text-sm text-text-muted mt-2 uppercase tracking-wider">
              Explore the competitive titles and community games our organization plays.
            </p>
          </div>
          <GamesWePlay />
        </div>
      </section>
    </div>
  );
}
