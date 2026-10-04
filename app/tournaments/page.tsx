"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Search,
  Lock,
  Loader2,
} from "lucide-react";
import { TournamentWithMeta } from "@/lib/tournaments/service";
import FreeFireTrophyBadge from "@/components/tournaments/FreeFireTrophyBadge";

export default function TournamentsListingPage() {
  const [tournaments, setTournaments] = useState<TournamentWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN">("ALL");

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tournaments");
      const data = await res.json();
      if (data.tournaments) {
        setTournaments(data.tournaments);
      }
    } catch (err) {
      console.error("Failed to load tournaments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const filteredTournaments = tournaments.filter((t) => {
    if (statusFilter === "OPEN" && !t.isRegistrationCurrentlyOpen) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div 
      className="min-h-screen pt-24 pb-20 select-none font-sans text-white"
      style={{
        backgroundImage: `linear-gradient(135deg, #090E1F 0%, #111933 50%, #0A0E1B 100%)`,
      }}
    >
      {/* Dynamic Background Angular Slash Overlay matching Free Fire In-Game UI */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 -z-0"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #1A264D 0, #1A264D 80px, transparent 80px, transparent 160px)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
        {/* Top Free Fire In-Game Header Bar matching WhatsApp Image 2026-10-04 at 10.29.30.jpeg */}
        <div className="flex items-center justify-between bg-[#0B0E1B] border-b border-[#1A233D] px-3 sm:px-6 py-2 rounded-t-sm shadow-md">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Slanted Golden SHOWMATCH button */}
            <div
              className="px-5 py-2 bg-[#FFB800] text-black font-display font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_2px_10px_rgba(255,184,0,0.3)]"
              style={{ clipPath: "polygon(0 0, 100% 0, 92% 100%, 0 100%)" }}
            >
              SHOWMATCH
            </div>

            {/* Dark ESPORTS CENTER button */}
            <div className="px-5 py-2 bg-[#121829] text-white/90 font-display font-bold text-xs sm:text-sm tracking-wider uppercase">
              ESPORTS CENTER
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadTournaments}
              title="Refresh Tournaments"
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Secondary Sub-Navbar matching Free Fire in-game lobby */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0E1528] p-3 sm:px-6 border border-[#1A233D] rounded-b-sm">
          {/* Left Buttons: Clean filter tabs */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-4 py-2 font-display font-black text-xs uppercase tracking-wider rounded-sm transition-all flex items-center gap-1.5 ${
                statusFilter === "ALL"
                  ? "bg-[#FFB800] text-black shadow-[0_2px_8px_rgba(255,184,0,0.3)]"
                  : "bg-[#16203B] text-white/75 hover:text-white border border-white/10"
              }`}
            >
              <span>🏆</span>
              <span>All Tournaments</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("OPEN")}
              className={`px-4 py-2 font-display font-black text-xs uppercase tracking-wider rounded-sm transition-all flex items-center gap-1.5 ${
                statusFilter === "OPEN"
                  ? "bg-emerald-500 text-black shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
                  : "bg-[#16203B] text-white/75 hover:text-white border border-white/10"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Registration Open</span>
            </button>
          </div>

          {/* Right Search Bar: [ Enter Tournament ID ] 🔍 */}
          <div className="flex items-center w-full sm:w-80 bg-[#16203B] border border-white/15 rounded-sm overflow-hidden px-3 py-1.5 focus-within:border-[#FFB800]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Tournament ID or Name..."
              className="w-full bg-transparent text-xs text-white placeholder-white/40 focus:outline-none font-mono"
            />
            <Search className="w-4 h-4 text-white/60 ml-2" />
          </div>
        </div>

        {/* Tournament Cards Grid matching WhatsApp Image 2026-10-04 at 10.29.30.jpeg */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-white/70">
            <Loader2 className="w-8 h-8 animate-spin text-[#FFB800]" />
            <span className="font-mono text-xs uppercase tracking-widest">
              Loading Free Fire Tournaments...
            </span>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="py-20 text-center bg-[#0E1528] border border-white/10 rounded-sm p-8 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-3 flex items-center justify-center text-3xl">
              📝
            </div>
            <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
              Nothing Here
            </h3>
            <p className="text-xs text-white/60 mt-1">
              No tournaments found. Create your own tournament or check back soon!
            </p>
            <div className="mt-5">
              <Link
                href="/admin/tournaments/new"
                className="px-5 py-2 bg-[#FFB800] text-black font-display font-bold text-xs uppercase tracking-wider rounded inline-block"
              >
                Host New Tournament
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((t) => {
              const isOpen = t.computedStatus === "Registration Open" && t.isRegistrationCurrentlyOpen;
              const isOngoing = t.computedStatus === "Ongoing";

              return (
                <div
                  key={t.id}
                  className="bg-white text-black rounded-sm overflow-hidden shadow-2xl flex flex-col justify-between transition-transform hover:-translate-y-1 duration-200 border border-gray-300 relative group"
                >
                  {/* Top Header Tag Row: Slanted Purple MINE tag + Registered Players Count */}
                  <div className="relative flex items-center justify-between p-3 border-b border-gray-200 bg-[#FAFAFA]">
                    {/* Slanted Purple Badge */}
                    <div
                      className="px-4 py-0.5 bg-[#8B5CF6] text-white font-display font-black text-[11px] uppercase tracking-wider"
                      style={{ clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)" }}
                    >
                      FREE FIRE
                    </div>

                    {/* Player counter: 👤 X */}
                    <div className="flex items-center gap-1 font-mono text-xs font-bold text-gray-700">
                      <span>👤</span>
                      <span>
                        {t.registeredCount}
                        {t.maxTeams ? `/${t.maxTeams}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Title Banner (Yellow background on active tournament matching reference image) */}
                  <div className={`p-4 ${isOpen ? "bg-[#FFCC00]/25" : "bg-white"} border-b border-gray-100 text-center`}>
                    <h3 className="font-display font-black text-lg text-black uppercase tracking-tight truncate">
                      {t.title}
                    </h3>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      <span className={`px-2 py-0.2 font-display font-black text-[10px] uppercase rounded-sm border ${
                        t.eventMode === "LAN"
                          ? "bg-amber-500/15 text-amber-800 border-amber-500/40"
                          : t.eventMode === "Hybrid"
                          ? "bg-cyan-500/15 text-cyan-800 border-cyan-500/40"
                          : t.eventMode === "Watch Party"
                          ? "bg-pink-500/15 text-pink-800 border-pink-500/40"
                          : "bg-purple-500/15 text-purple-800 border-purple-500/40"
                      }`}>
                        {t.eventMode || "Online"}
                      </span>
                      <span className="font-display font-bold text-xs text-gray-600 uppercase tracking-wider">
                        {t.gameName || "Battle Royale"} | {t.format.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  {/* Center Emblem: Authentic Purple Trophy Badge or Custom Banner */}
                  <div className="p-6 flex flex-col items-center justify-center my-auto">
                    {t.bannerUrl && !t.bannerUrl.includes("Map_") ? (
                      <div className="w-28 h-28 rounded-lg overflow-hidden border-2 border-purple-500/20 shadow-md">
                        <img
                          src={t.bannerUrl}
                          alt={t.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <FreeFireTrophyBadge className="w-28 h-32" />
                    )}

                    {/* Purple Secret / Public Pill */}
                    <div className="mt-3 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#8B5CF6] text-white font-display font-bold text-[10px] uppercase tracking-wider">
                      <Lock className="w-3 h-3" />
                      <span>OFFICIAL LOBBY</span>
                    </div>

                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                      AUTO DISTRIBUTION
                    </span>

                    {/* Highlighted Prize Pool Box */}
                    <div className="mt-3 w-full bg-[#0E1528] py-2 px-3 text-center rounded-sm border-2 border-[#FFB800] shadow-[0_0_12px_rgba(255,184,0,0.2)]">
                      <div className="flex items-center justify-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-display font-black uppercase tracking-widest text-[#FFB800]">
                          🏆 PRIZE POOL
                        </span>
                        {(t.prizeDiamonds || t.prizePool.toLowerCase().includes("diamond")) && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 rounded uppercase font-bold">
                            💎 Free Fire Diamonds
                          </span>
                        )}
                      </div>
                      <span className="font-display font-black text-xs sm:text-sm uppercase tracking-wider text-white block">
                        {t.prizePool && t.prizePool !== "0" && t.prizePool !== "None"
                          ? t.prizePool
                          : "NO REWARDS AVAILABLE"}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Button matching WhatsApp Image 2026-10-04 at 10.29.30.jpeg */}
                  <Link
                    href={`/tournaments/${t.slug}`}
                    className={`w-full py-3 text-center font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                      isOpen
                        ? "bg-[#FFB800] hover:bg-[#FFA500] text-black shadow"
                        : isOngoing
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                    }`}
                  >
                    <span>{isOpen ? "DETAIL >>" : isOngoing ? "LIVE MATCH >>" : "VIEW TOURNAMENT >>"}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
