"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Calendar,
  AlertCircle,
  Loader2,
  Check,
  ArrowLeft,
  Settings,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { Tournament, TournamentUpsertInput } from "@/lib/tournaments/types";
import FreeFireTrophyBadge from "@/components/tournaments/FreeFireTrophyBadge";

interface Props {
  initialData?: Tournament;
  isEdit?: boolean;
}

export default function TournamentEditorForm({ initialData, isEdit = false }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<TournamentUpsertInput>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    bannerUrl: initialData?.bannerUrl || "",
    gameName: initialData?.gameName || "Free Fire Max",
    shortDescription: initialData?.shortDescription || "Official Free Fire Max Championship match.",
    fullDetails: initialData?.fullDetails || "Official Free Fire Tournament. Join WhatsApp lobby for room credentials.",
    rules: initialData?.rules || "1. Handheld phones only (No PC/Emulators).\n2. Level 45+ required.\n3. Screen recording required.\n4. Admin decisions final.",
    prizePool: initialData?.prizePool || "₹50,000 + 5,000 💎 Diamonds",
    prizeCash: initialData?.prizeCash || "₹50,000",
    prizeDiamonds: initialData?.prizeDiamonds || "5,000 Diamonds",
    entryFee: initialData?.entryFee || "Free",
    format: initialData?.format || "Squad",
    eventMode: initialData?.eventMode || "Online",
    matchSchedule: initialData?.matchSchedule || "Nov 1, 2026 • 7:00 PM IST",
    registrationOpenDate: initialData?.registrationOpenDate
      ? new Date(initialData.registrationOpenDate).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    registrationCloseDate: initialData?.registrationCloseDate
      ? new Date(initialData.registrationCloseDate).toISOString().slice(0, 16)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    maxTeams: initialData?.maxTeams || 48,
    status: initialData?.status || "Registration Open",
    whatsappGroupUrl: initialData?.whatsappGroupUrl || "https://chat.whatsapp.com/invite/ravonixx-esports",
    gameCount: initialData?.gameCount || 4,
    currentStage: initialData?.currentStage || "SIGN-UP",
    roomDetails: initialData?.roomDetails || "",
    isRoomDetailsVisible: initialData?.isRoomDetailsVisible || false,
  });

  // Prize Pool Builder State
  const initialPrizeType = initialData?.prizeDiamonds && !initialData?.prizeCash 
    ? "diamonds" 
    : initialData?.prizeCash && !initialData?.prizeDiamonds 
    ? "cash" 
    : "both";
  const [prizeType, setPrizeType] = useState<"both" | "cash" | "diamonds">(initialPrizeType);
  const [cashAmount, setCashAmount] = useState(initialData?.prizeCash || "₹50,000");
  const [diamondAmount, setDiamondAmount] = useState(initialData?.prizeDiamonds || "5,000 Diamonds");

  const updateCombinedPrize = (type: "both" | "cash" | "diamonds", cash: string, dia: string) => {
    let combined = "";
    if (type === "both") {
      combined = `${cash || "₹50,000"} + ${dia || "5,000"} Diamonds`;
    } else if (type === "diamonds") {
      combined = `${dia || "5,000"} Diamonds`;
    } else {
      combined = cash || "₹50,000 INR";
    }
    setFormData((prev) => ({
      ...prev,
      prizePool: combined,
      prizeCash: cash,
      prizeDiamonds: dia,
    }));
  };

  const handlePrizeTypeChange = (type: "both" | "cash" | "diamonds") => {
    setPrizeType(type);
    updateCombinedPrize(type, cashAmount, diamondAmount);
  };

  const handleCashChange = (val: string) => {
    setCashAmount(val);
    updateCombinedPrize(prizeType, val, diamondAmount);
  };

  const handleDiamondsChange = (val: string) => {
    setDiamondAmount(val);
    updateCombinedPrize(prizeType, cashAmount, val);
  };

  // Gameplay Settings Toggles matching reference image WhatsApp Image 2026-10-04 at 10.29.36 (2).jpeg
  const [gameplaySettings, setGameplaySettings] = useState({
    ammoLimit: false,
    throwableLimit: false,
    characterSkill: true,
    gunAttributes: true,
    blockEmulators: true,
    fullTeamMode: true,
    minLevel: 45,
    startMode: "Auto Start",
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      const next = { ...prev, title: val };
      if (!isEdit && (!prev.slug || prev.slug === generateSlug(prev.title))) {
        next.slug = generateSlug(val);
      }
      return next;
    });
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Real Image File Upload via /api/admin/upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError(null);

      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      setFormData((prev) => ({ ...prev, bannerUrl: data.url }));
    } catch (err: any) {
      setError(err.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = isEdit
        ? `/api/admin/tournaments/${initialData?.id}`
        : "/api/admin/tournaments";
      const method = isEdit ? "PUT" : "POST";

      const numTeams = formData.maxTeams ? Number(formData.maxTeams) : null;
      const numGameCount = formData.gameCount ? Number(formData.gameCount) : 4;
      const cleanSlug = (formData.slug || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "") || `tourney-${Date.now().toString(36)}`;

      const payload = {
        ...formData,
        slug: cleanSlug,
        maxTeams: numTeams && !isNaN(numTeams) && numTeams > 0 ? numTeams : null,
        gameCount: numGameCount && !isNaN(numGameCount) && numGameCount > 0 ? numGameCount : 4,
        registrationOpenDate: new Date(formData.registrationOpenDate).toISOString(),
        registrationCloseDate: new Date(formData.registrationCloseDate).toISOString(),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          const detailMsgs = Object.entries(data.details)
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
            .join(" | ");
          throw new Error(detailMsgs || data.error || "Validation error");
        }
        throw new Error(data.error || "Failed to save tournament");
      }

      router.push("/admin/tournaments");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save tournament");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full font-sans select-none pb-16">
      {/* Top Free Fire In-Game Navigation Bar matching WhatsApp Image 2026-10-04 at 10.29.36 (2).jpeg */}
      <div className="flex items-center justify-between bg-[#0B0E1B] border-b border-[#1A233D] px-4 sm:px-6 py-2 rounded-t-sm shadow">
        <div className="flex items-center gap-2">
          {/* Slanted Golden SHOWMATCH button */}
          <div
            className="px-5 py-2 bg-[#FFB800] text-black font-display font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_2px_10px_rgba(255,184,0,0.3)]"
            style={{ clipPath: "polygon(0 0, 100% 0, 92% 100%, 0 100%)" }}
          >
            SHOWMATCH
          </div>

          <div className="px-4 py-2 bg-[#121829] text-white/80 font-display font-bold text-xs sm:text-sm tracking-wider uppercase">
            ESPORTS CENTER
          </div>
        </div>

        <Link
          href="/admin/tournaments"
          className="text-white/70 hover:text-white p-2 rounded hover:bg-white/5 transition-colors"
          title="Back to Tournaments"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Breadcrumb row: PRIVATE TOURNAMENT | TOURNAMENT */}
      <div className="bg-[#0E1528] px-6 py-2 border-x border-[#1A233D] flex items-center justify-between text-xs font-display font-bold text-white/70">
        <div className="flex items-center gap-2">
          <span className="text-[#FFB800]">PRIVATE TOURNAMENT</span>
          <span>|</span>
          <span>{isEdit ? "EDIT TOURNAMENT" : "HOST NEW TOURNAMENT"}</span>
        </div>
        <span className="text-white/40 font-mono text-[11px]">Free Fire Esports Protocol</span>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-900/40 border border-red-500/50 text-red-200 text-xs rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Body: Left BASIC INFO + Right GAMEPLAY SETTINGS & RULES */}
      <div 
        className="p-5 sm:p-8 border-x border-b border-[#1A233D] grid grid-cols-1 lg:grid-cols-12 gap-8 text-white"
        style={{
          backgroundImage: `linear-gradient(135deg, #0C1224 0%, #111A33 50%, #0A0F1E 100%)`,
        }}
      >
        {/* ================= LEFT COLUMN: BASIC INFO ================= */}
        <div className="lg:col-span-6 space-y-5">
          <div className="flex items-center gap-2 text-[#FFB800] font-display font-black text-sm uppercase tracking-wider">
            <span className="w-1.5 h-4 bg-[#FFB800]" />
            <span>BASIC INFO</span>
          </div>

          {/* Tournament Name */}
          <div>
            <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5">
              Tournament Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. SAINATH 👑's Tour"
              className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFB800] font-display font-bold"
            />
          </div>

          {/* URL Slug */}
          <div>
            <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5">
              Tournament URL Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
              placeholder="e.g. sainath-tour-s1"
              className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FFB800]"
            />
            <span className="text-[10px] text-white/40 font-mono mt-1 block">
              Direct Link: /tournaments/{formData.slug || "[slug]"}
            </span>
          </div>

          {/* Tournament Icon / Banner Upload (Real File Upload + Presets) */}
          <div>
            <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5">
              Tournament Icon / Banner
            </label>
            <div className="flex items-center gap-4 bg-[#16203B] p-3 rounded border border-white/15">
              {/* Preview */}
              <div className="w-16 h-16 rounded overflow-hidden bg-black/40 border border-white/20 flex items-center justify-center flex-shrink-0">
                {formData.bannerUrl ? (
                  <img
                    src={formData.bannerUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FreeFireTrophyBadge className="w-12 h-12" />
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1 space-y-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="px-4 py-1.5 bg-[#FFB800] hover:bg-[#FFA500] text-black font-display font-bold text-xs uppercase tracking-wider rounded shadow flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{uploadingImage ? "Uploading..." : "Upload Tournament Image"}</span>
                </button>
                <p className="text-[10px] text-white/50 font-mono">
                  Upload custom PNG/JPG banner or pick preset below
                </p>
              </div>
            </div>

            {/* Quick Map Banner Presets */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] font-mono text-white/50 uppercase">Presets:</span>
              {[
                { name: "Bermuda", url: "/images/maps/Free_Fire_Map_Bermuda_2023.png" },
                { name: "Purgatory", url: "/images/maps/Map_FF_Purgatory_allmode.jpeg" },
                { name: "Kalahari", url: "/images/maps/Map_FF_Kalahari_allmode.jpeg" },
                { name: "Alpine", url: "/images/maps/Map_FF_Alpine_allmode.jpeg" },
              ].map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => setFormData({ ...formData, bannerUrl: p.url })}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-white/80"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Game Mode, Team Format & Tournament Mode (LAN / Online / Hybrid / Watch Party) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5">
                Game Mode
              </label>
              <input
                type="text"
                disabled
                value="Battle Royale"
                className="w-full bg-[#121A30] border border-white/15 rounded px-3 py-2 text-xs text-white/70 font-display font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5">
                Team Format
              </label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFB800] font-display font-bold"
              >
                <option value="Squad">Squad (4 Active + 1 Sub)</option>
                <option value="Duo">Duo (2 Active + 1 Sub)</option>
                <option value="Solo">Solo (1 Player)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5 flex items-center justify-between">
                <span>Tournament Mode</span>
                <span className="text-[10px] text-[#FFB800] font-mono font-normal">Event Type</span>
              </label>
              <select
                value={formData.eventMode || "Online"}
                onChange={(e) => setFormData({ ...formData, eventMode: e.target.value as any })}
                className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFB800] font-display font-bold"
              >
                <option value="Online">🌐 Online (Remote Match)</option>
                <option value="LAN">🏢 LAN (On-Site Arena)</option>
                <option value="Hybrid">⚡ Hybrid (LAN + Online)</option>
                <option value="Watch Party">📺 Watch Party (Community)</option>
              </select>
            </div>
          </div>

          {/* Full Team Mode Toggle */}
          <div className="flex items-center justify-between p-2.5 bg-[#16203B] rounded border border-white/15">
            <span className="text-xs font-display font-bold uppercase tracking-wider text-white/90">
              Full Team Mode
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setGameplaySettings((p) => ({ ...p, fullTeamMode: true }))}
                className={`px-3 py-1 text-xs font-mono font-bold rounded ${
                  gameplaySettings.fullTeamMode ? "bg-[#FFB800] text-black" : "bg-black/30 text-white/60"
                }`}
              >
                YES
              </button>
              <button
                type="button"
                onClick={() => setGameplaySettings((p) => ({ ...p, fullTeamMode: false }))}
                className={`px-3 py-1 text-xs font-mono font-bold rounded ${
                  !gameplaySettings.fullTeamMode ? "bg-[#FFB800] text-black" : "bg-black/30 text-white/60"
                }`}
              >
                NO
              </button>
            </div>
          </div>

          {/* Sign-up Deadline */}
          <div>
            <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5">
              Sign-up Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.registrationCloseDate}
              onChange={(e) => setFormData({ ...formData, registrationCloseDate: e.target.value })}
              className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FFB800]"
            />
          </div>

          {/* Max Number of Teams & Games Count */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5">
                Max Number of Teams
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={formData.maxTeams || 48}
                onChange={(e) => setFormData({ ...formData, maxTeams: parseInt(e.target.value, 10) || 48 })}
                className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FFB800]"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5">
                Total Games
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.gameCount || 4}
                onChange={(e) => setFormData({ ...formData, gameCount: parseInt(e.target.value, 10) || 4 })}
                className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FFB800]"
              />
            </div>
          </div>

          {/* Roadmap Stage */}
          <div>
            <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5">
              Tournament Stage (Roadmap Position)
            </label>
            <select
              value={formData.currentStage || "SIGN-UP"}
              onChange={(e) => setFormData({ ...formData, currentStage: e.target.value as any })}
              className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs font-display font-bold text-white focus:outline-none focus:border-[#FFB800]"
            >
              <option value="SIGN-UP">SIGN-UP (Teams Registering)</option>
              <option value="CHECK-IN">CHECK-IN (Captain Confirmation)</option>
              <option value="GROUPING">GROUPING (Brackets & Groups Assigned)</option>
              <option value="IN PROGRESS">IN PROGRESS (Matches Underway)</option>
              <option value="ENDED">ENDED (Champions Crowned)</option>
            </select>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: LOBBY, RULES & GAMEPLAY SETTINGS ================= */}
        <div className="lg:col-span-6 space-y-5">
          {/* WhatsApp Lobby & QR Link */}
          <div>
            <div className="flex items-center gap-2 text-[#FFB800] font-display font-black text-sm uppercase tracking-wider mb-2">
              <span className="w-1.5 h-4 bg-[#FFB800]" />
              <span>OFFICIAL WHATSAPP LOBBY LINK (QR CODE)</span>
            </div>
            <input
              type="text"
              value={formData.whatsappGroupUrl || ""}
              onChange={(e) => setFormData({ ...formData, whatsappGroupUrl: e.target.value })}
              placeholder="https://chat.whatsapp.com/invite/..."
              className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FFB800]"
            />
            <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
              ✓ Generates the Free Fire in-game QR code invitation card
            </span>
          </div>

          {/* Match Schedule / Timing */}
          <div>
            <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5">
              Match Schedule Timing <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.matchSchedule}
              onChange={(e) => setFormData({ ...formData, matchSchedule: e.target.value })}
              placeholder="e.g. Nov 1, 2026 • 7:00 PM IST"
              className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFB800] font-display font-bold"
            />
          </div>

          {/* Prize Pool Builder with Cash & Free Fire Diamonds */}
          <div className="bg-[#121B33] p-4 rounded-sm border border-[#1A233D] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-display font-black uppercase tracking-wider text-[#FFB800]">
                <span>🏆</span>
                <span>TOURNAMENT PRIZE POOL REWARDS</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                💎 DIAMONDS + 💰 MONEY
              </span>
            </div>

            {/* Prize Type Selector Tabs */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "both", label: "💰 Money + 💎 Diamonds" },
                { type: "cash", label: "💰 Money Only" },
                { type: "diamonds", label: "💎 Diamonds Only" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.type}
                  onClick={() => handlePrizeTypeChange(opt.type as any)}
                  className={`py-1.5 px-2 text-[11px] font-display font-bold uppercase tracking-wider rounded-sm border transition-all ${
                    prizeType === opt.type
                      ? "bg-[#FFB800] text-black border-[#FFB800] font-black shadow-[0_0_10px_rgba(255,184,0,0.3)]"
                      : "bg-[#16203B] text-white/70 border-white/10 hover:border-white/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Cash & Diamonds Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(prizeType === "both" || prizeType === "cash") && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-amber-300">
                    💰 Cash Reward Amount
                  </label>
                  <input
                    type="text"
                    value={cashAmount}
                    onChange={(e) => handleCashChange(e.target.value)}
                    placeholder="e.g. ₹50,000 INR"
                    className="w-full bg-[#16203B] border border-amber-500/30 rounded px-3 py-2 text-xs text-amber-200 focus:outline-none focus:border-amber-400 font-bold"
                  />
                  <div className="flex flex-wrap gap-1">
                    {["₹5,000", "₹10,000", "₹25,000", "₹50,000", "₹1,00,000"].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => handleCashChange(preset)}
                        className="px-1.5 py-0.5 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 rounded text-[9px] font-mono text-amber-200 transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(prizeType === "both" || prizeType === "diamonds") && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-cyan-400">
                    💎 Free Fire Diamonds Reward
                  </label>
                  <input
                    type="text"
                    value={diamondAmount}
                    onChange={(e) => handleDiamondsChange(e.target.value)}
                    placeholder="e.g. 5,000 Diamonds"
                    className="w-full bg-[#16203B] border border-cyan-500/30 rounded px-3 py-2 text-xs text-cyan-200 focus:outline-none focus:border-cyan-400 font-bold"
                  />
                  <div className="flex flex-wrap gap-1">
                    {["1,000 💎", "2,500 💎", "5,000 💎", "10,000 💎", "25,000 💎"].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => handleDiamondsChange(preset)}
                        className="px-1.5 py-0.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 rounded text-[9px] font-mono text-cyan-200 transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Combined Final Prize Pool Text & Entry Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div>
                <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-white/80 mb-1">
                  Combined Display Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.prizePool}
                  onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                  placeholder="e.g. ₹50,000 + 5,000 💎 Diamonds"
                  className="w-full bg-[#16203B] border border-[#FFB800]/50 rounded px-3 py-2 text-xs text-[#FFB800] focus:outline-none font-black uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-display font-bold uppercase tracking-wider text-white/80 mb-1">
                  Entry Fee
                </label>
                <input
                  type="text"
                  value={formData.entryFee || "Free"}
                  onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                  placeholder="Free / ₹50 Per Slot"
                  className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFB800]"
                />
              </div>
            </div>
          </div>

          {/* Tournament Rules */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-display font-bold uppercase tracking-wider text-white/80">
                Official Rules
              </label>
              <button
                type="button"
                onClick={() => {
                  setFormData((p) => ({
                    ...p,
                    rules:
                      "1. Device Policy: Smartphones only (Android/iOS). Emulators, PC, and iPads strictly banned.\n2. Player Level: Minimum account level 45 with Heroic rank.\n3. Fair Play: No hacks, bugs, or third-party crosshairs. Screen record POV.\n4. Punctuality: Join assigned room slot 10 minutes prior.\n5. Points: Booyah = 12 Pts, 2nd = 9 Pts, 3rd = 8 Pts, 1 Kill = 1 Pt.",
                  }));
                }}
                className="text-[10px] text-[#FFB800] hover:underline font-mono"
              >
                Load Standard Rules
              </button>
            </div>
            <textarea
              rows={4}
              required
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFB800] font-mono"
            />
          </div>

          {/* Room ID & Pass Credentials */}
          <div>
            <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5">
              Room ID & Password (Admin Note)
            </label>
            <input
              type="text"
              value={formData.roomDetails || ""}
              onChange={(e) => setFormData({ ...formData, roomDetails: e.target.value })}
              placeholder="e.g. Room: 7182910 | Pass: RVX2026"
              className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FFB800]"
            />
            <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs text-white/80 font-display font-bold">
              <input
                type="checkbox"
                checked={formData.isRoomDetailsVisible}
                onChange={(e) => setFormData({ ...formData, isRoomDetailsVisible: e.target.checked })}
                className="rounded text-[#FFB800] focus:ring-[#FFB800]"
              />
              <span>Publish Room Credentials on Public Tournament Page</span>
            </label>
          </div>

          {/* GAMEPLAY SETTINGS TOGGLES matching WhatsApp Image 2026-10-04 at 10.29.36 (2).jpeg */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs font-display font-black text-[#FFB800] uppercase tracking-wider">
              <span>GAMEPLAY SETTINGS</span>
            </div>

            {[
              { key: "ammoLimit", label: "Ammo Limit" },
              { key: "throwableLimit", label: "Throwable Limit" },
              { key: "characterSkill", label: "Character Skill" },
              { key: "gunAttributes", label: "Gun Attributes" },
              { key: "blockEmulators", label: "Block Emulators" },
            ].map(({ key, label }) => {
              const val = (gameplaySettings as any)[key];
              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 bg-[#121A30] rounded border border-white/10 text-xs font-display font-bold"
                >
                  <span className="text-white/80">{label}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setGameplaySettings((p) => ({ ...p, [key]: false }))}
                      className={`px-3 py-0.5 rounded text-[11px] font-mono font-bold ${
                        !val ? "bg-[#FFB800] text-black" : "bg-black/30 text-white/50"
                      }`}
                    >
                      NO
                    </button>
                    <button
                      type="button"
                      onClick={() => setGameplaySettings((p) => ({ ...p, [key]: true }))}
                      className={`px-3 py-0.5 rounded text-[11px] font-mono font-bold ${
                        val ? "bg-[#FFB800] text-black" : "bg-black/30 text-white/50"
                      }`}
                    >
                      YES
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Bar matching WhatsApp Image 2026-10-04 at 10.29.36 (2).jpeg */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0E1528] px-6 py-4 border-x border-b border-[#1A233D] rounded-b-sm">
        {/* Yellow Notice Text on Left */}
        <span className="text-xs font-display font-bold text-[#FFB800]">
          ⚠ Match will start 3 mins after sign-up closes
        </span>

        {/* Buttons on Right: Cancel + Create and Save as Template */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/tournaments"
            className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white font-display font-bold text-xs uppercase tracking-wider rounded transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#FFB800] hover:bg-[#FFA500] text-black font-display font-black text-xs uppercase tracking-wider rounded transition-transform active:scale-95 shadow-[0_2px_12px_rgba(255,184,0,0.3)] flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{isEdit ? "Update and Save" : "Create and Save as Template"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
