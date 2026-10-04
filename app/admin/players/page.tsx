"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, UserPlus, Search, Edit3, Trash2, 
  ExternalLink, Loader2, AlertCircle, RefreshCw 
} from "lucide-react";
import { Player } from "@/lib/players";

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/players");
      if (res.status === 401) {
        window.location.href = `/admin/login?from=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      if (!res.ok) throw new Error("Failed to load roster players");
      const data = await res.json();
      setPlayers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load players");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleDelete = async (id: string, ign: string) => {
    if (!confirm(`Are you sure you want to remove player ${ign}?`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/players/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete player");
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete player");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPlayers = players.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.ign.toLowerCase().includes(q) ||
      (p.realName && p.realName.toLowerCase().includes(q)) ||
      p.role.toLowerCase().includes(q) ||
      p.uid.includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Actions matching Free Fire In-Game Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0E1528] p-4 sm:px-6 border border-[#1A233D] rounded-sm shadow">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[#FFB800] font-display font-black text-xl uppercase tracking-wider">
              MANAGE PLAYERS & ROSTER
            </span>
            <span className="px-2 py-0.5 bg-[#FFB800]/20 text-[#FFB800] rounded text-[11px] font-mono font-bold">
              {players.length} Players
            </span>
          </div>
          <p className="text-xs text-white/60 mt-0.5 font-sans">
            Manage Free Fire player details, UIDs, uploaded photos, and sensitivities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPlayers}
            title="Refresh"
            className="p-2 bg-[#16203B] hover:bg-[#1E2C52] text-white/80 hover:text-white rounded border border-white/15 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/team"
            target="_blank"
            className="px-3.5 py-2 rounded bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-display font-bold text-white/80 hover:text-white flex items-center gap-1.5 transition-colors uppercase tracking-wider"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>Public Roster</span>
          </Link>

          <Link
            href="/admin/players/new"
            className="px-4 py-2 bg-[#FFB800] hover:bg-[#FFA500] text-black font-display font-black text-xs uppercase tracking-wider rounded transition-transform active:scale-95 shadow flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>ADD NEW PLAYER</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0E1528] p-3 sm:px-6 border border-[#1A233D] rounded-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by IGN, Name, Role, or UID..."
            className="w-full bg-[#16203B] border border-white/20 rounded pl-9 pr-4 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FFB800] font-sans"
          />
        </div>

        <div className="text-xs font-mono text-white/60 self-start sm:self-center">
          Active Players: <span className="text-[#FFB800] font-bold">{players.length}</span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/40 border border-red-500/50 text-red-200 text-xs rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-white/60">
          <Loader2 className="w-8 h-8 text-[#FFB800] animate-spin" />
          <span className="font-mono text-xs uppercase tracking-wider">Loading Free Fire players...</span>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="py-16 text-center bg-[#0E1528] border border-white/10 rounded-sm p-8 max-w-md mx-auto">
          <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h3 className="font-display font-black text-lg text-white uppercase">No Players Found</h3>
          <p className="text-xs text-white/60 mt-1 mb-5">
            {search ? "No players match your search query." : "Add your first competitive player to the squad."}
          </p>
          <Link
            href="/admin/players/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFB800] text-black font-display font-black text-xs uppercase tracking-wider rounded"
          >
            <UserPlus className="w-4 h-4" />
            Add First Player
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="bg-[#0E1528] border border-[#1A233D] rounded-sm overflow-hidden flex flex-col justify-between group hover:border-[#FFB800]/50 transition-colors shadow-md"
            >
              {/* Card Header & Avatar */}
              <div className="p-4 flex items-center gap-3.5 border-b border-white/5 bg-[#121A30]">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#FFB800] shadow-sm bg-black flex-shrink-0">
                  <img
                    src={player.photoUrl || "/character/xayne.jpeg"}
                    alt={player.ign}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="font-display font-black text-base text-white uppercase tracking-wider truncate block">
                    {player.ign}
                  </span>
                  <span className="text-xs text-white/60 block truncate">
                    {player.realName || player.ign}
                  </span>
                  <div className="mt-1 inline-block px-2 py-0.5 rounded bg-[#FFB800]/15 text-[10px] font-display font-bold text-[#FFB800] uppercase tracking-wider">
                    {player.role}
                  </div>
                </div>
              </div>

              {/* Player Attributes & Sensitivity Box */}
              <div className="p-4 space-y-2.5 bg-[#0C1222] flex-1 text-xs font-mono">
                <div className="flex items-center justify-between text-white/70">
                  <span>FREE FIRE UID:</span>
                  <span className="text-white font-bold">{player.uid}</span>
                </div>

                <div className="flex items-center justify-between text-white/70">
                  <span>DEVICE:</span>
                  <span className="text-white/90">{player.device || "Mobile"}</span>
                </div>

                <div className="flex items-center justify-between text-white/70">
                  <span>LOCATION:</span>
                  <span className="text-white/90">{player.location || "India"}</span>
                </div>

                {/* Mini Sens Preview */}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-[11px] text-white/50 mb-1">
                    <span>SENSITIVITIES</span>
                    <span>{player.settings?.controlLayout || "4-finger"}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                    <div className="bg-white/5 p-1 rounded">
                      <span className="text-white/50 block">GEN</span>
                      <span className="text-[#FFB800] font-bold">{player.settings?.generalSens ?? "-"}</span>
                    </div>
                    <div className="bg-white/5 p-1 rounded">
                      <span className="text-white/50 block">RED</span>
                      <span className="text-[#FFB800] font-bold">{player.settings?.redDotSens ?? "-"}</span>
                    </div>
                    <div className="bg-white/5 p-1 rounded">
                      <span className="text-white/50 block">2X</span>
                      <span className="text-[#FFB800] font-bold">{player.settings?.scope2xSens ?? "-"}</span>
                    </div>
                    <div className="bg-white/5 p-1 rounded">
                      <span className="text-white/50 block">4X</span>
                      <span className="text-[#FFB800] font-bold">{player.settings?.scope4xSens ?? "-"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-[#0A0E1A] border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-white/40">
                  ID: {player.id}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/players/${player.id}/edit`}
                    className="px-3 py-1.5 rounded bg-white/5 hover:bg-[#FFB800] text-white hover:text-black border border-white/15 text-xs font-display font-bold uppercase flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <button
                    onClick={() => handleDelete(player.id, player.ign)}
                    disabled={deletingId === player.id}
                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    title="Delete player"
                  >
                    {deletingId === player.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
