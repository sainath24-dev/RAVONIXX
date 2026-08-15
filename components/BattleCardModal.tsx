"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Clipboard } from "lucide-react";
import { Player } from "@/lib/players";
import { WeaponIcon, getRoleTheme } from "./BattleCard";

const Youtube = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" />
  </svg>
);

const Instagram = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// Custom premium sensitivity dials
function SensitivityDial({ settings }: { settings: Player["settings"] }) {
  const sensDials = [
    { label: "GENERAL SENS", val: settings.generalSens, color: "var(--accent-primary)" },
    { label: "RED DOT", val: settings.redDotSens, color: "var(--accent-primary)" },
    { label: "2X SCOPE", val: settings.scope2xSens, color: "var(--accent-primary)" },
    { label: "4X SCOPE", val: settings.scope4xSens, color: "var(--accent-primary)" },
    { label: "SNIPER SCOPE", val: settings.sniperScopeSens, color: "var(--accent-live)" },
    { label: "FREE LOOK", val: settings.freeLookSens, color: "var(--accent-live)" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
      {sensDials.map((dial, idx) => {
        // Feed radius values for radial display
        const radius = 24;
        const circumference = 2 * Math.PI * radius;
        const fillPercent = Math.min(dial.val / 200, 1); // Max sensitivity can be 200
        const strokeDashoffset = circumference - fillPercent * circumference;

        return (
          <div key={idx} className="flex flex-col items-center select-none bg-panel border border-hairline p-4 clip-card-sm text-center">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background track circle */}
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                {/* Foreground value indicator */}
                <motion.circle
                  cx="32"
                  cy="32"
                  r={radius}
                  stroke={dial.color}
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </svg>
              {/* Display text dial inside */}
              <span className="absolute font-display font-black text-sm text-text-primary">
                {dial.val}
              </span>
            </div>
            <span className="display-font text-[9px] tracking-wider text-text-muted mt-3 block">
              {dial.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Controls HUD layout diagrams mock
function HudDiagram({ hudLayoutImageUrl, hudPins }: { hudLayoutImageUrl?: string; hudPins?: { x: number; y: number; label: string }[] }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative w-full h-[220px] bg-panel-raised border border-hairline overflow-hidden clip-card-sm">
      {!imgError && hudLayoutImageUrl ? (
        <Image
          src={hudLayoutImageUrl}
          alt="Player HUD layout scheme"
          fill
          className="object-cover opacity-30 select-none pointer-events-none"
          onError={() => setImgError(true)}
          unoptimized
        />
      ) : (
        // Esports blueprint grid pattern
        <div className="absolute inset-0 bg-[#0B0D12] opacity-80 bg-[linear-gradient(to_right,rgba(255,85,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,85,0,0.02)_1px,transparent_1px)] bg-[size:16px_16px] flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-16 h-16 text-white/5" fill="currentColor">
            <path d="M50 15 L25 35 L25 65 L50 85 L75 65 L75 35 Z M50 25 L65 40 L50 55 L35 40 Z" />
          </svg>
        </div>
      )}

      {/* Render overlay blueprint layout grids */}
      {hudPins && hudPins.length > 0 ? (
        hudPins.map((pin, idx) => (
          <div
            key={idx}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-primary/20 border-2 border-primary animate-pulse flex items-center justify-center cursor-pointer">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
            
            {/* Tooltip on layout */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-5 bg-panel-raised border border-hairline px-2 py-1 text-[8px] font-body text-text-primary uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-[2px] whitespace-nowrap pointer-events-none shadow-lg">
              {pin.label}
            </div>
          </div>
        ))
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-center p-6 pointer-events-none">
          <span className="text-[10px] font-display text-text-muted tracking-widest uppercase">
            / HUD BLUEPRINT GRID CALIBRATED
          </span>
        </div>
      )}
    </div>
  );
}

// Fallback image asset loaders
function ImageFallback({
  src,
  alt,
  className,
  sizes,
  fallbackType,
  fallbackChar,
}: {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  fallbackType: "portrait" | "character" | "weapon";
  fallbackChar?: string;
}) {
  const [error, setError] = useState(false);

  if (error || !src) {
    if (fallbackType === "portrait") {
      return (
        <div className="absolute inset-0 bg-gradient-to-tr from-[#161B22] via-[#0C0F12] to-[#FF5500]/10 flex items-center justify-center z-[1]">
          <svg viewBox="0 0 100 100" className="w-24 h-24 text-white/5" fill="currentColor">
            <path d="M50 15 L25 35 L25 65 L50 85 L75 65 L75 35 Z M50 25 L65 40 L50 55 L35 40 Z" />
          </svg>
        </div>
      );
    }
    if (fallbackType === "character") {
      return (
        <div className="absolute inset-0 bg-[#12161F] flex items-center justify-center text-primary font-display font-bold text-lg select-none">
          {fallbackChar || "?"}
        </div>
      );
    }
    return (
      <div className="absolute inset-0 bg-[#12161F] flex items-center justify-center text-text-muted font-display text-xs select-none">
        WPN
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

interface BattleCardModalProps {
  player: Player;
  onClose: () => void;
}

export default function BattleCardModal({ player, onClose }: BattleCardModalProps) {
  const theme = getRoleTheme(player.role);
  const [animationDone, setAnimationDone] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    const originalOverflow = document.body.style.overflow;
    
    // Lock body scroll only on desktop viewports
    if (window.innerWidth >= 768) {
      document.body.style.overflow = "hidden";
    }

    if (modalRef.current) {
      modalRef.current.focus();
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, []);

  const handleTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    if (!modalRef.current) return;
    
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  const handleCopyCode = async () => {
    if (player.settings.hudCode && player.settings.hudCode !== "N/A") {
      try {
        await navigator.clipboard.writeText(player.settings.hudCode);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };

  const dossierItemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: i * 0.08,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-player-ign"
      className="fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-start md:items-center"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0A0A0C]/85 backdrop-blur-[6px] z-0"
      />

      {/* Modal Dialog Box */}
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        onKeyDown={handleTabKey}
        layoutId={`card-${player.id}`}
        onLayoutAnimationComplete={() => setAnimationDone(true)}
        style={{
          borderColor: theme.borderBadge,
          boxShadow: `0 0 35px ${theme.glow}, 0 24px 50px rgba(0,0,0,0.8)`,
        }}
        className="relative w-full max-w-5xl bg-panel border-2 clip-card z-10 flex flex-col md:flex-row focus:outline-none md:h-[82vh] md:max-h-[82vh] md:overflow-hidden my-auto"
      >
        {/* Left Column: Player Render Banner (2 distinct vertical sections) */}
        <div className="relative w-full md:w-[350px] flex-shrink-0 border-b md:border-b-0 md:border-r border-hairline flex flex-col bg-panel bg-gradient-to-b from-void/40 to-void md:h-full md:overflow-hidden">
          
          {/* Section 1: Big Image Portrait */}
          <div className="relative w-full aspect-[4/5] md:h-[400px] overflow-hidden flex-shrink-0 bg-[#07090D]">
            <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent z-[2]" />
            <ImageFallback
              src={player.photoUrl}
              alt={`Larger render portrait of ${player.ign}`}
              className="object-cover object-center z-[1] pointer-events-none select-none"
              sizes="(max-width: 768px) 100vw, 350px"
              fallbackType="portrait"
            />

            {/* Social Row - Top Left Overlay */}
            <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
              {player.socials.youtube && (
                <a
                  href={player.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-hairline bg-panel/75 hover:border-info text-text-muted hover:text-info transition-colors rounded-[2px]"
                  aria-label="YouTube channel"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {player.socials.instagram && (
                <a
                  href={player.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-hairline bg-panel/75 hover:border-info text-text-muted hover:text-info transition-colors rounded-[2px]"
                  aria-label="Instagram profile"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {player.socials.discord && (
                <span
                  className="p-2 border border-hairline bg-panel/75 text-text-muted rounded-[2px] text-xs flex items-center gap-1.5 font-body"
                  title={`Discord username: ${player.socials.discord}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{player.socials.discord}</span>
                </span>
              )}
            </div>
          </div>

          {/* Section 2: Text details panel below image (Navbar style name & UID) */}
          <div className="p-6 flex flex-col gap-3 bg-void/50 border-t border-hairline flex-grow justify-center min-h-[180px]">
            <span 
              style={{
                color: theme.text,
                backgroundColor: theme.bgBadge,
                borderColor: theme.borderBadge,
              }}
              className="display-font text-[10px] tracking-wider border px-2.5 py-0.5 rounded-[2px] w-fit uppercase font-bold"
            >
              {player.role}
            </span>
            {/* Slanted ultra bold player name with custom spring scaling hover anim */}
            <div className="overflow-visible py-1">
              <motion.h2
                id="modal-player-ign"
                whileHover={{ 
                  scale: 1.08, 
                  skewX: -12,
                }}
                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                className="font-display font-black italic tracking-wider uppercase text-5xl md:text-6xl text-text-primary slanted leading-none flex items-center gap-0.5 cursor-default select-none origin-left"
              >
                <span style={{ color: theme.text }} className="font-bold">/</span>{player.ign}
              </motion.h2>
            </div>
            {/* Slanted location/UID strip */}
            <div className="flex flex-col gap-1 mt-1 text-xs font-body text-text-muted border-t border-hairline/20 pt-3">
              <span className="font-display font-black tracking-widest text-[#00F0FF] uppercase">
                UID: {player.uid}
              </span>
              <span>{player.realName || "Active Operator"}</span>
              <span style={{ color: theme.text }} className="font-display font-semibold tracking-wider block mt-0.5 uppercase">
                {player.location}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Player Scroll Area */}
        <div className="flex-grow p-6 md:p-8 md:overflow-y-auto md:max-h-[82vh] bg-panel-raised/30 flex flex-col gap-8">
          
          {/* Header/Close button */}
          <div className="flex justify-between items-center border-b border-hairline pb-4 flex-shrink-0">
            <span className="display-font text-xs tracking-widest text-text-muted">
              PLAYER DETAILS
            </span>
            <button
              onClick={onClose}
              className="p-1 border border-hairline hover:border-primary text-text-muted hover:text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary rounded-[2px]"
              aria-label="Close dossier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sequential Staggered Content Container */}
          <AnimatePresence>
            {animationDone && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="flex flex-col gap-8"
              >
                {/* 1. Upper Section: 4 Character combo list */}
                <motion.section custom={0} variants={dossierItemVariants}>
                  <h3 className="display-font text-xs tracking-widest text-text-muted mb-3">
                    CHARACTER & SKILLS
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {player.loadout.skills.map((skill, idx) => (
                      <div key={idx} className="flex flex-col bg-panel border border-hairline overflow-hidden rounded-[2px] shadow-md group">
                        <div className="relative w-full aspect-[4/5] bg-panel-raised/50 overflow-hidden flex items-center justify-center">
                          <ImageFallback
                            src={skill.iconUrl}
                            alt={skill.name}
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            fallbackType="character"
                            fallbackChar={skill.name[0]}
                          />
                        </div>
                        <div className="p-3 text-center flex flex-col gap-0.5 border-t border-hairline select-none bg-void/30">
                          <div className="display-font text-xs text-text-primary uppercase font-bold tracking-wider truncate w-full">
                            {skill.name}
                          </div>
                          <span className={`text-[9px] font-display font-semibold tracking-wider ${
                            skill.type === "ACTIVE" ? "text-primary" : "text-text-muted"
                          }`}>
                            {skill.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* 2. Middle Section: Weapons loadout (handles multi-weapons) */}
                <motion.section custom={1} variants={dossierItemVariants} className="border-t border-hairline pt-6">
                  <h3 className="display-font text-xs tracking-widest text-text-muted mb-3">
                    WEAPONS
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {player.loadout.weapons.map((weapon, idx) => (
                      <div key={idx} className="bg-panel border border-hairline overflow-hidden rounded-[2px] shadow-sm flex flex-col group">
                        <div className="relative w-full h-24 bg-panel-raised border-b border-hairline flex items-center justify-center p-3 overflow-hidden select-none pointer-events-none">
                          <WeaponIcon weapon={weapon} className="w-full h-full" />
                        </div>
                        <div className="p-3 bg-void/25 select-none">
                          <span className="text-[8px] font-display text-text-muted tracking-widest block uppercase">
                            {idx === 0 ? "PRIMARY WEAPON" : idx === 1 ? "SECONDARY WEAPON" : `WEAPON ${idx + 1}`}
                          </span>
                          <span className="text-xs font-body font-black text-text-primary uppercase tracking-wide block mt-0.5">
                            {weapon}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Skin & Pet Notes */}
                  <div className="flex flex-col gap-1.5 mt-3 pl-2 border-l border-hairline text-xs font-body text-text-muted">
                    {player.loadout.weaponSkinNote && (
                      <div>
                        <span className="text-text-dim display-font text-[9px] tracking-wider mr-2">WEAPON SKIN:</span>
                        {player.loadout.weaponSkinNote}
                      </div>
                    )}
                    {player.loadout.pet && (
                      <div>
                        <span className="text-text-dim display-font text-[9px] tracking-wider mr-2">EQUIPPED PET:</span>
                        {player.loadout.pet}
                      </div>
                    )}
                  </div>
                </motion.section>

                {/* 3. Lower Section: Sensitivity settings & Hardware Spec */}
                <motion.section custom={2} variants={dossierItemVariants} className="border-t border-hairline pt-6">
                  <h3 className="display-font text-xs tracking-widest text-text-muted mb-4">
                    SENSITIVITIES
                  </h3>
                  <SensitivityDial settings={player.settings} />
                  {player.settings.dpi && (
                    <div className="text-center mt-3 text-xs font-body text-text-muted">
                      <span className="text-text-dim display-font text-[9px] tracking-wider mr-2">DEVICE RESOLUTION:</span>
                      {player.settings.dpi} DPI
                    </div>
                  )}
                </motion.section>

                {/* 4. Controls HUD Setup: Custom heading styled like navbar links */}
                <motion.section custom={3} variants={dossierItemVariants} className="border-t border-hairline pt-6">
                  {/* Navbar Style Slanted Header */}
                  <h3 className="display-font font-black italic tracking-wide text-text-primary text-base md:text-lg uppercase slanted flex items-center mb-4">
                    <span className="text-primary font-bold mr-1">/</span>HUD CODE
                  </h3>
                  <HudDiagram hudLayoutImageUrl={player.hudLayoutImageUrl} />
                  
                  <div className="flex justify-center gap-6 mt-3 text-xs font-body text-text-muted border-b border-hairline/30 pb-4">
                    <div>
                      <span className="text-text-dim display-font text-[9px] tracking-wider mr-2">PRESET:</span>
                      {player.settings.controlLayout.toUpperCase()}
                    </div>
                    <div>
                      <span className="text-text-dim display-font text-[9px] tracking-wider mr-2">GYROSCOPE:</span>
                      {player.settings.gyroscope ? "ENABLED" : "DISABLED"}
                    </div>
                  </div>

                  {/* Interactive HUD Code Display */}
                  {player.settings.hudCode && player.settings.hudCode !== "N/A" && (
                    <div className="mt-4 flex flex-col items-center bg-panel border border-hairline p-4 clip-card-sm max-w-sm mx-auto shadow-inner relative group">
                      <span className="text-[9px] font-display text-text-muted tracking-widest block mb-2 font-black">HUD CODE</span>
                      <div className="flex items-center gap-2 w-full">
                        <code className="text-[10.5px] font-mono text-text-primary bg-panel-raised border border-hairline py-2 px-3 rounded-[2px] flex-grow select-all break-all overflow-hidden text-ellipsis whitespace-nowrap">
                          {player.settings.hudCode}
                        </code>
                        <button
                          onClick={handleCopyCode}
                          className="px-4 h-[34px] bg-primary text-black font-display font-black text-[10px] tracking-wider uppercase slanted rounded-none hover:bg-primary-hi transition-colors flex items-center gap-1 flex-shrink-0"
                        >
                          <Clipboard className="w-3 h-3" />
                          {copySuccess ? "COPIED" : "COPY"}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.section>

                {/* 5. Device & Achievements */}
                <motion.section custom={4} variants={dossierItemVariants} className="border-t border-hairline pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Achievements */}
                  <div>
                    <h3 className="display-font text-xs tracking-widest text-text-muted mb-3">
                      ACHIEVEMENTS
                    </h3>
                    <ul className="space-y-2">
                      {player.achievements.map((achievement, idx) => (
                        <li key={idx} className="text-xs font-body text-text-primary flex items-start gap-2 leading-relaxed">
                          <span className="text-primary text-[10px] select-none mt-0.5">{"//"}</span>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Device Spec */}
                  {player.device && (
                    <div>
                      <h3 className="display-font text-xs tracking-widest text-text-muted mb-3">
                        DEVICE
                      </h3>
                      <div className="bg-panel border border-hairline p-3 clip-card-sm">
                        <span className="text-[9px] font-display text-text-dim tracking-wider block">MOBILE DEVICE</span>
                        <span className="text-xs font-body text-text-primary uppercase font-bold block mt-1">
                          {player.device}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
