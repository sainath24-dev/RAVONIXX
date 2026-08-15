"use client";

import React from "react";
import Image from "next/image";

export default function PartnerStrip() {
  const logos = [
    {
      id: "tz-esports",
      name: "TZ Esports",
      component: (
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image
              src="/images/sponsors/tz_esports_gold_cropped.png"
              alt="TZ Esports"
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-black text-xs tracking-widest text-white uppercase">TZ ESPORTS</span>
            <span className="font-body text-[8px] text-[#FDE047] font-bold tracking-wider">OFFICIAL SPONSOR</span>
          </div>
        </div>
      ),
    },
    {
      id: "nx9-esports",
      name: "NX9 Esports",
      component: (
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-7 flex-shrink-0">
            <Image
              src="/images/sponsors/nx9_esports_purple_cropped.png"
              alt="NX9 Esports"
              fill
              sizes="36px"
              className="object-contain"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-black text-xs tracking-widest text-white uppercase">NX9 ESPORTS</span>
            <span className="font-body text-[8px] text-primary font-bold tracking-wider">OFFICIAL SPONSOR</span>
          </div>
        </div>
      ),
    },
    {
      id: "rage-genesis",
      name: "Rage Genesis",
      component: (
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-8 flex-shrink-0">
            <Image
              src="/images/sponsors/rage_genesis_white.png"
              alt="Rage Genesis"
              fill
              sizes="36px"
              className="object-contain"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-black text-xs tracking-widest text-white uppercase">RAGE GENESIS</span>
            <span className="font-body text-[8px] text-rose-400 font-bold tracking-wider">OFFICIAL SPONSOR</span>
          </div>
        </div>
      ),
    },
    {
      id: "playora",
      name: "Playora",
      component: (
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 flex-shrink-0 drop-shadow-[0_0_10px_rgba(6,182,212,0.45)]">
            <Image
              src="/images/sponsors/playora.png"
              alt="Playora"
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-black text-xs tracking-widest text-white uppercase">PLAYORA</span>
            <span className="font-body text-[8px] text-cyan-400 font-bold tracking-wider">OFFICIAL SPONSOR</span>
          </div>
        </div>
      ),
    },
    {
      id: "ffmax",
      name: "Free Fire MAX",
      component: (
        <div className="relative w-32 h-8">
          <Image
            src="/images/ff logo/FREE_FIRE_MAX_LOGO.PNG.png"
            alt="Free Fire MAX"
            fill
            sizes="128px"
            className="object-contain"
          />
        </div>
      ),
    },
    {
      id: "ravonixx",
      name: "RAVONIXX Esports",
      component: (
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 flex-shrink-0">
            <Image
              src="/images/logo/ravonixx_white.png"
              alt="RAVONIXX Emblem"
              fill
              sizes="28px"
              className="object-contain"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-black text-xs tracking-widest text-white uppercase">RAVONIXX</span>
            <span className="font-body text-[8px] text-primary font-bold">TACTICAL SQUAD</span>
          </div>
        </div>
      ),
    },
    {
      id: "ffws",
      name: "FFWS",
      component: (
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6 flex-shrink-0">
            <Image
              src="/images/ff logo/FF_SHORT_LOGO.PNG.png"
              alt="FF Short Logo"
              fill
              sizes="24px"
              className="object-contain"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-black text-xs tracking-widest text-white uppercase">FFWS</span>
            <span className="font-body text-[8px] text-text-muted">WORLD SERIES</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="relative w-full overflow-hidden select-none py-4">
      {/* Left/Right Fade Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-void to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-void to-transparent z-10 pointer-events-none" />

      {/* Infinite Logo Loop Track */}
      <div className="flex w-max animate-marquee gap-12 sm:gap-16 items-center">
        {[...logos, ...logos, ...logos, ...logos].map((item, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-300 cursor-pointer px-4"
          >
            {item.component}
          </div>
        ))}
      </div>
    </div>
  );
}
