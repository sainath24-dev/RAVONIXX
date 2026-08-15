"use client";

import React from "react";

export default function MarqueeStrip() {
  const phrase = "DROP • LOOT • BOOYAH • COMPETE NOW • RAVONIXX ESPORTS";
  
  // Duplicate items to ensure a seamless looping scroll container
  const items = Array(12).fill(phrase);

  return (
    <div className="w-full bg-[#0C0F12] border-y border-hairline h-14 flex items-center overflow-hidden relative select-none">
      <div 
        className="flex items-center w-max animate-marquee hover:[animation-play-state:paused] cursor-pointer"
        style={{ animationDuration: "15s" }}
      >
        {items.map((text, idx) => (
          <div key={idx} className="flex items-center flex-shrink-0">
            <span className="font-display font-black text-[1.25rem] tracking-widest text-primary uppercase italic slanted">
              {text}
            </span>
            <span className="text-white text-lg mx-8 opacity-40 select-none">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
