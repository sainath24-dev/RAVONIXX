"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  Calendar,
  AlertCircle,
  Loader2,
  Lock,
  RefreshCw,
} from "lucide-react";
import { TournamentWithMeta } from "@/lib/tournaments/service";
import FreeFireTrophyBadge from "@/components/tournaments/FreeFireTrophyBadge";

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<TournamentWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/tournaments");
      if (res.status === 401) {
        window.location.href = `/admin/login?from=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load tournaments");
      setTournaments(data.tournaments || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleDuplicate = async (id: string, title: string) => {
    if (!confirm(`Duplicate tournament "${title}"?`)) return;
    try {
      setActionInProgress(`dup-${id}`);
      const res = await fetch(`/api/admin/tournaments/${id}/duplicate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to duplicate");
      await fetchTournaments();
    } catch (err: any) {
      alert(`Error duplicating: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${title}"? This will permanently delete the tournament and its registered teams.`
      )
    )
      return;

    try {
      setActionInProgress(`del-${id}`);
      const res = await fetch(`/api/admin/tournaments/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setTournaments((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(`Error deleting: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Registration Open":
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Open
          </span>
        );
      case "Registration Closed":
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Closed
          </span>
        );
      case "Ongoing":
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Live
          </span>
        );
      case "Completed":
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Ended
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase bg-white/10 text-white/60 border border-white/10">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Actions matching Free Fire In-Game Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0E1528] p-4 sm:px-6 border border-[#1A233D] rounded-sm shadow">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[#FFB800] font-display font-black text-xl uppercase tracking-wider">
              MANAGE TOURNAMENTS
            </span>
            <span className="px-2 py-0.5 bg-[#FFB800]/20 text-[#FFB800] rounded text-[11px] font-mono font-bold">
              {tournaments.length} Total
            </span>
          </div>
          <p className="text-xs text-white/60 mt-0.5 font-sans">
            Control tournament rules, room IDs, WhatsApp lobby links, and registrations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTournaments}
            title="Refresh"
            className="p-2 bg-[#16203B] hover:bg-[#1E2C52] text-white/80 hover:text-white rounded border border-white/15 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/tournaments/new"
            className="px-4 py-2 bg-[#FFB800] hover:bg-[#FFA500] text-black font-display font-black text-xs uppercase tracking-wider rounded transition-transform active:scale-95 shadow flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>HOST NEW TOURNAMENT</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/40 border border-red-500/50 text-red-200 text-xs rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Tournaments Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-white/60">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFB800]" />
          <span className="font-mono text-xs uppercase tracking-widest">
            Loading Tournaments...
          </span>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="py-16 text-center border border-white/10 rounded-sm p-8 bg-[#0E1528] max-w-lg mx-auto">
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
            No Tournaments Created
          </h3>
          <p className="text-xs text-white/60 mt-1 mb-5">
            Host your first Free Fire tournament to start accepting player registrations.
          </p>
          <Link
            href="/admin/tournaments/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFB800] text-black font-display font-black text-xs uppercase tracking-wider rounded"
          >
            <Plus className="w-4 h-4" />
            Host First Tournament
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tournaments.map((t) => {
            const isFull = t.maxTeams ? t.registeredCount >= t.maxTeams : false;
            const percentage = t.maxTeams
              ? Math.min(100, Math.round((t.registeredCount / t.maxTeams) * 100))
              : 0;

            return (
              <div
                key={t.id}
                className="bg-[#0E1528] border border-[#1A233D] hover:border-[#FFB800]/50 rounded-sm p-5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6 group shadow-md"
              >
                {/* Info Column */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30 font-bold">
                      {t.gameName || "Free Fire Max"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/5 text-white/80 border border-white/10">
                      {t.format}
                    </span>
                    {getStatusBadge(t.status)}
                    <span className="text-xs font-mono text-[#FFB800] font-bold ml-auto sm:ml-0">
                      Prize: {t.prizePool}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-display font-black text-lg sm:text-xl text-white tracking-wide uppercase group-hover:text-[#FFB800] transition-colors">
                      {t.title}
                    </h2>
                    <p className="text-xs text-white/60 mt-0.5 line-clamp-1">
                      {t.shortDescription}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-white/50">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#FFB800]" />
                      {t.matchSchedule}
                    </span>
                    <span>•</span>
                    <span>
                      Public: <code className="text-white/80">/tournaments/{t.slug}</code>
                    </span>
                    {t.roomDetails && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Room Credentials Configured
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Slot Capacity Meter */}
                <div className="lg:w-48 flex-shrink-0 bg-[#141C33] p-3 rounded border border-white/10">
                  <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                    <span className="text-white/60 uppercase">Registrations</span>
                    <span className="font-bold text-white">
                      {t.registeredCount} / {t.maxTeams || "∞"}
                    </span>
                  </div>
                  {t.maxTeams && (
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isFull ? "bg-red-500" : "bg-[#FFB800]"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  )}
                  <div className="text-[10px] font-mono text-white/50 mt-1.5 flex justify-between">
                    <span>
                      {t.slotsRemaining !== null
                        ? `${t.slotsRemaining} slots left`
                        : "Open slots"}
                    </span>
                    {isFull && <span className="text-red-400 font-bold">FULL</span>}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 border-t lg:border-t-0 border-white/10 pt-4 lg:pt-0">
                  <Link
                    href={`/admin/tournaments/${t.id}/registrations`}
                    className="px-3.5 py-2 bg-[#FFB800]/20 hover:bg-[#FFB800] text-[#FFB800] hover:text-black border border-[#FFB800]/40 text-xs font-display font-bold uppercase tracking-wider rounded flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Teams ({t.registeredCount})</span>
                  </Link>

                  <Link
                    href={`/admin/tournaments/${t.id}/edit`}
                    className="p-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
                    title="Edit Tournament"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDuplicate(t.id, t.title)}
                    disabled={actionInProgress === `dup-${t.id}`}
                    className="p-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors disabled:opacity-50"
                    title="Duplicate Tournament"
                  >
                    {actionInProgress === `dup-${t.id}` ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#FFB800]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <Link
                    href={`/tournaments/${t.slug}`}
                    target="_blank"
                    className="p-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
                    title="View Public Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDelete(t.id, t.title)}
                    disabled={actionInProgress === `del-${t.id}`}
                    className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded transition-colors disabled:opacity-50"
                    title="Delete Tournament"
                  >
                    {actionInProgress === `del-${t.id}` ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
