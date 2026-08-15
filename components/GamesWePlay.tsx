"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, ChevronRight } from "lucide-react";

interface GameItem {
  id: string;
  name: string;
  genre: string;
  image: string;
  description: string;
  stats: string;
}

export default function GamesWePlay() {
  const [activeId, setActiveId] = useState<string>("bgmi");

  const games: GameItem[] = [
    {
      id: "bgmi",
      name: "BGMI",
      genre: "Battle Royale",
      image: "/images/games/bgmi.jpg",
      description: "India's premier tactical battle royale. Our secondary competitive division trains for regional qualifiers and private scrims.",
      stats: "Tier 1 Scrims"
    },
    {
      id: "roblox",
      name: "Roblox",
      genre: "Sandbox / Community",
      image: "/images/games/roblox.jpg",
      description: "Community building, custom game lobbies, and internal squad minigames hosted during weekly community events.",
      stats: "Weekly Nights"
    },
    {
      id: "among_us",
      name: "Among Us",
      genre: "Social Deduction",
      image: "/images/games/among_us.jpg",
      description: "Fast-paced deduction and squad communication training with team members and Discord community hosts.",
      stats: "Community Lobbies"
    },
    {
      id: "gta_v",
      name: "GTA V",
      genre: "Action / Open World",
      image: "/images/games/gta_v.jpg",
      description: "Crew heists, custom stunts, and roleplay server sessions with Ravonixx creators and members.",
      stats: "Crew Sessions"
    },
    {
      id: "moba_legends",
      name: "MOBA Legends",
      genre: "5v5 Competitive",
      image: "/images/games/moba_legends.jpg",
      description: "Strategic lane control, hero drafting, and fast mechanical clash matches in 5v5 team format.",
      stats: "5v5 Squads"
    },
    {
      id: "minecraft",
      name: "Minecraft",
      genre: "Survival / Sandbox",
      image: "/images/games/minecraft.jpg",
      description: "Private survival multiplayer server (SMP), base building, and competitive hardcore speedruns.",
      stats: "Private SMP"
    },
    {
      id: "skribbl",
      name: "Skribbl.io",
      genre: "Drawing & Guessing",
      image: "/images/games/skribbl.jpg",
      description: "Lighthearted drawing showdowns and rapid guessing tournaments in our open Discord channels.",
      stats: "Open Rooms"
    },
    {
      id: "codenames",
      name: "Codenames",
      genre: "Strategy & Word Game",
      image: "/images/games/codenames.jpg",
      description: "High-stakes spy word puzzles and operative clue-giving showdowns for tactical squad brainpower.",
      stats: "Tactical Puzzles"
    }
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Desktop / Tablet Horizontal Accordion Gallery */}
      <div className="hidden md:flex gap-3 h-[420px] w-full max-w-6xl mx-auto select-none">
        {games.map((game) => {
          const isActive = activeId === game.id;

          return (
            <motion.div
              key={game.id}
              onClick={() => setActiveId(game.id)}
              onMouseEnter={() => setActiveId(game.id)}
              animate={{
                flex: isActive ? 4 : 1,
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`relative h-full rounded-[4px] border overflow-hidden cursor-pointer flex flex-col justify-end p-5 transition-all duration-300 ${
                isActive
                  ? "border-primary bg-panel shadow-[0_0_30px_rgba(168,85,247,0.35)]"
                  : "border-hairline bg-panel/60 hover:border-primary/40 opacity-75 hover:opacity-100"
              }`}
            >
              {/* Poster Art with Dark Gradients */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={game.image}
                  alt={game.name}
                  fill
                  sizes="(max-width: 1024px) 25vw, 400px"
                  className={`object-cover object-center transition-transform duration-700 ${
                    isActive ? "scale-105" : "scale-100 filter brightness-75 contrast-110"
                  }`}
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent transition-opacity duration-300 ${
                    isActive ? "opacity-90" : "opacity-75"
                  }`}
                />
              </div>

              {/* Vertical Title Indicator when Collapsed */}
              {!isActive && (
                <div className="relative z-10 h-full flex flex-col items-center justify-between py-2 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-primary/60" />
                  <span className="font-display font-black text-sm uppercase text-white tracking-widest writing-vertical rotate-180 slanted">
                    {game.name}
                  </span>
                  <Gamepad2 className="w-4 h-4 text-text-muted" />
                </div>
              )}

              {/* Full Content Overlay when Expanded */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="relative z-10 flex flex-col justify-end gap-2 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-primary text-black font-display font-black text-[9px] uppercase tracking-wider rounded-[2px]">
                        {game.genre}
                      </span>
                      <span className="px-2 py-0.5 bg-white/10 text-white font-mono text-[9px] uppercase tracking-wider rounded-[2px] backdrop-blur-sm">
                        {game.stats}
                      </span>
                    </div>

                    <h3 className="font-display font-black text-2xl lg:text-3xl text-white uppercase italic tracking-wide slanted">
                      <span className="text-primary mr-1">/</span>{game.name}
                    </h3>

                    <p className="font-body text-xs text-text-muted leading-relaxed max-w-md line-clamp-2">
                      {game.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-primary text-[10px] font-display font-bold tracking-widest uppercase mt-2">
                      <span>COMMUNITY ACTIVE</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile Stack View */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {games.map((game) => (
          <div
            key={game.id}
            onClick={() => setActiveId(game.id)}
            className={`relative aspect-[4/3] rounded-[4px] border overflow-hidden p-3 flex flex-col justify-end ${
              activeId === game.id ? "border-primary bg-panel" : "border-hairline bg-panel/60"
            }`}
          >
            <div className="absolute inset-0 z-0">
              <Image
                src={game.image}
                alt={game.name}
                fill
                sizes="50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>
            <div className="relative z-10">
              <span className="text-[9px] font-mono text-primary uppercase block">{game.genre}</span>
              <h4 className="font-display font-black text-sm text-white uppercase slanted leading-tight">
                {game.name}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
