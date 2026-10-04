"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BattleCard from "@/components/BattleCard";
import BattleCardModal from "@/components/BattleCardModal";
import { players, Player } from "@/lib/players";

function BattleCardSkeleton() {
  return (
    <div className="w-80 h-[400px] border border-hairline bg-panel clip-card relative flex flex-col justify-end p-6 select-none">
      {/* Top right character icon placeholder */}
      <div className="absolute top-2.5 right-2.5 w-10 h-10 rounded-full bg-panel-raised animate-pulse" />
      {/* Top left role pill placeholder */}
      <div className="absolute top-2.5 left-2.5 w-16 h-5 bg-panel-raised rounded-[2px] animate-pulse" />
      
      {/* Bottom text block placeholder */}
      <div className="flex flex-col gap-3 w-full">
        <div className="h-6 bg-panel-raised rounded-[2px] animate-pulse w-2/3" />
        <div className="flex justify-between items-center w-full">
          <div className="h-3.5 bg-panel-raised rounded-[2px] animate-pulse w-1/4" />
          <div className="h-3.5 bg-panel-raised rounded-[2px] animate-pulse w-1/3" />
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [rosterPlayers, setRosterPlayers] = useState<Player[]>(players);

  useEffect(() => {
    let isMounted = true;
    const loadPlayers = async () => {
      try {
        const res = await fetch("/api/players");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setRosterPlayers(data);
          }
        }
      } catch {
        // use fallback static players
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadPlayers();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex flex-col gap-12 min-h-[85vh]">
      {/* Animated Title Section */}
      <div className="text-center md:text-left select-none overflow-hidden py-2 flex-shrink-0">
        <motion.h1 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="display-font font-black italic tracking-wide text-4xl sm:text-6xl text-text-primary uppercase slanted leading-none flex items-center justify-center md:justify-start gap-1"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-primary font-bold"
          >
            /
          </motion.span>
          MEET OUR TEAM
        </motion.h1>
      </div>

      {/* Battle Card Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center w-full mt-4"
      >
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            // Skeleton array loaders
            Array(6)
              .fill(null)
              .map((_, idx) => (
                <motion.div
                  key={`skel-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <BattleCardSkeleton />
                </motion.div>
              ))
          ) : (
            // Real cards - render all operators directly
            rosterPlayers.map((player, idx) => (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
              >
                <BattleCard
                  player={player}
                  index={idx}
                  onSelect={() => setSelectedPlayer(player)}
                  isFiltered={false}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* dossier popup */}
      <AnimatePresence>
        {selectedPlayer && (
          <BattleCardModal
            player={selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
