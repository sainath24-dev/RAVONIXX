"use client";

import React from "react";

interface Props {
  className?: string;
  size?: number;
}

export default function FreeFireTrophyBadge({ className = "w-28 h-28", size = 112 }: Props) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Background radial violet glow */}
      <div className="absolute inset-0 bg-purple-600/30 rounded-full blur-xl pointer-events-none" />

      {/* Authentic Free Fire Tournament Trophy SVG Vector matching in-game reference */}
      <svg
        viewBox="0 0 160 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_10px_20px_rgba(147,51,234,0.45)] relative z-10"
      >
        <defs>
          {/* Shield Metallic Purple Gradient */}
          <linearGradient id="ffTrophyShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="35%" stopColor="#9333EA" />
            <stop offset="70%" stopColor="#6B21A8" />
            <stop offset="100%" stopColor="#3B0764" />
          </linearGradient>

          {/* Core Lock Chamber Gradient */}
          <linearGradient id="ffTrophyCoreGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7E22CE" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          {/* Platinum / Chrome Pedestal Gradient */}
          <linearGradient id="ffTrophyPedestalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="25%" stopColor="#94A3B8" />
            <stop offset="50%" stopColor="#F1F5F9" />
            <stop offset="75%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          {/* Gold Trim Gradient */}
          <linearGradient id="ffTrophyGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#A16207" />
          </linearGradient>

          {/* Neon Edge Glow */}
          <filter id="ffGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Wings / Crystal Crest */}
        <path
          d="M80 10 L125 38 L128 92 L80 135 L32 92 L35 38 Z"
          fill="url(#ffTrophyShieldGrad)"
          stroke="#E9D5FF"
          strokeWidth="2.5"
          filter="url(#ffGlow)"
        />

        {/* Secondary Inner Bevel Shield */}
        <path
          d="M80 20 L115 44 L118 86 L80 123 L42 86 L45 44 Z"
          fill="url(#ffTrophyCoreGrad)"
          stroke="#A855F7"
          strokeWidth="1.5"
        />

        {/* Faceted Top Crown Shards */}
        <polygon points="80,20 95,45 80,40" fill="#E9D5FF" opacity="0.6" />
        <polygon points="80,20 65,45 80,40" fill="#DDD6FE" opacity="0.4" />
        <polygon points="125,38 115,44 118,86 128,92" fill="#7E22CE" opacity="0.5" />
        <polygon points="35,38 45,44 42,86 32,92" fill="#581C87" opacity="0.7" />

        {/* Central Padlock / Vault Emblem */}
        {/* Padlock Shackle */}
        <path
          d="M68 62 C68 53, 73 47, 80 47 C87 47, 92 53, 92 62 L92 70 L68 70 Z"
          fill="none"
          stroke="#F3E8FF"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Padlock Body */}
        <rect
          x="62"
          y="68"
          width="36"
          height="32"
          rx="5"
          fill="url(#ffTrophyShieldGrad)"
          stroke="#E9D5FF"
          strokeWidth="2"
        />
        {/* Padlock Keyhole */}
        <circle cx="80" cy="80" r="3.5" fill="#FFFFFF" />
        <polygon points="78,80 82,80 83,89 77,89" fill="#FFFFFF" />

        {/* Trophy Stem & Curved Handles */}
        {/* Left Wing Support */}
        <path
          d="M32 92 C25 115, 45 142, 65 148 L68 138 C54 133, 40 114, 44 95 Z"
          fill="url(#ffTrophyPedestalGrad)"
        />
        {/* Right Wing Support */}
        <path
          d="M128 92 C135 115, 115 142, 95 148 L92 138 C106 133, 120 114, 116 95 Z"
          fill="url(#ffTrophyPedestalGrad)"
        />

        {/* Central Throat & Connector */}
        <polygon points="70,132 90,132 86,160 74,160" fill="url(#ffTrophyPedestalGrad)" />
        <ellipse cx="80" cy="132" rx="12" ry="3" fill="#64748B" />

        {/* Tiered Metallic Base Pedestal */}
        {/* Ring 1 */}
        <ellipse cx="80" cy="160" rx="18" ry="4" fill="url(#ffTrophyPedestalGrad)" />
        {/* Tier 2 Base Pillar */}
        <path d="M62 160 L98 160 L102 180 L58 180 Z" fill="url(#ffTrophyPedestalGrad)" />
        {/* Pedestal Bottom Plate */}
        <ellipse cx="80" cy="180" rx="26" ry="6" fill="#1E293B" />
        <ellipse cx="80" cy="178" rx="25" ry="5" fill="url(#ffTrophyPedestalGrad)" />

        {/* Specular Light Reflections */}
        <ellipse cx="78" cy="168" rx="10" ry="2" fill="#FFFFFF" opacity="0.4" />
        <circle cx="48" cy="50" r="2" fill="#FFFFFF" opacity="0.8" />
        <circle cx="112" cy="50" r="2" fill="#FFFFFF" opacity="0.8" />
      </svg>
    </div>
  );
}
