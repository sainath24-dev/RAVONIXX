"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Download,
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Loader2,
  Trophy,
  ExternalLink,
  Eye,
  Save,
  X,
} from "lucide-react";
import { TournamentRegistration } from "@/lib/tournaments/types";

export default function TournamentRegistrationsPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 50,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("regNo");
  const [sortDir, setSortDir] = useState("asc");

  const [selectedReg, setSelectedReg] = useState<TournamentRegistration | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const q = new URLSearchParams({
        search,
        status: statusFilter,
        sortBy,
        sortDir,
        page: String(pagination.currentPage),
        limit: String(pagination.limit),
      });

      const res = await fetch(`/api/admin/tournaments/${id}/registrations?${q.toString()}`);
      if (res.status === 401) {
        window.location.href = `/admin/login?from=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load registrations");

      setTournament(data.tournament);
      setStats(data.stats);
      setRegistrations(data.registrations);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchRegistrations();
  }, [id, search, statusFilter, sortBy, sortDir, pagination.currentPage]);

  const handleStatusChange = async (regId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/tournaments/${id}/registrations/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      setRegistrations((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, status: newStatus as any } : r))
      );
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleRankChange = async (regId: string, rank: string) => {
    try {
      const res = await fetch(`/api/admin/tournaments/${id}/registrations/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminRank: rank }),
      });
      if (!res.ok) throw new Error("Failed to update rank");

      setRegistrations((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, adminRank: rank } : r))
      );
    } catch (err: any) {
      alert(`Error updating rank: ${err.message}`);
    }
  };

  const handleDelete = async (regId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to remove team "${teamName}" from this tournament?`))
      return;

    try {
      const res = await fetch(`/api/admin/tournaments/${id}/registrations/${regId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete registration");

      await fetchRegistrations();
    } catch (err: any) {
      alert(`Error deleting registration: ${err.message}`);
    }
  };

  const openEditModal = (reg: TournamentRegistration) => {
    setSelectedReg(reg);
    let initialPlayers = reg.players
      ? reg.players.map((p) => ({ name: p.name, uid: p.uid }))
      : [];
    if (initialPlayers.length === 0) {
      initialPlayers = [
        { name: "", uid: "" },
        { name: "", uid: "" },
        { name: "", uid: "" },
      ];
    }
    setEditFormData({
      teamName: reg.teamName,
      status: reg.status,
      adminRank: reg.adminRank || "",
      adminNotes: reg.adminNotes || "",
      captainName: reg.captain.name,
      captainIgn: reg.captain.ign,
      captainUid: reg.captain.uid,
      players: initialPlayers,
      substitute: reg.substitute
        ? { name: reg.substitute.name, uid: reg.substitute.uid }
        : { name: "", uid: "" },
      phone: reg.contact.phone,
      email: reg.contact.email,
    });
    setIsEditModalOpen(true);
  };

  const saveEditModal = async () => {
    if (!selectedReg || !editFormData) return;
    try {
      setIsSaving(true);
      const payload = {
        teamName: editFormData.teamName,
        status: editFormData.status,
        adminRank: editFormData.adminRank || undefined,
        adminNotes: editFormData.adminNotes || undefined,
        captain: {
          ...selectedReg.captain,
          name: editFormData.captainName,
          ign: editFormData.captainIgn,
          uid: editFormData.captainUid,
        },
        players: editFormData.players
          ? editFormData.players.filter((p: any) => p.name.trim() || p.uid.trim())
          : [],
        substitute:
          editFormData.substitute && editFormData.substitute.name.trim()
            ? {
                name: editFormData.substitute.name.trim(),
                uid: editFormData.substitute.uid.trim(),
              }
            : undefined,
        contact: {
          phone: editFormData.phone,
          email: editFormData.email,
        },
      };

      const res = await fetch(
        `/api/admin/tournaments/${id}/registrations/${selectedReg.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update registration");

      setIsEditModalOpen(false);
      await fetchRegistrations();
    } catch (err: any) {
      alert(`Error saving team: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <Link
            href="/admin/tournaments"
            className="text-xs font-mono text-text-muted hover:text-white flex items-center gap-1.5 transition-colors uppercase tracking-wider mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Tournaments
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-wider text-white uppercase">
              {tournament?.title || "Tournament"} Registrations
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/20 text-primary border border-primary/30 uppercase">
              {tournament?.gameName} • {tournament?.format}
            </span>
          </div>
        </div>

        {/* ONE-CLICK EXPORT BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/admin/tournaments/${id}/export?format=xlsx`}
            download
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-display font-black uppercase tracking-wider rounded flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Download Excel (.xlsx)
          </a>

          <a
            href={`/api/admin/tournaments/${id}/export?format=csv`}
            download
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-display font-black uppercase tracking-wider rounded flex items-center gap-2 transition-all border border-white/10"
          >
            <FileText className="w-4 h-4" />
            Export CSV (UTF-8)
          </a>
        </div>
      </div>

      {/* Live Counter & Statistics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#10121A] border border-hairline p-4 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-text-muted tracking-wider block">
              Total Teams Registered
            </span>
            <span className="font-display font-black text-2xl text-white">
              {stats?.totalRegistered || 0}
            </span>
          </div>
          <div className="w-10 h-10 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#10121A] border border-hairline p-4 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-text-muted tracking-wider block">
              Tournament Slot Limit
            </span>
            <span className="font-display font-black text-2xl text-white">
              {stats?.maxSlots ? `${stats.maxSlots} Teams` : "Unlimited Slots"}
            </span>
          </div>
          <div className="w-10 h-10 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#10121A] border border-hairline p-4 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-text-muted tracking-wider block">
              Remaining Open Slots
            </span>
            <span
              className={`font-display font-black text-2xl ${
                stats?.slotsRemaining === 0 ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {stats?.slotsRemaining !== null
                ? `${stats?.slotsRemaining} Available`
                : "Open"}
            </span>
          </div>
          <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#10121A] border border-hairline p-4 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team, captain, IGN, UID, phone..."
            className="w-full bg-[#161922] border border-white/10 rounded px-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-primary pl-9 font-body"
          />
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#161922] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#161922] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            >
              <option value="regNo">Reg No.</option>
              <option value="teamName">Team Name</option>
              <option value="date">Registered Date</option>
            </select>
            <button
              onClick={() => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))}
              className="px-2 py-1 bg-[#161922] border border-white/10 rounded text-xs text-white hover:border-primary"
            >
              {sortDir.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {/* Registrations Data Table */}
      <div className="bg-[#10121A] border border-hairline rounded-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-text-muted">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <span className="font-mono text-xs uppercase tracking-wider">
              Loading Team Records...
            </span>
          </div>
        ) : registrations.length === 0 ? (
          <div className="py-16 text-center text-text-muted text-xs font-mono">
            No registrations found matching the current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white font-mono">
              <thead className="bg-[#161922] text-text-muted uppercase tracking-wider text-[11px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Reg No.</th>
                  <th className="py-3 px-4">Team Name</th>
                  <th className="py-3 px-4">Captain (Name / IGN / UID)</th>
                  <th className="py-3 px-4">Roster (Active / Sub)</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Reg No */}
                    <td className="py-3.5 px-4 font-bold text-primary">
                      #{reg.registrationNumber}
                    </td>

                    {/* Team Name */}
                    <td className="py-3.5 px-4 font-display font-black text-sm text-white tracking-wide">
                      {reg.teamName}
                    </td>

                    {/* Captain */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{reg.captain.name}</div>
                      <div className="text-[11px] text-primary">
                        IGN: {reg.captain.ign}
                      </div>
                      <div className="text-[10px] text-text-dim">
                        UID: <span className="text-white/80">{reg.captain.uid}</span>
                      </div>
                    </td>

                    {/* Players / Roster */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-white text-xs mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{reg.players.length + 1} Squad Members</span>
                      </div>
                      <div className="flex flex-wrap gap-1 max-w-xs text-[10px]">
                        <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded font-medium">
                          P1: {reg.captain.ign || reg.captain.name}
                        </span>
                        {reg.players.map((p, pIdx) => (
                          <span
                            key={pIdx}
                            className={`px-1.5 py-0.5 rounded border ${
                              pIdx === 2
                                ? "bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/40 font-bold"
                                : "bg-white/5 text-white/80 border-white/10"
                            }`}
                            title={`UID: ${p.uid}`}
                          >
                            P{pIdx + 2}: {p.name}
                          </span>
                        ))}
                        {reg.substitute?.name && (
                          <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded">
                            Sub: {reg.substitute.name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-white/90">
                        <Phone className="w-3 h-3 text-text-muted" />
                        {reg.contact.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-text-dim">
                        <Mail className="w-3 h-3 text-text-muted" />
                        {reg.contact.email}
                      </div>
                    </td>

                    {/* Rank (Admin-Only) */}
                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        defaultValue={reg.adminRank || ""}
                        onBlur={(e) => handleRankChange(reg.id, e.target.value)}
                        placeholder="e.g. #1, Top 4"
                        className="w-24 bg-[#161922] border border-white/10 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-primary"
                      />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <select
                        value={reg.status}
                        onChange={(e) => handleStatusChange(reg.id, e.target.value)}
                        className={`text-[11px] font-mono rounded px-2 py-1 border focus:outline-none ${
                          reg.status === "Approved"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : reg.status === "Rejected"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(reg)}
                          className="p-1.5 text-text-muted hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
                          title="View / Edit Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(reg.id, reg.teamName)}
                          className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors"
                          title="Delete Registration"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / View Modal */}
      {isEditModalOpen && selectedReg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10121A] border border-hairline w-full max-w-2xl rounded-sm p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-display font-black text-xl text-white uppercase tracking-wider">
                  TEAM DOSSIER: {selectedReg.teamName}
                </h3>
                <p className="text-xs font-mono text-primary">
                  Official Registration #{selectedReg.registrationNumber}
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.teamName}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, teamName: e.target.value })
                    }
                    className="w-full bg-[#161922] border border-white/10 rounded px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1">
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, status: e.target.value })
                    }
                    className="w-full bg-[#161922] border border-white/10 rounded px-3 py-2 text-xs text-white"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Captain Details */}
              <div className="bg-[#161922] p-4 rounded border border-white/5 space-y-3">
                <span className="text-xs font-mono text-primary font-bold uppercase tracking-wider block">
                  👑 Captain Information
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-text-muted mb-1">
                      Captain Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.captainName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          captainName: e.target.value,
                        })
                      }
                      className="w-full bg-[#10121A] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-text-muted mb-1">
                      Captain IGN
                    </label>
                    <input
                      type="text"
                      value={editFormData.captainIgn}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          captainIgn: e.target.value,
                        })
                      }
                      className="w-full bg-[#10121A] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-text-muted mb-1">
                      Captain UID
                    </label>
                    <input
                      type="text"
                      value={editFormData.captainUid}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          captainUid: e.target.value,
                        })
                      }
                      className="w-full bg-[#10121A] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Squad Players View & Edit */}
              <div className="bg-[#161922] p-4 rounded border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-mono text-white font-bold uppercase tracking-wider block">
                    👥 Active Squad Members (Player 2, Player 3, Player 4)
                  </span>
                  <span className="text-[10px] font-mono text-[#FFB800]">
                    Captain is Player 1 (Slot 1)
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {editFormData.players && editFormData.players.map((p: any, idx: number) => {
                    const slotNum = idx + 2;
                    const isPlayer4 = slotNum === 4;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded border transition-colors ${
                          isPlayer4
                            ? "bg-[#10121A] border-[#FFB800]/40 shadow-[0_0_10px_rgba(255,184,0,0.1)]"
                            : "bg-[#10121A] border-white/5"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold flex items-center gap-1.5">
                            <span className={isPlayer4 ? "text-[#FFB800]" : "text-white"}>
                              Player {slotNum} (Slot {slotNum})
                            </span>
                            {isPlayer4 && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-[#FFB800]/20 text-[#FFB800] rounded uppercase font-bold">
                                4th Squad Slot
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-text-dim">
                            Active Member
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-text-muted mb-1">
                              Player {slotNum} Name / IGN
                            </label>
                            <input
                              type="text"
                              value={p.name}
                              onChange={(e) => {
                                const updated = [...editFormData.players];
                                updated[idx].name = e.target.value;
                                setEditFormData({ ...editFormData, players: updated });
                              }}
                              placeholder={`Player ${slotNum} Name`}
                              className="w-full bg-[#161922] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-text-muted mb-1">
                              Player {slotNum} Free Fire UID
                            </label>
                            <input
                              type="text"
                              value={p.uid}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, "");
                                const updated = [...editFormData.players];
                                updated[idx].uid = digits;
                                setEditFormData({ ...editFormData, players: updated });
                              }}
                              placeholder="Free Fire UID"
                              className="w-full bg-[#161922] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Substitute Player */}
                <div className="p-3 bg-[#10121A] rounded border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-400">
                      Player {editFormData.players ? editFormData.players.length + 2 : 5} (Optional Substitute / Reserve)
                    </span>
                    <span className="text-[10px] text-text-dim">Reserve Slot</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-text-muted mb-1">
                        Substitute Name / IGN
                      </label>
                      <input
                        type="text"
                        value={editFormData.substitute?.name || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            substitute: {
                              ...editFormData.substitute,
                              name: e.target.value,
                            },
                          })
                        }
                        placeholder="Optional Substitute Name"
                        className="w-full bg-[#161922] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-text-muted mb-1">
                        Substitute UID (Digits Only)
                      </label>
                      <input
                        type="text"
                        value={editFormData.substitute?.uid || ""}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          setEditFormData({
                            ...editFormData,
                            substitute: {
                              ...editFormData.substitute,
                              uid: digits,
                            },
                          });
                        }}
                        placeholder="Optional Substitute UID"
                        className="w-full bg-[#161922] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, phone: e.target.value })
                    }
                    className="w-full bg-[#161922] border border-white/10 rounded px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, email: e.target.value })
                    }
                    className="w-full bg-[#161922] border border-white/10 rounded px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Admin Rank & Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1">
                    Tournament Placement / Rank (Admin Only)
                  </label>
                  <input
                    type="text"
                    value={editFormData.adminRank}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, adminRank: e.target.value })
                    }
                    placeholder="e.g. #1 Champions, 2nd Place"
                    className="w-full bg-[#161922] border border-white/10 rounded px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1">
                    Internal Admin Notes
                  </label>
                  <input
                    type="text"
                    value={editFormData.adminNotes}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, adminNotes: e.target.value })
                    }
                    placeholder="e.g. Verified payment / Discord ID confirmed"
                    className="w-full bg-[#161922] border border-white/10 rounded px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-mono uppercase tracking-wider rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditModal}
                disabled={isSaving}
                className="px-5 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-display font-black uppercase tracking-wider rounded flex items-center gap-1.5"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
