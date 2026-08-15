"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Player } from "@/lib/players";

export function getRoleTheme(role: string) {
  const r = role.toLowerCase();
  if (r.includes("igl")) {
    return {
      border: "#EAB308", // Golden
      borderRgba: "rgba(234, 179, 8, 0.4)",
      borderHover: "#FACC15",
      glow: "rgba(234, 179, 8, 0.5)",
      glowSubtle: "rgba(234, 179, 8, 0.15)",
      text: "#FACC15",
      bgBadge: "rgba(234, 179, 8, 0.18)",
      borderBadge: "rgba(234, 179, 8, 0.6)",
      ring: "focus:ring-yellow-400",
    };
  }
  if (r.includes("sniper")) {
    return {
      border: "#22C55E", // Green
      borderRgba: "rgba(34, 197, 94, 0.4)",
      borderHover: "#4ADE80",
      glow: "rgba(34, 197, 94, 0.5)",
      glowSubtle: "rgba(34, 197, 94, 0.15)",
      text: "#4ADE80",
      bgBadge: "rgba(34, 197, 94, 0.18)",
      borderBadge: "rgba(34, 197, 94, 0.6)",
      ring: "focus:ring-green-400",
    };
  }
  if (r.includes("rusher") || r.includes("fragger") || r.includes("assault")) {
    return {
      border: "#EF4444", // Red
      borderRgba: "rgba(239, 68, 68, 0.4)",
      borderHover: "#F87171",
      glow: "rgba(239, 68, 68, 0.5)",
      glowSubtle: "rgba(239, 68, 68, 0.15)",
      text: "#F87171",
      bgBadge: "rgba(239, 68, 68, 0.18)",
      borderBadge: "rgba(239, 68, 68, 0.6)",
      ring: "focus:ring-red-400",
    };
  }
  if (r.includes("nader") || r.includes("flanker") || r.includes("support")) {
    return {
      border: "#F97316", // Orange
      borderRgba: "rgba(249, 115, 22, 0.4)",
      borderHover: "#FB923C",
      glow: "rgba(249, 115, 22, 0.5)",
      glowSubtle: "rgba(249, 115, 22, 0.15)",
      text: "#FB923C",
      bgBadge: "rgba(249, 115, 22, 0.18)",
      borderBadge: "rgba(249, 115, 22, 0.6)",
      ring: "focus:ring-orange-400",
    };
  }
  return {
    border: "#A855F7", // Default Purple
    borderRgba: "rgba(168, 85, 247, 0.4)",
    borderHover: "#C084FC",
    glow: "rgba(168, 85, 247, 0.5)",
    glowSubtle: "rgba(168, 85, 247, 0.15)",
    text: "#C084FC",
    bgBadge: "rgba(168, 85, 247, 0.18)",
    borderBadge: "rgba(168, 85, 247, 0.6)",
    ring: "focus:ring-purple-400",
  };
}

export function WeaponIcon({ weapon, className = "w-7 h-7" }: { weapon: string; className?: string }) {
  const normalized = weapon.toLowerCase();
  let filename = "";

  if (normalized.includes("ac80")) filename = "ac80.jpeg";
  else if (normalized.includes("awm")) filename = "awm.jpeg";
  else if (normalized.includes("kar98")) filename = "kar98k.jpeg";
  else if (normalized.includes("m1887")) filename = "m1887.jpeg";
  else if (normalized.includes("m590")) filename = "m590.jpeg";
  else if (normalized.includes("m82b")) filename = "m82b.jpeg";
  else if (normalized.includes("mag-7") || normalized.includes("mag7")) filename = "mag-7.jpeg";
  else if (normalized.includes("mp40")) filename = "mp40.jpeg";
  else if (normalized.includes("mp5")) filename = "mp5.jpeg";
  else if (normalized.includes("svd")) filename = "svd.jpeg";
  else if (normalized.includes("trogon")) filename = "trogon.jpeg";
  else if (normalized.includes("vsk94")) filename = "vsk94.jpeg";
  else if (normalized.includes("winchester")) filename = "winchester.jpeg";
  else if (normalized.includes("woodpecker")) filename = "woodpecker.jpeg";

  if (filename) {
    return (
      <div className={`relative flex items-center justify-center flex-shrink-0 select-none pointer-events-none ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/character/${filename}`}
          alt={`${weapon} weapon silhouette`}
          className="max-w-full max-h-full object-contain filter brightness-90 contrast-125"
        />
      </div>
    );
  }

  // Default pistol fallback
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-primary flex-shrink-0">
      <path d="M5 9h9v3h-4l-2 3H5V9z" />
    </svg>
  );
}

interface BattleCardProps {
  player: Player;
  index: number;
  onSelect: () => void;
  isFiltered?: boolean;
}

export default function BattleCard({ player, index, onSelect, isFiltered = false }: BattleCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [charImgError, setCharImgError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const theme = getRoleTheme(player.role);

  // 3D Tilt values using motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Convert offsets to tilt rotation angles (max 8 degrees)
  const rotateX = useTransform(y, [-200, 200], [8, -8]);
  const rotateY = useTransform(x, [-160, 160], [-8, 8]);

  // Spring animation settings to smooth out mouse tracking
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const rx = useSpring(rotateX, springConfig);
  const ry = useSpring(rotateY, springConfig);
  const scale = useSpring(1, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Mouse relative to center of the card
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  const entranceVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: isFiltered ? 0 : i * 0.08,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    }),
  };

  const primaryWeapon = player.loadout.weapons[0] || "AC80";
  const secondaryWeapon = player.loadout.weapons[1] || "MP5";
  const activeSkill = player.loadout.skills[0];

  return (
    <motion.div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={entranceVariants}
      layoutId={`card-${player.id}`}
      style={{
        rotateX: rx,
        rotateY: ry,
        scale,
        borderColor: isHovered ? theme.borderHover : theme.borderRgba,
        boxShadow: isHovered 
          ? `0 0 28px ${theme.glow}, inset 0 0 14px ${theme.glowSubtle}` 
          : `0 0 14px ${theme.glowSubtle}`,
        willChange: "transform",
      }}
      className={`relative w-80 h-[400px] border-2 bg-panel overflow-hidden clip-card cursor-pointer focus:outline-none focus:ring-2 ${theme.ring} select-none transition-all duration-300`}
    >
      {/* Player Render Photo */}
      <div className="absolute inset-0 w-full h-full">
        {/* Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-[2]" />
        
        {/* Render image */}
        {!imgError ? (
          <Image
            src={player.photoUrl}
            alt={`Render portrait of player ${player.ign}`}
            fill
            className="object-cover object-center z-[1] select-none pointer-events-none"
            sizes="(max-width: 768px) 45vw, 320px"
            priority={index < 3}
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-[#161B22] via-[#0C0F12] to-black flex items-center justify-center z-[1]">
            <svg viewBox="0 0 100 100" className="w-24 h-24 text-white/5" fill="currentColor">
              <path d="M50 15 L25 35 L25 65 L50 85 L75 65 L75 35 Z M50 25 L65 40 L50 55 L35 40 Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Pinned Active Character Badge (Top Right) */}
      {activeSkill && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <div 
            style={{ borderColor: theme.borderBadge }}
            className="relative w-10 h-12 border bg-panel/90 backdrop-blur-sm overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.4)] flex items-center justify-center rounded-[2px]"
          >
            {!charImgError ? (
              <Image
                src={activeSkill.iconUrl}
                alt={`${activeSkill.name} character icon`}
                fill
                className="object-contain p-0.5"
                sizes="40px"
                onError={() => setCharImgError(true)}
              />
            ) : (
              <div 
                style={{ color: theme.text }}
                className="w-full h-full bg-[#12161F] flex items-center justify-center font-display font-bold text-xs select-none"
              >
                {activeSkill.name[0]}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Role Pill Badge (Top Left) - Styled with Role Color */}
      <div className="absolute top-2.5 left-2.5 z-10">
        <span 
          style={{ 
            color: theme.text,
            backgroundColor: theme.bgBadge,
            borderColor: theme.borderBadge,
          }}
          className="display-font text-[10px] tracking-wider border px-2.5 py-0.5 rounded-[2px] uppercase font-bold backdrop-blur-md shadow-md"
        >
          {player.role}
        </span>
      </div>

      {/* IGN and Location (Bottom Face Overlay) - Fades out on hover to avoid overlap */}
      <motion.div
        animate={{ 
          opacity: isHovered ? 0 : 1, 
          y: isHovered ? 12 : 0 
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="absolute bottom-4 left-4 right-4 z-10 flex flex-col justify-end"
      >
        <span className="display-font text-2xl font-bold tracking-wider text-text-primary flex items-center gap-0.5">
          <span style={{ color: theme.text }} className="italic font-black">/</span>{player.ign}
        </span>
        <div className="flex items-center justify-between mt-1 text-[10px] font-body text-text-muted">
          <span className="uppercase">{player.location}</span>
          <span style={{ color: theme.text }} className="font-display font-semibold tracking-wider">
            UID: {player.uid}
          </span>
        </div>
      </motion.div>

      {/* Loadout Strip Reveal Panel */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: isHovered ? "0%" : "100%" }}
        transition={{ duration: 0.3, delay: isHovered ? 0.05 : 0, ease: [0.22, 1, 0.36, 1] }}
        style={{ borderTopColor: theme.borderBadge }}
        className="absolute bottom-0 left-0 w-full h-1/3 bg-panel-raised/95 border-t p-4 z-20 flex flex-col justify-between overflow-hidden"
      >
        {/* Subtle Watermark Asset Texture with Low Opacity */}
        <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-screen -z-0">
          <Image
            src="/design_assets/randomdesign4.jpeg"
            alt="Loadout card texture"
            fill
            sizes="320px"
            className="object-cover object-center"
          />
        </div>

        <div className="relative z-10 text-[10px] font-display text-text-muted tracking-wider">
          CURRENT WEAPONS
        </div>
        
        {/* Weapon Silhouettes */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <WeaponIcon weapon={primaryWeapon} />
            <span className="text-[10px] font-body text-text-primary uppercase tracking-wide truncate max-w-[80px]">
              {primaryWeapon}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <WeaponIcon weapon={secondaryWeapon} />
            <span className="text-[10px] font-body text-text-primary uppercase tracking-wide truncate max-w-[80px]">
              {secondaryWeapon}
            </span>
          </div>
        </div>

        {/* Location & Skin indicators */}
        <div className="flex items-center justify-between border-t border-hairline/50 pt-2 text-[10px] font-body">
          <span className="text-text-muted truncate max-w-[120px]">{player.loadout.weaponSkinNote || "No Skin"}</span>
          <span 
            style={{ 
              color: theme.text,
              borderColor: theme.borderBadge,
              backgroundColor: theme.bgBadge,
            }}
            className="font-display font-semibold border px-1.5 py-0.5 rounded-[2px]"
          >
            {player.location.toUpperCase()}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
