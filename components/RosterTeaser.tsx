"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import BattleCard from "./BattleCard";
import BattleCardModal from "./BattleCardModal";
import { players, Player } from "@/lib/players";

export default function RosterTeaser() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Track horizontal scroll progress
  const { scrollXProgress } = useScroll({
    container: containerRef,
    axis: "x",
  });

  // Smooth out progress bar scaling
  const scaleX = useSpring(scrollXProgress, { stiffness: 100, damping: 20 });

  return (
    <div className="relative w-full flex flex-col gap-6">
      {/* Snap Scroll Carousel Container */}
      <div
        ref={containerRef}
        style={{ scrollbarWidth: "none" }}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory py-4 px-2 scrollbar-none scroll-smooth select-none"
      >
        {players.map((player, idx) => (
          <div
            key={player.id}
            className="snap-start flex-shrink-0 origin-center scale-[0.98] hover:scale-[1] transition-all duration-300"
          >
            <BattleCard
              player={player}
              index={idx}
              onSelect={() => setSelectedPlayer(player)}
            />
          </div>
        ))}
      </div>

      {/* Progress Bar Indicator */}
      <div className="max-w-[120px] w-full mx-auto h-[2px] bg-hairline relative rounded-full mt-2">
        <motion.div
          style={{ scaleX, transformOrigin: "left" }}
          className="absolute inset-0 bg-primary rounded-full"
        />
      </div>

      {/* Dossier Modal */}
      {selectedPlayer && (
        <BattleCardModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}
