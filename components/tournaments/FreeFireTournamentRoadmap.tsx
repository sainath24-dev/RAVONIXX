"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Share2, ArrowLeft, RefreshCw, X, ChevronRight
} from "lucide-react";
import { Tournament, TournamentStage } from "@/lib/tournaments/types";
import FreeFireTrophyBadge from "./FreeFireTrophyBadge";
import FreeFireInvitationCardModal from "./FreeFireInvitationCardModal";

interface Props {
  tournament: Tournament;
  registrationCount?: number;
  onOpenRules?: () => void;
  onOpenRegister?: () => void;
}

const STAGES: TournamentStage[] = ["SIGN-UP", "CHECK-IN", "GROUPING", "IN PROGRESS", "ENDED"];

export default function FreeFireTournamentRoadmap({ 
  tournament, 
  registrationCount = 0,
  onOpenRules,
  onOpenRegister,
}: Props) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [countdownText, setCountdownText] = useState<{ number: string; label: string }>({
    number: "LIVE",
    label: "",
  });

  const currentStage: TournamentStage = tournament.currentStage || "SIGN-UP";
  const stageIndex = Math.max(0, STAGES.indexOf(currentStage));

  // Default game maps schedule if not provided
  const games = tournament.mapsSchedule && tournament.mapsSchedule.length > 0
    ? tournament.mapsSchedule
    : [
        { gameNumber: 1, time: "10:29", mapName: "Bermuda", mapImage: "/images/maps/Free_Fire_Map_Bermuda_2023.png" },
        { gameNumber: 2, time: "10:59", mapName: "Purgatory", mapImage: "/images/maps/Map_FF_Purgatory_allmode.jpeg" },
        { gameNumber: 3, time: "11:29", mapName: "Kalahari", mapImage: "/images/maps/Map_FF_Kalahari_allmode.jpeg" },
        { gameNumber: 4, time: "11:59", mapName: "Alpine", mapImage: "/images/maps/Map_FF_Alpine_allmode.jpeg" },
      ];

  // Live countdown to tournament start
  useEffect(() => {
    const target = new Date(tournament.matchSchedule || tournament.registrationCloseDate).getTime();
    if (isNaN(target)) {
      setCountdownText({ number: "SOON", label: "Tournament starts" });
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setCountdownText({ number: "LIVE", label: "Tournament is" });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setCountdownText({ number: `${days}D ${hours}H`, label: "Tournament starts in" });
      } else {
        setCountdownText({ number: `${hours}H ${mins}M`, label: "Tournament starts in" });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [tournament.matchSchedule, tournament.registrationCloseDate]);

  return (
    <div className="w-full select-none font-sans">
      {/* Top Free Fire In-Game Navigation Bar matching WhatsApp Image 2026-10-04 at 10.29.29.jpeg */}
      <div className="flex items-center justify-between bg-[#0B0E1B] border-b border-[#1A233D] px-3 sm:px-6 py-2">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Slanted Golden SHOWMATCH button */}
          <div
            className="px-4 sm:px-6 py-2 bg-[#FFB800] text-black font-display font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_2px_10px_rgba(255,184,0,0.3)]"
            style={{ clipPath: "polygon(0 0, 100% 0, 92% 100%, 0 100%)" }}
          >
            SHOWMATCH
          </div>

          {/* Dark ESPORTS CENTER button */}
          <Link
            href="/tournaments"
            className="px-4 sm:px-5 py-2 bg-[#121829] hover:bg-[#1A233D] text-white/80 hover:text-white font-display font-bold text-xs sm:text-sm tracking-wider uppercase transition-colors"
          >
            ESPORTS CENTER
          </Link>
        </div>

        <div className="flex items-center gap-3 text-white/70">
          <button
            type="button"
            onClick={() => window.location.reload()}
            title="Refresh"
            className="p-1.5 hover:text-white hover:bg-white/5 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/tournaments"
            title="Close"
            className="p-1.5 hover:text-white hover:bg-white/5 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Screen Layout: Left White Tactical Card + Right Deep Navy Tactical Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px] bg-[#0E1528] border-x border-b border-[#1A233D]">
        
        {/* ================= LEFT WHITE CARD (Exact in-game design) ================= */}
        <div className="lg:col-span-4 bg-white text-black p-5 sm:p-6 flex flex-col justify-between relative shadow-xl">
          {/* Top ID & Yellow Slanted RULES >> tag */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <span className="font-mono text-xs font-semibold text-gray-500 tracking-tight truncate max-w-[170px]">
              ID: {tournament.id}
            </span>

            {/* Slanted RULES >> button */}
            <button
              type="button"
              onClick={onOpenRules}
              className="px-3 py-1 bg-[#FFB800] hover:bg-[#FFA500] text-black font-display font-black text-xs uppercase tracking-wider transition-transform active:scale-95 flex items-center gap-1 shadow-sm"
              style={{ clipPath: "polygon(0 0, 100% 0, 92% 100%, 8% 100%)" }}
            >
              <span>RULES</span>
              <span>&gt;&gt;</span>
            </button>
          </div>

          {/* Tournament Name & Format */}
          <div className="text-center my-4">
            <h1 className="font-display font-black text-xl sm:text-2xl text-black uppercase tracking-tight line-clamp-2">
              {tournament.title}
            </h1>
            <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
              <span className={`px-2 py-0.5 font-display font-black text-[10px] uppercase rounded-sm border ${
                tournament.eventMode === "LAN" 
                  ? "bg-amber-500/15 text-amber-800 border-amber-500/40"
                  : tournament.eventMode === "Hybrid"
                  ? "bg-cyan-500/15 text-cyan-800 border-cyan-500/40"
                  : tournament.eventMode === "Watch Party"
                  ? "bg-pink-500/15 text-pink-800 border-pink-500/40"
                  : "bg-purple-500/15 text-purple-800 border-purple-500/40"
              }`}>
                {tournament.eventMode || "Online"} EVENT
              </span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-display font-bold text-[10px] uppercase rounded-sm border border-gray-200">
                {tournament.format}
              </span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-display font-bold text-[10px] uppercase rounded-sm border border-gray-200">
                {tournament.gameCount || games.length} Game(s)
              </span>
            </div>
          </div>

          {/* Center Trophy / Banner Badge */}
          <div className="my-auto py-4 flex flex-col items-center justify-center">
            {tournament.bannerUrl && !tournament.bannerUrl.includes("Map_") ? (
              <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/30 shadow-md">
                <img
                  src={tournament.bannerUrl}
                  alt={tournament.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <FreeFireTrophyBadge className="w-32 h-36" />
            )}
          </div>

          {/* Bottom Data Table (Grey Background with Clean Black Text) */}
          <div className="mt-4 space-y-2">
            <div className="bg-[#EDEDED] rounded-sm p-2.5 text-[11px] font-mono font-medium text-gray-700 space-y-1">
              <div className="flex justify-between items-center">
                <span className="uppercase text-gray-500 font-bold">SIGN-UP DEADLINE:</span>
                <span className="font-bold text-gray-900">
                  {new Date(tournament.registrationCloseDate).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-gray-300">
                <span className="uppercase text-gray-500 font-bold">TOURNAMENT TIME:</span>
                <span className="font-bold text-gray-900">
                  {tournament.matchSchedule || "To Be Announced"}
                </span>
              </div>
            </div>

            {/* High-Impact Free Fire Rewards Vault Banner */}
            {tournament.prizePool && tournament.prizePool !== "0" && tournament.prizePool !== "None" ? (
              <div 
                className="rounded-sm p-3 text-center border-2 border-[#FFB800] relative overflow-hidden shadow-[0_0_15px_rgba(255,184,0,0.25)]"
                style={{
                  background: "linear-gradient(135deg, #0A0E1B 0%, #16203B 50%, #0A0E1B 100%)",
                }}
              >
                {/* Slanted Golden Tag */}
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-[#FFB800] text-black font-display font-black text-[9px] uppercase tracking-widest rounded-sm">
                    OFFICIAL PRIZE POOL
                  </span>
                  {(tournament.prizeDiamonds || tournament.prizePool.toLowerCase().includes("diamond")) && (
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono font-bold text-[9px] uppercase rounded-sm flex items-center gap-1">
                      <span>💎</span>
                      <span>DIAMONDS</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2">
                  <span className="text-base sm:text-lg">🏆</span>
                  <span className="font-display font-black text-sm sm:text-base tracking-wider uppercase text-[#FFB800] drop-shadow-[0_2px_8px_rgba(255,184,0,0.4)]">
                    {tournament.prizePool}
                  </span>
                  {(tournament.prizeDiamonds || tournament.prizePool.toLowerCase().includes("diamond")) && (
                    <span className="text-base sm:text-lg animate-pulse">💎</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-sm py-2 text-center border border-gray-200">
                <span className="font-display font-bold text-xs uppercase tracking-wider text-gray-500">
                  NO REWARDS SPECIFIED
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT DEEP NAVY TACTICAL AREA ================= */}
        <div 
          className="lg:col-span-8 p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden text-white"
          style={{
            backgroundImage: `linear-gradient(135deg, #0C1224 0%, #111A33 50%, #0A0F1E 100%)`,
          }}
        >
          {/* Angular Geometric Background Accent Overlay matching screenshots */}
          <div 
            className="absolute top-0 right-0 w-96 h-full bg-[#162142]/40 pointer-events-none -z-0"
            style={{ clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)" }}
          />

          {/* Top Header Row: Pill Badge + Share + Back */}
          <div className="flex items-center justify-between relative z-10">
            <div />

            {/* Center Pill: Currently Signed-Up Players */}
            <div 
              className="px-6 py-1.5 bg-[#EDEDED] text-black font-display font-black text-xs uppercase tracking-wider shadow flex items-center gap-2"
              style={{ clipPath: "polygon(8% 0, 92% 0, 100% 100%, 0 100%)" }}
            >
              <span>Currently Signed-Up Players</span>
              <span className="flex items-center gap-1 font-mono text-xs font-bold text-gray-900">
                👤 {registrationCount}
                {tournament.maxTeams ? `/${tournament.maxTeams}` : ""}
              </span>
            </div>

            {/* Right Buttons: Share/Invitation Ticket + Back */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                title="View Official Tournament Invitation Ticket & QR Scanner"
                className="p-2 bg-[#1A2444] hover:bg-[#25325E] border border-white/10 rounded text-[#FFB800] hover:text-white transition-colors flex items-center gap-1 text-xs font-display font-bold uppercase"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Invitation Ticket</span>
              </button>
              
              <Link
                href="/tournaments"
                title="Back to Tournaments"
                className="p-2 bg-[#1A2444] hover:bg-[#25325E] border border-white/10 rounded text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Center Section: Roadmap Progress Milestones Line (Exact Free Fire UI) */}
          <div className="my-8 relative z-10 w-full max-w-2xl mx-auto px-4">
            {/* The Horizontal Line */}
            <div className="relative flex items-center justify-between">
              {/* Line Track */}
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[2px] bg-white/20 z-0" />
              
              {/* Active Progress Fill Line */}
              <div 
                className="absolute top-1/2 left-0 -translate-y-1/2 h-[2px] bg-[#FFB800] z-0 transition-all duration-500"
                style={{ width: `${(stageIndex / (STAGES.length - 1)) * 100}%` }}
              />

              {STAGES.map((stage, idx) => {
                const isPassed = idx < stageIndex;
                const isCurrent = idx === stageIndex;

                return (
                  <div key={stage} className="relative z-10 flex flex-col items-center">
                    {/* Golden Trophy Marker floating above current stage! */}
                    <div className="h-7 flex items-center justify-center">
                      {isCurrent && (
                        <div className="text-[#FFB800] animate-bounce">
                          🏆
                        </div>
                      )}
                    </div>

                    {/* Milestone Diamond/Dot */}
                    <div
                      className={`w-3.5 h-3.5 rotate-45 border transition-all ${
                        isCurrent
                          ? "bg-[#FFB800] border-[#FFB800] shadow-[0_0_10px_#FFB800]"
                          : isPassed
                          ? "bg-white border-white"
                          : "bg-[#111A33] border-white/30"
                      }`}
                    />

                    {/* Milestone Label */}
                    <span
                      className={`mt-2 font-display text-[10px] sm:text-xs font-bold tracking-wider uppercase ${
                        isCurrent
                          ? "text-[#FFB800]"
                          : isPassed
                          ? "text-white"
                          : "text-white/40"
                      }`}
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Yellow indicator diamond on active match track */}
            <div className="w-full mt-6 h-0.5 bg-white/10 relative">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#FFB800] rotate-45 transition-all shadow-[0_0_8px_#FFB800]"
                style={{
                  left: `${(stageIndex / (STAGES.length - 1)) * 100}%`,
                  transform: "translate(-50%, -50%) rotate(45deg)",
                }}
              />
            </div>
          </div>

          {/* Match Lineup Cards Row (Game 1, Game 2, Game 3... Bermuda, Purgatory, etc.) */}
          <div className="relative z-10 my-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {games.slice(0, 4).map((game, idx) => (
                <div
                  key={game.gameNumber || idx}
                  className="bg-[#121A30] border border-white/10 rounded-sm overflow-hidden flex flex-col group hover:border-[#FFB800]/50 transition-colors shadow-lg"
                >
                  {/* Card Header: GAME X | Time */}
                  <div className="bg-[#0A0F1D] px-2.5 py-1.5 text-center border-b border-white/5">
                    <span className="font-display font-black text-xs text-white uppercase tracking-wider block">
                      GAME {game.gameNumber || idx + 1}
                    </span>
                    <span className="font-mono text-[10px] text-white/70 block">
                      {game.time}
                    </span>
                  </div>

                  {/* Map Screenshot Thumbnail */}
                  <div className="relative h-20 sm:h-24 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={game.mapImage || "/images/maps/Free_Fire_Map_Bermuda_2023.png"}
                      alt={game.mapName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Black Banner Tag: Map Name */}
                  <div className="bg-black/90 py-1 text-center border-t border-white/10">
                    <span className="font-display font-bold text-[11px] text-[#FFB800] uppercase tracking-wider">
                      {game.mapName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Countdown Text Status */}
          <div className="relative z-10 text-center my-3">
            <span className="font-display font-medium text-xs sm:text-sm text-white/80 tracking-wide">
              {countdownText.label}{" "}
              <strong className="text-[#FFB800] font-black font-mono text-sm sm:text-base">
                {countdownText.number}
              </strong>
            </span>
          </div>

          {/* Bottom Action Buttons Bar (Cancel / Register + Admin Portal / Lobby) */}
          <div className="relative z-10 flex items-center justify-center sm:justify-end gap-3 pt-3 border-t border-white/10">
            {/* Left Button: Free Fire rules or secondary */}
            <button
              type="button"
              onClick={onOpenRules}
              className="px-5 py-2.5 bg-[#EDEDED] hover:bg-white text-black font-display font-black text-xs uppercase tracking-wider rounded-sm transition-colors shadow"
            >
              Tournament Rules
            </button>

            {/* Right Button: Register Team or Open WhatsApp Lobby */}
            {tournament.status === "Registration Open" ? (
              <button
                type="button"
                onClick={onOpenRegister}
                className="px-6 py-2.5 bg-[#FFB800] hover:bg-[#FFA500] text-black font-display font-black text-xs uppercase tracking-wider rounded-sm transition-transform active:scale-95 shadow-[0_0_15px_rgba(255,184,0,0.4)] flex items-center gap-1.5"
              >
                <span>REGISTER TEAM</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="px-6 py-2.5 bg-[#121A30] hover:bg-[#1A2544] text-[#FFB800] border border-[#FFB800]/50 font-display font-black text-xs uppercase tracking-wider rounded-sm transition-colors shadow flex items-center gap-1.5"
              >
                <span>OFFICIAL LOBBY</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Standalone Tournament Invitation Card Ticket Modal with Offline QR Generator */}
      <FreeFireInvitationCardModal
        tournament={tournament}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  );
}
