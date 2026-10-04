"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Check, Copy, Download, Share2, Trophy } from "lucide-react";
import { Tournament } from "@/lib/tournaments/types";
import FreeFireQRCode from "./FreeFireQRCode";
import FreeFireTrophyBadge from "./FreeFireTrophyBadge";

interface Props {
  tournament: Tournament;
  isOpen: boolean;
  onClose: () => void;
}

export default function FreeFireInvitationCardModal({
  tournament,
  isOpen,
  onClose,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const ticketRef = useRef<HTMLDivElement>(null);

  // Invitation Ticket QR code redirects to the specific tournament page to invite players
  const [inviteUrl, setInviteUrl] = useState<string>(
    typeof window !== "undefined"
      ? `${window.location.origin}/tournaments/${tournament.slug}`
      : `https://www.ravonixx.xyz/tournaments/${tournament.slug}`
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setInviteUrl(`${window.location.origin}/tournaments/${tournament.slug}`);
    }
  }, [tournament.slug]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `🔥 *RAVONIXX FREE FIRE TOURNAMENT INVITATION* 🔥\n\n` +
      `🏆 *Tournament:* ${tournament.title}\n` +
      `🎮 *Mode:* Battle Royale (${tournament.format}) • ${tournament.eventMode || "Online"}\n` +
      `💰 *Prize Pool:* ${tournament.prizePool || "₹50,000 INR"}\n` +
      `📅 *Schedule:* ${tournament.matchSchedule || "Starting Soon"}\n\n` +
      `👉 *Join & Register Squad:* ${inviteUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
  };

  // High-Resolution 2X Canvas Export matching the official reference image
  const handleDownloadTicket = async () => {
    try {
      setDownloading(true);
      const canvas = document.createElement("canvas");
      // 16:9 High-Res Aspect Ratio (1600 x 900)
      canvas.width = 1600;
      canvas.height = 900;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setDownloading(false);
        return;
      }

      // 1. Crisp White Background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 1600, 900);

      // 2. Subtle Halftone Dot Pattern (Top-Left Corner)
      ctx.fillStyle = "rgba(148, 163, 184, 0.18)";
      for (let x = 40; x < 400; x += 16) {
        for (let y = 40; y < 260; y += 16) {
          const radius = Math.max(0.5, 2.2 - (x + y) / 300);
          if (radius > 0) {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 3. Dynamic Silver Speed Slashes (Angled at -45 deg)
      ctx.fillStyle = "#F1F4F9";
      ctx.beginPath();
      ctx.moveTo(180, 0);
      ctx.lineTo(380, 0);
      ctx.lineTo(0, 580);
      ctx.lineTo(0, 280);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#E8EDF5";
      ctx.beginPath();
      ctx.moveTo(340, 0);
      ctx.lineTo(620, 0);
      ctx.lineTo(0, 900);
      ctx.lineTo(0, 680);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#F3F6FA";
      ctx.beginPath();
      ctx.moveTo(580, 0);
      ctx.lineTo(820, 0);
      ctx.lineTo(240, 900);
      ctx.lineTo(60, 900);
      ctx.closePath();
      ctx.fill();

      // 4. Solid Violet Vertical Accent Bar
      ctx.fillStyle = "#7C3AED";
      ctx.beginPath();
      ctx.roundRect(100, 90, 14, 115, 4);
      ctx.fill();

      // 5. Header Titles: TOURNAMENT INVITATION
      ctx.fillStyle = "#0F172A";
      ctx.font = "900 58px Arial, sans-serif";
      ctx.letterSpacing = "1px";
      ctx.fillText("TOURNAMENT", 136, 145);
      ctx.fillText("INVITATION", 136, 202);

      // 6. Subtitle: Organizer / Tournament Name
      ctx.fillStyle = "#334155";
      ctx.font = "bold 30px Arial, sans-serif";
      const shortTitle = tournament.title.length > 38 
        ? `${tournament.title.slice(0, 38)}...` 
        : tournament.title;
      ctx.fillText(`${shortTitle} ✌`, 136, 260);

      // 7. Middle Trophy Badge / Emblem
      const trophyX = 380;
      const trophyY = 410;

      // Soft purple radial glow behind trophy
      const trophyGlow = ctx.createRadialGradient(trophyX, trophyY, 10, trophyX, trophyY, 110);
      trophyGlow.addColorStop(0, "rgba(147, 51, 234, 0.35)");
      trophyGlow.addColorStop(1, "rgba(147, 51, 234, 0)");
      ctx.fillStyle = trophyGlow;
      ctx.beginPath();
      ctx.arc(trophyX, trophyY, 110, 0, Math.PI * 2);
      ctx.fill();

      // Draw Trophy Crest Shield
      ctx.fillStyle = "#7E22CE";
      ctx.beginPath();
      ctx.moveTo(trophyX, trophyY - 75);
      ctx.lineTo(trophyX + 60, trophyY - 35);
      ctx.lineTo(trophyX + 65, trophyY + 30);
      ctx.lineTo(trophyX, trophyY + 80);
      ctx.lineTo(trophyX - 65, trophyY + 30);
      ctx.lineTo(trophyX - 60, trophyY - 35);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#DDD6FE";
      ctx.stroke();

      // Inner Padlock/Keyhole Detail
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(trophyX, trophyY - 5, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(trophyX - 6, trophyY - 5);
      ctx.lineTo(trophyX + 6, trophyY - 5);
      ctx.lineTo(trophyX + 8, trophyY + 22);
      ctx.lineTo(trophyX - 8, trophyY + 22);
      ctx.closePath();
      ctx.fill();

      // 8. Meta Text: Format & Games Count
      ctx.fillStyle = "#475569";
      ctx.font = "bold 26px Arial, sans-serif";
      ctx.textAlign = "center";
      const metaText = `Battle Royale / ${tournament.format || "Squad"} / ${tournament.eventMode || "Online"} / ${tournament.gameCount || 4} Game(s)`;
      ctx.fillText(metaText, 380, 565);
      ctx.textAlign = "left";

      // 9. Chamfered Capsule Pill for Schedule & ID (Exact to reference)
      const pillX = 136;
      const pillY = 610;
      const pillW = 500;
      const pillH = 105;
      const chamfer = 24;

      ctx.fillStyle = "#E2E8F0";
      ctx.beginPath();
      ctx.moveTo(pillX, pillY);
      ctx.lineTo(pillX + pillW - chamfer, pillY);
      ctx.lineTo(pillX + pillW, pillY + chamfer);
      ctx.lineTo(pillX + pillW, pillY + pillH);
      ctx.lineTo(pillX, pillY + pillH);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#CBD5E1";
      ctx.stroke();

      // Pill Text (Formatted date & ID)
      ctx.fillStyle = "#1E293B";
      ctx.font = "bold 24px monospace";
      const scheduleDate = tournament.matchSchedule || "01/11/2026 18:00 IST";
      ctx.fillText(scheduleDate, pillX + 28, pillY + 45);

      ctx.fillStyle = "#64748B";
      ctx.font = "bold 20px monospace";
      ctx.fillText(`id: ${tournament.id}`, pillX + 28, pillY + 82);

      // 10. Dynamic Purple Diagonal Wedge in Bottom-Right Corner
      ctx.fillStyle = "#7C3AED";
      ctx.beginPath();
      ctx.moveTo(1080, 900);
      ctx.lineTo(1600, 390);
      ctx.lineTo(1600, 900);
      ctx.closePath();
      ctx.fill();

      // Speed slashes on edge of wedge
      ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
      ctx.beginPath();
      ctx.moveTo(1040, 900);
      ctx.lineTo(1070, 900);
      ctx.lineTo(1590, 380);
      ctx.lineTo(1560, 380);
      ctx.closePath();
      ctx.fill();

      // Halftone dot pattern on corner wedge
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      for (let x = 1250; x < 1580; x += 18) {
        for (let y = 700; y < 880; y += 18) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Free Fire Tournament Branding in Corner Wedge
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 46px Arial, sans-serif";
      ctx.fillText("FREE FIRE", 1210, 785);
      ctx.font = "bold 32px Arial, sans-serif";
      ctx.fillText("TOURNAMENT", 1210, 830);

      // 11. Draw QR Code Frame & Image
      const qrBoxX = 1040;
      const qrBoxY = 120;
      const qrBoxSize = 440;

      // QR white shadow card
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "rgba(0, 0, 0, 0.14)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 8;
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 16);
      ctx.fill();
      ctx.shadowColor = "transparent";

      ctx.lineWidth = 3;
      ctx.strokeStyle = "#E2E8F0";
      ctx.stroke();

      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.crossOrigin = "anonymous";
        qrImg.onload = () => {
          ctx.drawImage(qrImg, qrBoxX + 24, qrBoxY + 24, qrBoxSize - 48, qrBoxSize - 48);

          // Trigger download
          const link = document.createElement("a");
          link.download = `FF_Invitation_${tournament.slug || tournament.id}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
          setDownloading(false);
        };
        qrImg.src = qrDataUrl;
      } else {
        const link = document.createElement("a");
        link.download = `FF_Invitation_${tournament.slug || tournament.id}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        setDownloading(false);
      }
    } catch (e) {
      console.error("Error generating ticket image:", e);
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto">
      <div className="relative w-full max-w-3xl flex flex-col items-center my-auto">
        
        {/* Ticket Container with Premium Esports GFX */}
        <div
          ref={ticketRef}
          className="w-full bg-[#FFFFFF] text-[#0F172A] rounded-xl sm:rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative overflow-hidden border border-white/20 ring-1 ring-black/5"
        >
          {/* Authentic Perforated Ticket Notches on Left & Right */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/90 rounded-full z-30 shadow-inner border border-white/10 hidden sm:block" />
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/90 rounded-full z-30 shadow-inner border border-white/10 hidden sm:block" />

          {/* GFX Element 1: Halftone Dot Matrix Texture (Top-Left) */}
          <div 
            className="absolute top-0 left-0 w-64 h-48 pointer-events-none opacity-30 z-0"
            style={{
              backgroundImage: "radial-gradient(#64748B 1px, transparent 1px)",
              backgroundSize: "12px 12px",
              maskImage: "linear-gradient(135deg, black 40%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(135deg, black 40%, transparent 100%)",
            }}
          />

          {/* GFX Element 2: Multi-Stage Angled Speed Slashes (Ribbons) */}
          <div 
            className="absolute inset-y-0 left-0 w-3/4 pointer-events-none z-0 overflow-hidden"
          >
            {/* Speed Slash 1 */}
            <div 
              className="absolute top-0 left-12 w-32 h-[150%] bg-[#F1F4F9] -rotate-45 origin-top-left"
            />
            {/* Speed Slash 2 */}
            <div 
              className="absolute top-0 left-36 w-48 h-[150%] bg-[#E8EDF5]/70 -rotate-45 origin-top-left"
            />
            {/* Speed Slash 3 */}
            <div 
              className="absolute top-0 left-72 w-24 h-[150%] bg-[#F3F6FA] -rotate-45 origin-top-left"
            />
          </div>

          {/* Main Card Content */}
          <div className="p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 relative z-10">
            
            {/* Left Content Column */}
            <div className="flex-1 w-full flex flex-col justify-between space-y-5">
              
              {/* Header Title with Glowing Violet Accent Bar */}
              <div className="flex items-start gap-3.5">
                <div className="w-2.5 sm:w-3 h-14 sm:h-16 bg-gradient-to-b from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9] rounded-sm flex-shrink-0 shadow-[0_0_12px_rgba(124,58,237,0.5)]" />
                <div>
                  <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl tracking-tight uppercase leading-[0.95] text-[#0F172A]">
                    TOURNAMENT
                  </h2>
                  <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl tracking-tight uppercase leading-[0.95] text-[#0F172A] mt-0.5">
                    INVITATION
                  </h2>
                  
                  {/* Tournament Organizer & Title with subtle icon */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-display font-bold text-xs sm:text-sm text-gray-700 tracking-wide truncate max-w-[280px] sm:max-w-xs block">
                      {tournament.title}
                    </span>
                    <span className="text-xs">✌</span>
                  </div>
                </div>
              </div>

              {/* Center Trophy Visual with Glowing Aura */}
              <div className="my-2 sm:my-3 flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#8B5CF6]/20 rounded-full blur-xl scale-125 pointer-events-none" />
                  {tournament.bannerUrl && !tournament.bannerUrl.includes("Map_") ? (
                    <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-purple-500/40 shadow-lg relative z-10">
                      <img
                        src={tournament.bannerUrl}
                        alt={tournament.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <FreeFireTrophyBadge className="w-24 h-24 sm:w-28 sm:h-28" />
                  )}
                </div>

                {/* Badges Bar (Mode + Prize Pool Highlights) */}
                <div className="mt-3 flex items-center justify-center gap-2 flex-wrap text-center">
                  {/* Event Mode Pill */}
                  <span className="px-2.5 py-0.5 bg-[#7C3AED]/10 text-[#7C3AED] font-display font-black text-[11px] uppercase tracking-wider rounded border border-[#7C3AED]/25 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />
                    {tournament.eventMode || "Online"}
                  </span>

                  {/* Dual Prize Pool Badge */}
                  {(tournament.prizeCash || tournament.prizeDiamonds || tournament.prizePool) && (
                    <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-700 font-display font-black text-[11px] uppercase tracking-wider rounded border border-amber-500/30 flex items-center gap-1 shadow-sm">
                      <Trophy className="w-3 h-3 text-amber-600" />
                      {tournament.prizeCash || tournament.prizePool || "₹50,000"}
                      {tournament.prizeDiamonds ? ` • 💎 ${tournament.prizeDiamonds}` : ""}
                    </span>
                  )}
                </div>

                {/* Subtitle Format Details */}
                <p className="font-display font-bold text-xs text-gray-600 uppercase tracking-widest mt-2 text-center">
                  Battle Royale / {tournament.format || "Squad"} / {tournament.gameCount || 4} Game(s)
                </p>
              </div>

              {/* Chamfered Capsule Pill for Schedule & Tournament ID */}
              <div 
                className="bg-[#E2E8F0] rounded-sm px-4 sm:px-5 py-2.5 border border-[#CBD5E1] shadow-inner relative"
                style={{
                  clipPath: "polygon(0 0, 95% 0, 100% 30%, 100% 100%, 0 100%)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs sm:text-sm font-mono font-bold text-[#1E293B] tracking-tight">
                      {tournament.matchSchedule || "01/11/2026 18:00 IST"}
                    </div>
                    <div className="text-[11px] font-mono text-gray-500 mt-0.5">
                      id: <span className="font-bold text-[#0F172A] tracking-wider">{tournament.id}</span>
                    </div>
                  </div>
                  
                  <span className="hidden sm:inline-block px-2 py-0.5 bg-white/70 text-gray-700 font-mono text-[10px] font-bold uppercase rounded border border-gray-300">
                    OFFICIAL
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: QR Pass + Free Fire Diagonal Corner Wedge */}
            <div className="flex flex-col items-center justify-center relative w-full md:w-auto">
              
              {/* QR Container with Crisp Frame */}
              <div className="p-3.5 bg-white rounded-xl border-2 border-[#E2E8F0] shadow-xl relative z-10 flex flex-col items-center group">
                <FreeFireQRCode
                  value={inviteUrl}
                  size={200}
                  onDataUrlGenerated={(url) => setQrDataUrl(url)}
                />
                <span className="text-[10px] font-mono text-gray-400 mt-1.5 uppercase tracking-widest font-semibold">
                  SCAN TO OPEN TOURNAMENT
                </span>
              </div>

              {/* Dynamic Purple Corner Wedge with Speed Slash Overlay */}
              <div
                className="w-full mt-4 bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#581C87] text-white p-3.5 rounded-lg text-center relative overflow-hidden shadow-lg z-10"
                style={{
                  clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0% 100%)",
                }}
              >
                {/* Halftone texture overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: "radial-gradient(white 1px, transparent 1px)",
                    backgroundSize: "8px 8px",
                  }}
                />

                <span className="font-display font-black text-base tracking-wider uppercase block leading-none text-white drop-shadow-sm">
                  FREE FIRE MAX
                </span>
                <span className="font-display font-black text-[11px] tracking-[0.2em] uppercase block leading-none mt-1 text-white/90">
                  OFFICIAL TOURNAMENT
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Action Controls Bar Below Ticket */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 w-full">
          {/* Download Ticket Button */}
          <button
            type="button"
            onClick={handleDownloadTicket}
            disabled={downloading}
            className="px-5 py-2.5 bg-gradient-to-r from-[#FFB800] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FF8C00] text-black font-display font-black text-xs uppercase tracking-wider rounded shadow-[0_2px_15px_rgba(255,184,0,0.3)] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-black" />
            <span>{downloading ? "GENERATING PASS..." : "SAVE TICKET"}</span>
          </button>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs uppercase tracking-wider rounded border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">COPIED LINK!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white" />
                <span>COPY LINK</span>
              </>
            )}
          </button>

          {/* WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-white font-display font-black text-xs uppercase tracking-wider rounded shadow-[0_2px_15px_rgba(37,211,102,0.3)] transition-all flex items-center gap-2 active:scale-95"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span>INVITE VIA WHATSAPP</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 text-white/60 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors ml-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
