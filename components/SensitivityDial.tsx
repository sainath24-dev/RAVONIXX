"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

interface DialProps {
  value: number;
  label: string;
  index: number;
}

function Dial({ value, label, index }: DialProps) {
  const circumference = 2 * Math.PI * 34; // r = 34
  const targetOffset = circumference - (value / 100) * circumference;

  // Springs for smooth transitions matching the motion spec
  const count = useSpring(0, { stiffness: 40, damping: 15 });
  const offset = useSpring(circumference, { stiffness: 40, damping: 15 });

  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    // 0.08s stagger index delay
    const delay = index * 80;
    const timer = setTimeout(() => {
      count.set(value);
      offset.set(targetOffset);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, targetOffset, index, count, offset]);

  // Sync raw spring changes to React display state
  useEffect(() => {
    const unsubscribe = count.on("change", (latest) => {
      setDisplayCount(Math.round(latest));
    });
    return () => unsubscribe();
  }, [count]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 bg-panel border border-hairline flex items-center justify-center clip-card-sm">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
          {/* Background Ring */}
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="var(--border-hairline)"
            strokeWidth="3.5"
          />
          {/* Progress Ring */}
          <motion.circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="var(--accent-info)"
            strokeWidth="3.5"
            strokeLinecap="square"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: offset }}
          />
        </svg>
        {/* Value Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-bold text-lg text-text-primary">{displayCount}</span>
        </div>
      </div>
      <span className="font-display text-[10px] tracking-widest text-text-muted mt-2 text-center max-w-[80px]">
        {label}
      </span>
    </div>
  );
}

interface SensitivityDialProps {
  settings: {
    generalSens: number;
    redDotSens: number;
    scope2xSens: number;
    scope4xSens: number;
    sniperScopeSens: number;
    freeLookSens: number;
  };
}

export default function SensitivityDial({ settings }: SensitivityDialProps) {
  const dialConfigs = [
    { key: "generalSens", label: "GENERAL", value: settings.generalSens },
    { key: "redDotSens", label: "RED DOT", value: settings.redDotSens },
    { key: "scope2xSens", label: "2X SCOPE", value: settings.scope2xSens },
    { key: "scope4xSens", label: "4X SCOPE", value: settings.scope4xSens },
    { key: "sniperScopeSens", label: "SNIPER SCOPE", value: settings.sniperScopeSens },
    { key: "freeLookSens", label: "FREE LOOK", value: settings.freeLookSens },
  ];

  return (
    <div className="grid grid-cols-3 gap-y-6 gap-x-2 md:gap-x-4 max-w-sm mx-auto">
      {dialConfigs.map((config, index) => (
        <Dial
          key={config.key}
          value={config.value}
          label={config.label}
          index={index}
        />
      ))}
    </div>
  );
}
