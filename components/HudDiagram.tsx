"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface HudPin {
  x: number;
  y: number;
  label: string;
}

interface HudDiagramProps {
  hudLayoutImageUrl?: string;
  hudPins?: HudPin[];
}

export default function HudDiagram({ hudLayoutImageUrl, hudPins = [] }: HudDiagramProps) {
  const [hoveredPinIndex, setHoveredPinIndex] = useState<number | null>(null);

  // Default fallback SVG wireframe
  const FallbackDiagram = () => (
    <div className="relative w-full h-[160px] bg-panel-raised border border-hairline p-2 clip-card flex items-center justify-center overflow-hidden">
      {/* Background Texture Asset with Low Opacity */}
      <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-screen -z-0">
        <Image
          src="/design_assets/randomdesign4.jpeg"
          alt="HUD texture"
          fill
          sizes="300px"
          className="object-cover object-center"
        />
      </div>

      <svg viewBox="0 0 400 185" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto opacity-70 relative z-10">
        {/* Phone chassis */}
        <rect x="2" y="2" width="396" height="181" rx="8" stroke="var(--border-hairline)" strokeWidth="2" />
        <rect x="8" y="8" width="384" height="169" rx="4" stroke="var(--border-hairline)" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Left Side Controls (Movement/Gloo/Fire) */}
        <circle cx="50" cy="45" r="18" stroke="var(--text-dim)" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="50" cy="45" r="12" stroke="var(--text-dim)" strokeWidth="1.5" />
        <circle cx="65" cy="130" r="26" stroke="var(--text-dim)" strokeWidth="1.5" />
        <circle cx="65" cy="130" r="8" fill="var(--text-dim)" />
        
        {/* Center Crosshair & Weapons */}
        <circle cx="200" cy="92" r="4" stroke="var(--accent-primary)" strokeWidth="1.5" />
        <line x1="190" y1="92" x2="195" y2="92" stroke="var(--accent-primary)" strokeWidth="1.5" />
        <line x1="205" y1="92" x2="210" y2="92" stroke="var(--accent-primary)" strokeWidth="1.5" />
        <line x1="200" y1="82" x2="200" y2="87" stroke="var(--accent-primary)" strokeWidth="1.5" />
        <line x1="200" y1="97" x2="200" y2="102" stroke="var(--accent-primary)" strokeWidth="1.5" />
        <rect x="140" y="10" width="120" height="24" rx="2" stroke="var(--text-dim)" strokeWidth="1.5" />
        <line x1="200" y1="10" x2="200" y2="34" stroke="var(--text-dim)" strokeWidth="1.5" />

        {/* Right Side Controls (Aming/Firing/Jump/Crouch) */}
        <circle cx="340" cy="120" r="22" stroke="var(--text-dim)" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="340" cy="120" r="15" stroke="var(--text-dim)" strokeWidth="1.5" />
        <circle cx="290" cy="140" r="12" stroke="var(--text-dim)" strokeWidth="1.5" />
        <circle cx="345" cy="55" r="14" stroke="var(--text-dim)" strokeWidth="1.5" />
        <circle cx="300" cy="45" r="14" stroke="var(--text-dim)" strokeWidth="1.5" />
      </svg>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[280px] select-none">
        {/* HUD Image / Fallback Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="relative w-full overflow-hidden"
        >
          {hudLayoutImageUrl ? (
            <div className="relative w-full border border-hairline bg-panel-raised p-1 clip-card flex items-center justify-center">
              <Image
                src={hudLayoutImageUrl}
                alt="Claw controls HUD layout"
                width={280}
                height={130}
                className="w-full h-auto object-cover clip-card"
                sizes="280px"
                priority
              />
            </div>
          ) : (
            <FallbackDiagram />
          )}
        </motion.div>

        {/* Interactive Layout Pins */}
        {hudPins.map((pin, index) => {
          const isHovered = hoveredPinIndex === index;
          return (
            <div
              key={index}
              className="absolute z-10"
              style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%, -50%)" }}
            >
              {/* Pin marker */}
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.3 }}
                transition={{
                  scale: {
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    delay: 0.2 + index * 0.05, // Wait for image fade + stagger
                  },
                }}
                onMouseEnter={() => setHoveredPinIndex(index)}
                onMouseLeave={() => setHoveredPinIndex(null)}
                className="w-3.5 h-3.5 rounded-full bg-primary border-2 border-white shadow-lg flex items-center justify-center focus:outline-none cursor-crosshair"
                aria-label={`Pin details: ${pin.label}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </motion.button>

              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 w-44 bg-void border border-hairline px-3 py-2 text-[10px] font-body text-text-primary tracking-wide text-center clip-card-sm shadow-xl z-20 pointer-events-none"
                  >
                    {pin.label}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <span className="text-[10px] font-display text-text-muted mt-2 tracking-widest text-center">
        {hudLayoutImageUrl ? "CUSTOM CLAW HUD LAYOUT" : "4-FINGER CLAW — STANDARD HUD LAYOUT"}
      </span>
    </div>
  );
}
