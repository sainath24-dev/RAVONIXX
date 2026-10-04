"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  KeyRound,
  X,
  Trophy,
} from "lucide-react";
import { TournamentWithMeta } from "@/lib/tournaments/service";
import FreeFireTournamentRoadmap from "@/components/tournaments/FreeFireTournamentRoadmap";

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [tournament, setTournament] = useState<TournamentWithMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        const res = await fetch(`/api/tournaments/${slug}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Tournament not found");
        setTournament(data.tournament);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadDetail();
  }, [slug]);

  if (loading) {
    return (
      <div 
        className="min-h-screen pt-40 pb-20 flex flex-col items-center justify-center gap-3 text-white"
        style={{
          backgroundImage: `linear-gradient(135deg, #090E1F 0%, #111933 50%, #0A0E1B 100%)`,
        }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-[#FFB800]" />
        <span className="font-mono text-xs uppercase tracking-widest text-white/70">
          Loading Tournament Arena...
        </span>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div 
        className="min-h-screen pt-40 pb-20 px-4 text-center text-white"
        style={{
          backgroundImage: `linear-gradient(135deg, #090E1F 0%, #111933 50%, #0A0E1B 100%)`,
        }}
      >
        <div className="max-w-md mx-auto bg-[#0E1528] border border-white/10 p-8 rounded-sm space-y-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="font-display font-black text-xl uppercase tracking-wider">
            Tournament Not Found
          </h2>
          <p className="text-xs text-white/60">
            The requested tournament may be in draft mode or no longer active.
          </p>
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFB800] text-black text-xs font-display font-black uppercase tracking-wider rounded"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pt-24 pb-20 select-none font-sans text-white"
      style={{
        backgroundImage: `linear-gradient(135deg, #090E1F 0%, #111933 50%, #0A0E1B 100%)`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Top Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/tournaments"
            className="text-xs font-display font-bold text-white/70 hover:text-white inline-flex items-center gap-1.5 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4 text-[#FFB800]" />
            <span>Back to Tournaments</span>
          </Link>

          <div className="text-xs font-mono text-white/50">
            ID: <span className="text-[#FFB800] font-bold">{tournament.id}</span>
          </div>
        </div>

        {/* Official Free Fire Showmatch Screen (Exact Reference Match) */}
        <div className="rounded-sm overflow-hidden shadow-2xl border border-[#1A233D]">
          <FreeFireTournamentRoadmap
            tournament={tournament}
            registrationCount={tournament.registeredCount}
            onOpenRules={() => setShowRulesModal(true)}
            onOpenRegister={() => router.push(`/tournaments/${tournament.slug}/register`)}
          />
        </div>

        {/* Room Credentials Card (If Published by Admin) */}
        {tournament.roomDetails && tournament.isRoomDetailsVisible && (
          <div className="bg-[#0E1528] border border-emerald-500/40 p-4 sm:p-5 rounded-sm flex items-start gap-4 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xs uppercase text-emerald-400 tracking-wider">
                  MATCH ROOM CREDENTIALS
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs font-mono text-white whitespace-pre-line leading-relaxed">
                {tournament.roomDetails}
              </p>
            </div>
          </div>
        )}

        {/* Highlighted Official Prize Pool Banner */}
        {tournament.prizePool && tournament.prizePool !== "0" && tournament.prizePool !== "None" && (
          <div className="bg-[#0E1528] border-2 border-[#FFB800] rounded-sm p-5 sm:p-6 shadow-[0_0_25px_rgba(255,184,0,0.2)] relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-14 h-14 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/40 flex items-center justify-center text-[#FFB800] flex-shrink-0 shadow-[0_0_15px_rgba(255,184,0,0.3)]">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="px-2 py-0.5 bg-[#FFB800] text-black font-display font-black text-[10px] uppercase tracking-widest rounded-sm">
                      OFFICIAL PRIZE POOL
                    </span>
                    {(tournament.prizeDiamonds || tournament.prizePool.toLowerCase().includes("diamond")) && (
                      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono font-bold text-[10px] uppercase rounded-sm flex items-center gap-1">
                        <span>💎</span>
                        <span>DIAMONDS</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-black text-2xl sm:text-3xl text-[#FFB800] tracking-wide uppercase mt-1 drop-shadow-[0_2px_8px_rgba(255,184,0,0.4)]">
                    {tournament.prizePool}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
                <div className="bg-[#121829] px-4 py-2.5 rounded border border-white/10 text-center font-mono">
                  <span className="text-[10px] text-white/50 uppercase tracking-widest block">Event Mode</span>
                  <span className={`text-xs font-bold uppercase font-display tracking-wider ${
                    tournament.eventMode === "LAN"
                      ? "text-amber-400"
                      : tournament.eventMode === "Hybrid"
                      ? "text-cyan-400"
                      : tournament.eventMode === "Watch Party"
                      ? "text-pink-400"
                      : "text-purple-400"
                  }`}>
                    {tournament.eventMode || "Online"}
                  </span>
                </div>

                {tournament.entryFee && (
                  <div className="bg-[#121829] px-4 py-2.5 rounded border border-white/10 text-center font-mono">
                    <span className="text-[10px] text-white/50 uppercase tracking-widest block">Entry Fee</span>
                    <span className="text-sm font-bold text-white uppercase">{tournament.entryFee}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Additional Details & Overview Card */}
        <div className="bg-[#0E1528] border border-[#1A233D] rounded-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-[#FFB800] font-display font-black text-sm uppercase tracking-wider border-b border-white/5 pb-3">
            <span className="w-1.5 h-4 bg-[#FFB800]" />
            <span>TOURNAMENT INTEL & DETAILS</span>
          </div>

          <div className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans whitespace-pre-line">
            {tournament.fullDetails || tournament.shortDescription}
          </div>
        </div>
      </div>

      {/* Rules Modal Dialog matching WhatsApp Image 2026-10-04 at 10.29.31.jpeg */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-[#0E1528] text-white border border-[#FFB800]/40 rounded-sm shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between bg-[#0B0E1B] px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#FFB800]" />
                <h3 className="font-display font-black text-sm tracking-wider uppercase text-[#FFB800]">
                  Official Tournament Rules
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="p-1 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rules Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4 text-xs font-sans text-white/90 whitespace-pre-line leading-relaxed">
              {tournament.rules}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#0B0E1B] px-5 py-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="px-5 py-2 bg-[#FFB800] hover:bg-[#FFA500] text-black font-display font-black text-xs uppercase tracking-wider rounded"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
