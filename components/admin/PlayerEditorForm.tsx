"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, Save, Loader2, AlertCircle, 
  Upload, User
} from "lucide-react";
import { Player } from "@/lib/players";

interface Props {
  initialData?: Player;
  isEdit?: boolean;
}

const CHARACTER_PRESETS = [
  { name: "Xayne", url: "/character/xayne.jpeg" },
  { name: "Rafael", url: "/character/rafael.jpeg" },
  { name: "Tatsuya", url: "/character/tatsuya.jpeg" },
  { name: "Kassie", url: "/character/kassie.jpeg" },
  { name: "Maro", url: "/character/maro.jpeg" },
  { name: "Kelly", url: "/character/kelly.jpeg" },
  { name: "Moco", url: "/character/moco.jpeg" },
  { name: "Joseph", url: "/character/joseph.jpeg" },
];

export default function PlayerEditorForm({ initialData, isEdit = false }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ign, setIgn] = useState(initialData?.ign || "");
  const [realName, setRealName] = useState(initialData?.realName || "");
  const [role, setRole] = useState(initialData?.role || "PRIMARY RUSHER");
  const [location, setLocation] = useState(initialData?.location || "India");
  const [uid, setUid] = useState(initialData?.uid || "");
  const [photoUrl, setPhotoUrl] = useState(initialData?.photoUrl || "/character/xayne.jpeg");
  const [device, setDevice] = useState(initialData?.device || "ROG Phone 8 Pro");
  const [hudLayoutImageUrl, setHudLayoutImageUrl] = useState(initialData?.hudLayoutImageUrl || "");

  // Settings
  const [generalSens, setGeneralSens] = useState(initialData?.settings?.generalSens ?? 190);
  const [redDotSens, setRedDotSens] = useState(initialData?.settings?.redDotSens ?? 180);
  const [scope2xSens, setScope2xSens] = useState(initialData?.settings?.scope2xSens ?? 170);
  const [scope4xSens, setScope4xSens] = useState(initialData?.settings?.scope4xSens ?? 175);
  const [sniperScopeSens, setSniperScopeSens] = useState(initialData?.settings?.sniperScopeSens ?? 120);
  const [freeLookSens, setFreeLookSens] = useState(initialData?.settings?.freeLookSens ?? 100);
  const [dpi, setDpi] = useState(initialData?.settings?.dpi ?? 480);
  const [controlLayout, setControlLayout] = useState(initialData?.settings?.controlLayout || "4-finger claw");
  const [hudCode, setHudCode] = useState(initialData?.settings?.hudCode || "");
  const [gyroscope, setGyroscope] = useState(initialData?.settings?.gyroscope ?? true);

  // Achievements
  const [achievementsText, setAchievementsText] = useState(
    initialData?.achievements?.join("\n") || "1st Place — Free Fire Cup 2026\nMVP — Scrims Tournament"
  );

  // Socials
  const [youtube, setYoutube] = useState(initialData?.socials?.youtube || "");
  const [instagram, setInstagram] = useState(initialData?.socials?.instagram || "");
  const [discord, setDiscord] = useState(initialData?.socials?.discord || "");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real File Upload handler
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
        throw new Error(data.error || "Failed to upload player photo");
      }

      setPhotoUrl(data.url);
    } catch (err: any) {
      setError(err.message || "Player photo upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ign.trim() || !role.trim() || !uid.trim()) {
      setError("In-Game Name (IGN), Role, and Free Fire UID are required.");
      return;
    }

    if (!/^\d+$/.test(uid.trim())) {
      setError("Free Fire UID must contain digits only.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const achievements = achievementsText
        .split("\n")
        .map((a) => a.trim())
        .filter(Boolean);

      const payload = {
        ign: ign.trim(),
        realName: realName.trim() || ign.trim(),
        role: role.trim(),
        location: location.trim(),
        uid: uid.trim(),
        photoUrl: photoUrl.trim() || "/character/xayne.jpeg",
        hudLayoutImageUrl: hudLayoutImageUrl.trim(),
        device: device.trim(),
        settings: {
          generalSens: Number(generalSens),
          redDotSens: Number(redDotSens),
          scope2xSens: Number(scope2xSens),
          scope4xSens: Number(scope4xSens),
          sniperScopeSens: Number(sniperScopeSens),
          freeLookSens: Number(freeLookSens),
          dpi: Number(dpi),
          controlLayout,
          hudCode: hudCode.trim(),
          gyroscope: Boolean(gyroscope),
        },
        achievements,
        socials: {
          youtube: youtube.trim() || undefined,
          instagram: instagram.trim() || undefined,
          discord: discord.trim() || undefined,
        },
      };

      const url = isEdit ? `/api/admin/players/${initialData?.id}` : "/api/admin/players";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save player");
      }

      router.push("/admin/players");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save player details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full font-sans select-none pb-16">
      {/* Top Free Fire In-Game Navigation Bar */}
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
            ROSTER CENTER
          </div>
        </div>

        <Link
          href="/admin/players"
          className="text-white/70 hover:text-white p-2 rounded hover:bg-white/5 transition-colors"
          title="Back to Roster"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Breadcrumb row */}
      <div className="bg-[#0E1528] px-6 py-2 border-x border-[#1A233D] flex items-center justify-between text-xs font-display font-bold text-white/70">
        <div className="flex items-center gap-2">
          <span className="text-[#FFB800]">PLAYERS</span>
          <span>|</span>
          <span>{isEdit ? `EDIT PLAYER: ${ign}` : "ADD NEW PLAYER"}</span>
        </div>
        <span className="text-white/40 font-mono text-[11px]">Free Fire Roster Details</span>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-900/40 border border-red-500/50 text-red-200 text-xs rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Container */}
      <div 
        className="p-5 sm:p-8 border-x border-b border-[#1A233D] space-y-6 text-white"
        style={{
          backgroundImage: `linear-gradient(135deg, #0C1224 0%, #111A33 50%, #0A0F1E 100%)`,
        }}
      >
        {/* 1. Identity & Player Photo Upload */}
        <div className="bg-[#121A30] border border-white/10 p-5 rounded-sm space-y-4">
          <div className="flex items-center gap-2 text-[#FFB800] font-display font-black text-sm uppercase tracking-wider">
            <span className="w-1.5 h-4 bg-[#FFB800]" />
            <span>PLAYER INFO & PHOTO</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Photo Preview & Real Upload Button */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-[#0A0E1D] border border-white/10 rounded">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-[#FFB800] shadow-[0_0_15px_rgba(255,184,0,0.3)] mb-3 bg-black">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Player photo preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>

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
                <span>{uploadingImage ? "Uploading..." : "Upload Player Photo"}</span>
              </button>

              <span className="text-[10px] text-white/40 font-mono mt-1.5">
                PNG, JPG or select preset below
              </span>
            </div>

            {/* Input Fields */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1">
                  In-Game Name (IGN) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ign}
                  onChange={(e) => setIgn(e.target.value)}
                  placeholder="e.g. RVX-SAINATH"
                  className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs font-display font-bold text-white focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1">
                  Real Name
                </label>
                <input
                  type="text"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  placeholder="e.g. Sainath"
                  className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1">
                  Roster Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs font-display font-bold text-white focus:outline-none focus:border-[#FFB800]"
                >
                  <option value="IGL / SUPPORTER">IGL / SUPPORTER</option>
                  <option value="IGL / SNIPER">IGL / SNIPER</option>
                  <option value="PRIMARY RUSHER">PRIMARY RUSHER</option>
                  <option value="SECONDARY RUSHER">SECONDARY RUSHER</option>
                  <option value="ENTRY FRAGGER">ENTRY FRAGGER</option>
                  <option value="SNIPER SPECIALIST">SNIPER SPECIALIST</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1">
                  Free Fire UID (Digits Only) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={uid}
                  onChange={(e) => setUid(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 561691696"
                  className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1">
                  Location / City
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bangalore"
                  className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1">
                  Device Model
                </label>
                <input
                  type="text"
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  placeholder="e.g. ROG Phone 8 Pro"
                  className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFB800]"
                />
              </div>
            </div>

            {/* Character Photo Presets */}
            <div className="md:col-span-12 pt-2 border-t border-white/10">
              <span className="text-[11px] font-display font-bold text-white/60 uppercase block mb-1.5">
                Or Select Character Preset:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {CHARACTER_PRESETS.map((p) => (
                  <button
                    type="button"
                    key={p.name}
                    onClick={() => setPhotoUrl(p.url)}
                    className={`px-3 py-1 rounded text-xs font-display font-bold transition-colors border ${
                      photoUrl === p.url
                        ? "bg-[#FFB800] border-[#FFB800] text-black"
                        : "bg-white/5 border-white/15 text-white/80 hover:text-white"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Free Fire Sensitivity Loadout */}
        <div className="bg-[#121A30] border border-white/10 p-5 rounded-sm space-y-4">
          <div className="flex items-center gap-2 text-[#FFB800] font-display font-black text-sm uppercase tracking-wider">
            <span className="w-1.5 h-4 bg-[#FFB800]" />
            <span>FREE FIRE SENSITIVITY & CONTROLS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "General", val: generalSens, set: setGeneralSens },
              { label: "Red Dot", val: redDotSens, set: setRedDotSens },
              { label: "2x Scope", val: scope2xSens, set: setScope2xSens },
              { label: "4x Scope", val: scope4xSens, set: setScope4xSens },
              { label: "Sniper Scope", val: sniperScopeSens, set: setSniperScopeSens },
              { label: "Free Look", val: freeLookSens, set: setFreeLookSens },
            ].map((s) => (
              <div key={s.label}>
                <label className="block text-[11px] font-mono text-white/70 uppercase mb-1">{s.label}</label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={s.val}
                  onChange={(e) => s.set(Number(e.target.value))}
                  className="w-full bg-[#16203B] border border-white/20 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:border-[#FFB800]"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1">
                Control Layout
              </label>
              <select
                value={controlLayout}
                onChange={(e) => setControlLayout(e.target.value as any)}
                className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs text-white font-display font-bold focus:border-[#FFB800]"
              >
                <option value="4-finger claw">4-finger claw</option>
                <option value="3-finger">3-finger</option>
                <option value="2-finger">2-finger</option>
                <option value="custom">custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1">
                In-Game HUD Code
              </label>
              <input
                type="text"
                value={hudCode}
                onChange={(e) => setHudCode(e.target.value)}
                placeholder="#FFHUD..."
                className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs font-mono text-white focus:border-[#FFB800]"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1">
                Screen DPI
              </label>
              <input
                type="number"
                value={dpi}
                onChange={(e) => setDpi(Number(e.target.value))}
                placeholder="480"
                className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs font-mono text-white focus:border-[#FFB800]"
              />
            </div>
          </div>
        </div>

        {/* 3. Achievements & Socials */}
        <div className="bg-[#121A30] border border-white/10 p-5 rounded-sm space-y-4">
          <div className="flex items-center gap-2 text-[#FFB800] font-display font-black text-sm uppercase tracking-wider">
            <span className="w-1.5 h-4 bg-[#FFB800]" />
            <span>ACHIEVEMENTS & SOCIALS</span>
          </div>

          <div>
            <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1">
              Key Achievements (One per line)
            </label>
            <textarea
              rows={3}
              value={achievementsText}
              onChange={(e) => setAchievementsText(e.target.value)}
              placeholder="1st Place — Free Fire Cup 2026&#10;MVP — Scrims Tournament"
              className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs text-white font-mono focus:border-[#FFB800]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-white/70 uppercase mb-1">YouTube URL</label>
              <input
                type="text"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/@..."
                className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-white/70 uppercase mb-1">Instagram URL</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-white/70 uppercase mb-1">Discord Tag</label>
              <input
                type="text"
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                placeholder="username"
                className="w-full bg-[#16203B] border border-white/20 rounded px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 bg-[#0E1528] px-6 py-4 border-x border-b border-[#1A233D] rounded-b-sm">
        <Link
          href="/admin/players"
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
          <span>{isEdit ? "Save Player Changes" : "Add Player"}</span>
        </button>
      </div>
    </form>
  );
}
