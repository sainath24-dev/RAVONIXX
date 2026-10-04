"use client";

import React, { useState, useRef } from "react";
import { X, Check, Copy, Download } from "lucide-react";
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

  React.useEffect(() => {
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

  const handleDownloadTicket = async () => {
    try {
      setDownloading(true);
      // Create offscreen canvas for crisp export
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 675; // 16:9 ratio
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // Draw background white with soft grey diagonal stripes
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 1200, 675);

      // Soft diagonal speed stripes
      ctx.fillStyle = "#F3F4F8";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(200, 0);
      ctx.lineTo(0, 400);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(150, 0);
      ctx.lineTo(450, 0);
      ctx.lineTo(0, 650);
      ctx.closePath();
      ctx.fill();

      // Left purple vertical accent bar
      ctx.fillStyle = "#7C3AED";
      ctx.fillRect(80, 80, 12, 90);

      // Title: TOURNAMENT INVITATION
      ctx.fillStyle = "#111827";
      ctx.font = "900 44px sans-serif";
      ctx.fillText("TOURNAMENT", 108, 122);
      ctx.fillText("INVITATION", 108, 166);

      // Tournament Name
      ctx.font = "bold 26px sans-serif";
      ctx.fillStyle = "#1F2937";
      ctx.fillText(tournament.title, 108, 220);

      // Format & Game Count
      ctx.font = "600 20px sans-serif";
      ctx.fillStyle = "#4B5563";
      ctx.fillText(
        `${tournament.gameName || "Battle Royale"} / ${tournament.format} / ${tournament.eventMode || "Online"} / ${tournament.gameCount || 4} Game(s)`,
        108,
        450
      );

      // Grey Capsule for Time & ID
      ctx.fillStyle = "#E5E7EB";
      ctx.beginPath();
      ctx.roundRect(108, 480, 360, 64, 8);
      ctx.fill();

      ctx.fillStyle = "#374151";
      ctx.font = "600 16px monospace";
      ctx.fillText(
        new Date(tournament.matchSchedule || tournament.registrationCloseDate).toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        128,
        510
      );
      ctx.fillText(`id: ${tournament.id}`, 128, 532);

      // Purple Diagonal Corner Wedge
      ctx.fillStyle = "#7C3AED";
      ctx.beginPath();
      ctx.moveTo(850, 675);
      ctx.lineTo(1200, 350);
      ctx.lineTo(1200, 675);
      ctx.closePath();
      ctx.fill();

      // Free Fire Tournament label in corner
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 28px sans-serif";
      ctx.fillText("FREE FIRE", 940, 585);
      ctx.font = "bold 22px sans-serif";
      ctx.fillText("TOURNAMENT", 940, 615);

      // Draw QR Code onto Canvas if ready
      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.crossOrigin = "anonymous";
        qrImg.onload = () => {
          // White box for QR code
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.roundRect(750, 100, 340, 340, 8);
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = "#E5E7EB";
          ctx.stroke();

          ctx.drawImage(qrImg, 765, 115, 310, 310);

          // Trigger download
          const link = document.createElement("a");
          link.download = `FF_Tournament_Invitation_${tournament.id}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
          setDownloading(false);
        };
        qrImg.src = qrDataUrl;
      } else {
        const link = document.createElement("a");
        link.download = `FF_Tournament_Invitation_${tournament.id}.png`;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl flex flex-col items-center">
        {/* Ticket Container matching reference image WhatsApp Image 2026-10-01 at 00.22.45.jpeg */}
        <div
          ref={ticketRef}
          className="w-full bg-white text-black rounded-sm shadow-2xl relative overflow-hidden border border-gray-200"
          style={{
            backgroundImage: `radial-gradient(circle at 10% 10%, rgba(0,0,0,0.03) 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
          }}
        >
          {/* Subtle Speed Stripe Watermark on left */}
          <div
            className="absolute inset-y-0 left-0 w-2/3 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(135deg, transparent 40%, rgba(147, 51, 234, 0.15) 45%, rgba(147, 51, 234, 0.15) 55%, transparent 60%)",
              backgroundSize: "120px 120px",
            }}
          />

          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            {/* Left Content Column */}
            <div className="flex-1 w-full flex flex-col justify-between">
              {/* Header Title with Purple Vertical Bar */}
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-16 bg-primary rounded-none flex-shrink-0" />
                <div>
                  <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight uppercase leading-none text-black">
                    TOURNAMENT
                  </h2>
                  <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight uppercase leading-none text-black mt-0.5">
                    INVITATION
                  </h2>
                  <p className="font-display font-bold text-sm md:text-base text-gray-800 mt-2 truncate max-w-sm">
                    {tournament.title}
                  </p>
                </div>
              </div>

              {/* Center Trophy / Banner Badge */}
              <div className="my-5 flex flex-col items-center justify-center">
                {tournament.bannerUrl && !tournament.bannerUrl.includes("Map_") ? (
                  <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-primary/30 shadow-md">
                    <img
                      src={tournament.bannerUrl}
                      alt={tournament.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <FreeFireTrophyBadge className="w-24 h-24" />
                )}

                <div className="mt-2 text-center flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary font-display font-black text-[10px] uppercase rounded border border-primary/20">
                    {tournament.eventMode || "Online"}
                  </span>
                  <span className="font-display font-bold text-xs text-gray-700 uppercase tracking-wider">
                    {tournament.gameName || "Free Fire Max"} / {tournament.format} /{" "}
                    {tournament.gameCount || 4} Game(s)
                  </span>
                </div>
              </div>

              {/* Bottom Grey Pill for Schedule & ID */}
              <div className="bg-gray-100 rounded px-4 py-2 text-center border border-gray-200">
                <div className="text-xs font-mono font-semibold text-gray-700">
                  {tournament.matchSchedule || "Starting Soon"}
                </div>
                <div className="text-[11px] font-mono text-gray-500 mt-0.5">
                  id: <span className="font-bold text-gray-800">{tournament.id}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Working QR Code + Free Fire Angled Wedge */}
            <div className="flex flex-col items-center justify-center relative">
              {/* QR Container */}
              <div className="p-3 bg-white rounded border-2 border-gray-200 shadow-md">
                <FreeFireQRCode
                  value={inviteUrl}
                  size={200}
                  onDataUrlGenerated={(url) => setQrDataUrl(url)}
                />
              </div>

              {/* Purple Diagonal Corner Graphic */}
              <div
                className="w-full mt-4 bg-primary text-white p-3 rounded text-center relative overflow-hidden shadow-sm"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% 100%, 8% 100%)",
                }}
              >
                <span className="font-display font-black text-sm tracking-wider uppercase block leading-none">
                  FREE FIRE MAX
                </span>
                <span className="font-display font-bold text-[11px] tracking-widest uppercase block leading-none mt-1 text-white/90">
                  SCAN TO JOIN
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Below Ticket matching reference image */}
        <div className="mt-4 flex items-center justify-center gap-3 w-full">
          <button
            type="button"
            onClick={handleDownloadTicket}
            disabled={downloading}
            className="px-5 py-2 bg-white hover:bg-gray-100 text-black font-display font-bold text-xs uppercase tracking-wider rounded shadow transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-black" />
            <span>{downloading ? "Saving..." : "Save Image"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-5 py-2 bg-white hover:bg-gray-100 text-black font-display font-bold text-xs uppercase tracking-wider rounded shadow transition-colors flex items-center gap-1.5"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4 text-black" />
            )}
            <span>{copied ? "Copied!" : "Copy Tournament Link"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-white/70 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors ml-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
