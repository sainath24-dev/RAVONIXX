"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
} from "lucide-react";
import { TournamentWithMeta } from "@/lib/tournaments/service";
import FreeFireQRCode from "@/components/tournaments/FreeFireQRCode";

export default function TournamentRegisterPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tournament, setTournament] = useState<TournamentWithMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [teamName, setTeamName] = useState("");
  const [captain, setCaptain] = useState({ name: "", ign: "", uid: "" });
  const [players, setPlayers] = useState([
    { name: "", uid: "" },
    { name: "", uid: "" },
    { name: "", uid: "" },
  ]);
  const [hasSub, setHasSub] = useState(false);
  const [substitute, setSubstitute] = useState({ name: "", uid: "" });
  const [contact, setContact] = useState({ phone: "", email: "" });
  const [agreeRules, setAgreeRules] = useState(false);
  const [hpWebsite, setHpWebsite] = useState(""); // Honeypot field

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{
    registrationNumber: number;
    teamName: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/tournaments/${slug}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load tournament");

        setTournament(data.tournament);

        // Adjust default player count based on format
        if (data.tournament.format === "Solo") {
          setPlayers([]);
        } else if (data.tournament.format === "Duo") {
          setPlayers([{ name: "", uid: "" }]);
        } else {
          // Squad: 3 additional players + captain = 4
          setPlayers([
            { name: "", uid: "" },
            { name: "", uid: "" },
            { name: "", uid: "" },
          ]);
        }
      } catch (err: any) {
        setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadData();
  }, [slug]);

  const validateUid = (uid: string): string | null => {
    if (!uid) return "Free Fire UID is required";
    if (!/^\d+$/.test(uid.trim())) return "UID must contain digits only";
    if (uid.trim().length < 5) return "UID must be at least 5 digits";
    return null;
  };

  const handleStepValidation = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!teamName.trim() || teamName.trim().length < 2) {
        errors.teamName = "Team name must be at least 2 characters";
      }
    }

    if (step === 2) {
      if (!captain.name.trim() || captain.name.trim().length < 2) {
        errors.captainName = "Captain name is required";
      }
      if (!captain.ign.trim() || captain.ign.trim().length < 2) {
        errors.captainIgn = "Captain In-Game Name (IGN) is required";
      }
      const uidErr = validateUid(captain.uid);
      if (uidErr) errors.captainUid = uidErr;
    }

    if (step === 3) {
      // Validate players (Slot 2, 3, 4...)
      players.forEach((p, idx) => {
        const slotNum = idx + 2;
        if (!p.name.trim() || p.name.trim().length < 2) {
          errors[`playerName_${idx}`] = `Player ${slotNum} name is required`;
        }
        const uidErr = validateUid(p.uid);
        if (uidErr) errors[`playerUid_${idx}`] = `Player ${slotNum}: ${uidErr}`;
      });

      if (hasSub) {
        const subSlotNum = players.length + 2;
        if (!substitute.name.trim()) {
          errors.subName = `Player ${subSlotNum} (Substitute) name is required`;
        }
        const uidErr = validateUid(substitute.uid);
        if (uidErr) errors.subUid = `Player ${subSlotNum} (Substitute): ${uidErr}`;
      }

      // Check intra-form duplicate UIDs
      const allUids: { uid: string; label: string }[] = [];
      if (captain.uid.trim()) {
        allUids.push({ uid: captain.uid.trim(), label: "Captain (Player 1)" });
      }
      players.forEach((p, idx) => {
        if (p.uid.trim()) {
          allUids.push({ uid: p.uid.trim(), label: `Player ${idx + 2}` });
        }
      });
      if (hasSub && substitute.uid.trim()) {
        allUids.push({ uid: substitute.uid.trim(), label: `Player ${players.length + 2} (Substitute)` });
      }

      const seen = new Map<string, string>();
      for (const item of allUids) {
        if (seen.has(item.uid)) {
          errors.duplicateUid = `Duplicate UID detected: ${item.uid} is assigned to both ${seen.get(
            item.uid
          )} and ${item.label}. Each player must have a unique Free Fire UID.`;
          break;
        }
        seen.set(item.uid, item.label);
      }
    }

    if (step === 4) {
      if (!contact.phone.trim() || contact.phone.trim().length < 8) {
        errors.phone = "Valid WhatsApp/Phone number is required";
      }
      if (
        !contact.email.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())
      ) {
        errors.email = "Valid email address is required";
      }
      if (!agreeRules) {
        errors.agreeRules = "You must agree to the tournament rules to register";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (handleStepValidation(currentStep)) {
      setSubmitError(null);
      setCurrentStep((prev) => (prev < 4 ? ((prev + 1) as any) : prev));
    }
  };

  const handleBack = () => {
    setFieldErrors({});
    setSubmitError(null);
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as any) : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleStepValidation(4)) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        teamName: teamName.trim(),
        captain: {
          name: captain.name.trim(),
          ign: captain.ign.trim(),
          uid: captain.uid.trim(),
        },
        players: players.map((p) => ({
          name: p.name.trim(),
          uid: p.uid.trim(),
        })),
        substitute:
          hasSub && substitute.name.trim()
            ? {
                name: substitute.name.trim(),
                uid: substitute.uid.trim(),
              }
            : undefined,
        contact: {
          phone: contact.phone.trim(),
          email: contact.email.trim(),
        },
        agreeRules,
        hp_website: hpWebsite,
      };

      const res = await fetch(`/api/tournaments/${slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit registration");
      }

      setSuccessData({
        registrationNumber: data.registration.registrationNumber,
        teamName: data.registration.teamName,
      });
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRegNo = () => {
    if (successData) {
      navigator.clipboard.writeText(`#${successData.registrationNumber}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen text-white pt-40 pb-20 flex flex-col items-center justify-center gap-3 select-none"
        style={{
          backgroundImage: `linear-gradient(135deg, #090E1F 0%, #111933 50%, #0A0E1B 100%)`,
        }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-[#FFB800]" />
        <span className="font-display font-bold text-xs uppercase tracking-widest text-white/60">
          Loading Tournament Registration...
        </span>
      </div>
    );
  }

  if (loadError || !tournament) {
    return (
      <div 
        className="min-h-screen text-white pt-40 pb-20 px-4 text-center select-none"
        style={{
          backgroundImage: `linear-gradient(135deg, #090E1F 0%, #111933 50%, #0A0E1B 100%)`,
        }}
      >
        <div className="max-w-md mx-auto bg-[#0E1528] border border-[#1A233D] p-8 rounded-sm space-y-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="font-display font-black text-2xl uppercase">
            Tournament Unavailable
          </h2>
          <p className="text-xs text-white/60">{loadError || "Tournament not found"}</p>
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFB800] text-black text-xs font-display font-black uppercase rounded-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  // Success Screen matching Free Fire In-Game Ticket style
  if (successData) {
    return (
      <div 
        className="min-h-screen text-white pt-32 pb-24 px-4 flex items-center justify-center select-none"
        style={{
          backgroundImage: `linear-gradient(135deg, #090E1F 0%, #111933 50%, #0A0E1B 100%)`,
        }}
      >
        <div className="relative w-full max-w-lg bg-[#0E1528] border border-[#FFB800]/40 p-6 sm:p-8 rounded-sm shadow-2xl text-center space-y-6">
          {/* Booyah Badge */}
          <div className="w-20 h-20 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/40 flex items-center justify-center text-[#FFB800] mx-auto shadow-[0_0_25px_rgba(255,184,0,0.3)]">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30 text-[11px] font-display font-black uppercase tracking-widest inline-block">
              BOOYAH! ENTRY CONFIRMED
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide uppercase pt-2">
              REGISTRATION SUCCESSFUL!
            </h1>
            <p className="text-xs text-white/70">
              Team <strong className="text-white font-bold">{successData.teamName}</strong> is officially registered for {tournament.title}.
            </p>
          </div>

          {/* Registration Number Card */}
          <div className="bg-[#121B33] p-5 rounded-sm border border-white/10 space-y-2">
            <span className="text-[11px] font-display uppercase text-white/50 tracking-wider block">
              Official Tournament Slot Number
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-display font-black text-4xl sm:text-5xl text-[#FFB800] tracking-widest">
                #{successData.registrationNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyRegNo}
                className="p-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
                title="Copy Registration Number"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-white/60">
              Save this number. Match room credentials will be dispatched to your captain before match time.
            </p>
          </div>

          {/* Official WhatsApp Group Lobby Access */}
          {tournament.whatsappGroupUrl && (
            <div className="bg-[#0A1020] p-4 rounded-sm border border-emerald-500/30 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-emerald-400 font-display font-black text-xs uppercase tracking-wider">
                <QrCode className="w-4 h-4" />
                <span>Join Official WhatsApp Match Lobby</span>
              </div>
              <p className="text-[11px] text-white/60 max-w-sm">
                Scan or click below to join the official WhatsApp group for live room ID, password, and slot list announcements.
              </p>
              
              <div className="p-2 bg-white rounded-sm shadow-md">
                <FreeFireQRCode value={tournament.whatsappGroupUrl} size={130} />
              </div>

              <a
                href={tournament.whatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-display font-black text-xs uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2 shadow"
              >
                <span>OPEN WHATSAPP GROUP</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href={`/tournaments/${tournament.slug}`}
              className="w-full py-3 bg-[#16203B] hover:bg-[#1E2B4E] text-white border border-white/10 text-xs font-display font-bold uppercase tracking-wider rounded-sm text-center transition-colors"
            >
              Tournament Showmatch
            </Link>
            <Link
              href="/tournaments"
              className="w-full py-3 bg-[#FFB800] hover:bg-[#FFA500] text-black text-xs font-display font-black uppercase tracking-wider rounded-sm text-center transition-all shadow-[0_2px_10px_rgba(255,184,0,0.3)]"
            >
              All Tournaments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen text-white pt-28 pb-24 px-4 sm:px-6 lg:px-8 relative select-none font-sans"
      style={{
        backgroundImage: `linear-gradient(135deg, #090E1F 0%, #111933 50%, #0A0E1B 100%)`,
      }}
    >
      {/* Background Angular Slash Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 -z-0"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #1A264D 0, #1A264D 80px, transparent 80px, transparent 160px)`,
        }}
      />

      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        {/* Top Free Fire In-Game Header Bar matching Tournament Details */}
        <div className="flex items-center justify-between bg-[#0B0E1B] border-b border-[#1A233D] px-3 sm:px-6 py-2 rounded-t-sm shadow-md">
          <div className="flex items-center gap-1 sm:gap-2">
            <div
              className="px-5 py-2 bg-[#FFB800] text-black font-display font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_2px_10px_rgba(255,184,0,0.3)]"
              style={{ clipPath: "polygon(0 0, 100% 0, 92% 100%, 0 100%)" }}
            >
              SHOWMATCH
            </div>

            <div className="px-5 py-2 bg-[#121829] text-white/90 font-display font-bold text-xs sm:text-sm tracking-wider uppercase">
              TOURNAMENT REGISTRATION
            </div>
          </div>

          <Link
            href={`/tournaments/${tournament.slug}`}
            className="text-xs font-display font-bold text-white/70 hover:text-white flex items-center gap-1 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Details</span>
          </Link>
        </div>

        {/* Tournament Title Banner */}
        <div className="bg-[#0E1528] p-4 sm:p-5 rounded-sm border border-[#1A233D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#FFB800] block mb-1">
              FREE FIRE TOURNAMENT • {tournament.format.toUpperCase()}
            </span>
            <h1 className="font-display font-black text-xl sm:text-2xl text-white tracking-wide uppercase">
              {tournament.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="px-3 py-1 bg-[#16203B] text-white text-xs font-display font-bold uppercase rounded-sm border border-white/10">
              Entry: {tournament.entryFee || "Free"}
            </span>
            <span className="px-3 py-1 bg-[#FFB800] text-black text-xs font-display font-black uppercase rounded-sm">
              Slots: {tournament.registeredCount}/{tournament.maxTeams || "∞"}
            </span>
          </div>
        </div>

        {/* Stepper Bar matching Free Fire design */}
        <div className="grid grid-cols-4 gap-2 font-display text-xs uppercase tracking-wider text-center">
          {[
            { step: 1, title: "1. Team" },
            { step: 2, title: "2. Captain" },
            { step: 3, title: "3. Roster" },
            { step: 4, title: "4. Contact" },
          ].map((s) => (
            <div
              key={s.step}
              className={`py-2.5 px-1 rounded-sm border transition-all ${
                currentStep === s.step
                  ? "bg-[#FFB800] text-black border-[#FFB800] font-black shadow-[0_2px_8px_rgba(255,184,0,0.3)]"
                  : currentStep > s.step
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold"
                  : "bg-[#0E1528] text-white/50 border-[#1A233D]"
              }`}
            >
              {s.title}
            </div>
          ))}
        </div>

        {/* Global Error Banner */}
        {submitError && (
          <div className="p-4 rounded-sm bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3 text-xs font-sans">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Main Form Container */}
        <div className="bg-[#0E1528] border border-[#1A233D] p-6 sm:p-8 rounded-sm space-y-6 shadow-xl">
          {/* Honeypot field (hidden from real users) */}
          <input
            type="text"
            name="hp_website"
            value={hpWebsite}
            onChange={(e) => setHpWebsite(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          {/* STEP 1: TEAM INFO */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border-b border-[#1A233D] pb-3">
                <h3 className="font-display font-black text-base sm:text-lg text-white uppercase tracking-wider">
                  Step 1: Team / Clan Information
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Enter your official Free Fire team name or clan tag.
                </p>
              </div>

              <div>
                <label className="block text-xs font-display uppercase tracking-wider text-white/70 mb-1.5 font-bold">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => {
                    setTeamName(e.target.value);
                    if (fieldErrors.teamName) {
                      setFieldErrors({ ...fieldErrors, teamName: "" });
                    }
                  }}
                  placeholder="e.g. TOTAL ESPORTS / RVX WARRIORS"
                  className="w-full bg-[#16203B] border border-white/10 rounded-sm px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFB800] uppercase font-bold tracking-wide"
                  autoFocus
                />
                {fieldErrors.teamName && (
                  <p className="text-xs text-red-400 mt-1.5 font-medium">
                    {fieldErrors.teamName}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: CAPTAIN DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1A233D] pb-3">
                <div>
                  <h3 className="font-display font-black text-base sm:text-lg text-white uppercase tracking-wider">
                    Step 2: Team Captain • Player 1
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    The captain represents the squad as Player 1 and In-Game Leader (IGL).
                  </p>
                </div>
                <span className="text-[10px] font-display font-bold px-2.5 py-1 bg-[#FFB800] text-black uppercase rounded-sm shadow">
                  Slot 1 (Captain / IGL)
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-display uppercase tracking-wider text-white/70 mb-1.5 font-bold">
                    Captain Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={captain.name}
                    onChange={(e) =>
                      setCaptain({ ...captain, name: e.target.value })
                    }
                    placeholder="e.g. Aarav Sharma"
                    className="w-full bg-[#16203B] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFB800]"
                    autoFocus
                  />
                  {fieldErrors.captainName && (
                    <p className="text-xs text-red-400 mt-1 font-medium">
                      {fieldErrors.captainName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-display uppercase tracking-wider text-white/70 mb-1.5 font-bold">
                    Free Fire In-Game Name (IGN) *
                  </label>
                  <input
                    type="text"
                    required
                    value={captain.ign}
                    onChange={(e) =>
                      setCaptain({ ...captain, ign: e.target.value })
                    }
                    placeholder="e.g. RVX_CAPTAIN"
                    className="w-full bg-[#16203B] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFB800] uppercase font-bold"
                  />
                  {fieldErrors.captainIgn && (
                    <p className="text-xs text-red-400 mt-1 font-medium">
                      {fieldErrors.captainIgn}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-display uppercase tracking-wider text-white/70 mb-1.5 font-bold">
                    Free Fire UID (Digits Only) *
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={captain.uid}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      setCaptain({ ...captain, uid: digits });
                    }}
                    placeholder="e.g. 182749102"
                    className="w-full bg-[#16203B] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFB800] font-mono"
                  />
                  {fieldErrors.captainUid && (
                    <p className="text-xs text-red-400 mt-1 font-medium">
                      {fieldErrors.captainUid}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PLAYERS ROSTER */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="border-b border-[#1A233D] pb-3">
                <h3 className="font-display font-black text-base sm:text-lg text-white uppercase tracking-wider">
                  Step 3: Active Squad Roster ({tournament.format})
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Enter squad member details. Captain is Slot 1. Roster below covers Player 2, Player 3, and Player 4.
                </p>
              </div>

              {fieldErrors.duplicateUid && (
                <div className="p-3 rounded-sm bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
                  {fieldErrors.duplicateUid}
                </div>
              )}

              {players.map((p, idx) => {
                const slotNum = idx + 2;
                return (
                  <div
                    key={idx}
                    className="bg-[#121B33] p-4 rounded-sm border border-[#1A233D] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-display text-[#FFB800] font-bold uppercase tracking-wider block">
                        Player {slotNum} (Slot {slotNum})
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-white/5 text-white/60 uppercase rounded">
                        Active Squad Member
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-display uppercase tracking-wider text-white/70 mb-1 font-bold">
                          Player {slotNum} Name / IGN *
                        </label>
                        <input
                          type="text"
                          required
                          value={p.name}
                          onChange={(e) => {
                            const updated = [...players];
                            updated[idx].name = e.target.value;
                            setPlayers(updated);
                          }}
                          placeholder={`Player ${slotNum} Name`}
                          className="w-full bg-[#16203B] border border-white/10 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FFB800]"
                        />
                        {fieldErrors[`playerName_${idx}`] && (
                          <p className="text-[11px] text-red-400 mt-1 font-medium">
                            {fieldErrors[`playerName_${idx}`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-display uppercase tracking-wider text-white/70 mb-1 font-bold">
                          Free Fire UID (Digits Only) *
                        </label>
                        <input
                          type="text"
                          required
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={p.uid}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "");
                            const updated = [...players];
                            updated[idx].uid = digits;
                            setPlayers(updated);
                          }}
                          placeholder={`Player ${slotNum} Free Fire UID`}
                          className="w-full bg-[#16203B] border border-white/10 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FFB800] font-mono"
                        />
                        {fieldErrors[`playerUid_${idx}`] && (
                          <p className="text-[11px] text-red-400 mt-1 font-medium">
                            {fieldErrors[`playerUid_${idx}`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Squad format extra slot controls if needed */}
              {tournament.format === "Squad" && (
                <div className="flex items-center gap-2 pt-1">
                  {players.length < 4 && (
                    <button
                      type="button"
                      onClick={() => setPlayers([...players, { name: "", uid: "" }])}
                      className="px-3 py-1.5 bg-[#16203B] hover:bg-[#1E2B4E] border border-white/10 text-white/80 hover:text-white text-xs font-display font-bold uppercase rounded-sm transition-colors"
                    >
                      + Add Extra Squad Member (Slot {players.length + 2})
                    </button>
                  )}
                  {players.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setPlayers(players.slice(0, -1))}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-display font-bold uppercase rounded-sm transition-colors"
                    >
                      - Remove Extra Slot
                    </button>
                  )}
                </div>
              )}

              {/* Optional Substitute Player */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="hasSub"
                    checked={hasSub}
                    onChange={(e) => setHasSub(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FFB800] focus:ring-[#FFB800] bg-[#16203B] border-white/20"
                  />
                  <label
                    htmlFor="hasSub"
                    className="text-xs font-display font-bold text-white/80 cursor-pointer select-none uppercase tracking-wider"
                  >
                    Add Optional Substitute Player ({players.length + 2}th Slot)
                  </label>
                </div>

                {hasSub && (
                  <div className="bg-[#121B33] p-4 rounded-sm border border-[#FFB800]/30 space-y-3">
                    <span className="text-xs font-display text-[#FFB800] font-bold uppercase tracking-wider block">
                      Player {players.length + 2} (Substitute)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-display uppercase tracking-wider text-white/70 mb-1 font-bold">
                          Substitute Name / IGN
                        </label>
                        <input
                          type="text"
                          value={substitute.name}
                          onChange={(e) =>
                            setSubstitute({ ...substitute, name: e.target.value })
                          }
                          placeholder="Substitute Name"
                          className="w-full bg-[#16203B] border border-white/10 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FFB800]"
                        />
                        {fieldErrors.subName && (
                          <p className="text-[11px] text-red-400 mt-1 font-medium">
                            {fieldErrors.subName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-display uppercase tracking-wider text-white/70 mb-1 font-bold">
                          Substitute UID (Digits Only)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={substitute.uid}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "");
                            setSubstitute({ ...substitute, uid: digits });
                          }}
                          placeholder="Substitute UID"
                          className="w-full bg-[#16203B] border border-white/10 rounded-sm px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FFB800] font-mono"
                        />
                        {fieldErrors.subUid && (
                          <p className="text-[11px] text-red-400 mt-1 font-medium">
                            {fieldErrors.subUid}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: CONTACT & AGREEMENT */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="border-b border-[#1A233D] pb-3">
                <h3 className="font-display font-black text-base sm:text-lg text-white uppercase tracking-wider">
                  Step 4: Contact & Verification
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Lobby credentials and match schedule will be communicated to the captain.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-display uppercase tracking-wider text-white/70 mb-1.5 font-bold">
                    Captain Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contact.phone}
                    onChange={(e) =>
                      setContact({ ...contact, phone: e.target.value })
                    }
                    placeholder="e.g. +91 9876543210"
                    className="w-full bg-[#16203B] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFB800]"
                    autoFocus
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-400 mt-1 font-medium">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-display uppercase tracking-wider text-white/70 mb-1.5 font-bold">
                    Captain Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={contact.email}
                    onChange={(e) =>
                      setContact({ ...contact, email: e.target.value })
                    }
                    placeholder="e.g. captain@example.com"
                    className="w-full bg-[#16203B] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFB800]"
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-red-400 mt-1 font-medium">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Confirmation Checkbox */}
                <div className="pt-2">
                  <div className="flex items-start gap-3 p-3.5 bg-[#121B33] rounded-sm border border-white/10">
                    <input
                      type="checkbox"
                      id="agreeRules"
                      checked={agreeRules}
                      onChange={(e) => setAgreeRules(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#FFB800] focus:ring-[#FFB800] bg-[#16203B] border-white/20"
                    />
                    <label
                      htmlFor="agreeRules"
                      className="text-xs text-white/90 leading-relaxed cursor-pointer select-none"
                    >
                      I have read and agree to the official{" "}
                      <Link
                        href={`/tournaments/${tournament.slug}`}
                        target="_blank"
                        className="text-[#FFB800] underline font-bold"
                      >
                        tournament rules & fair-play policy
                      </Link>
                      . I confirm all player Free Fire UIDs are accurate and no emulators, hacks, or macros will be used.
                    </label>
                  </div>
                  {fieldErrors.agreeRules && (
                    <p className="text-xs text-red-400 mt-1.5 font-medium">
                      {fieldErrors.agreeRules}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1A233D]">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-display font-bold uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous Step
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-[#FFB800] hover:bg-[#FFA500] text-black font-display font-black text-xs uppercase tracking-widest rounded-sm flex items-center gap-1.5 transition-all shadow-[0_2px_10px_rgba(255,184,0,0.3)] active:scale-95"
              >
                NEXT SECTION
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#FFB800] hover:bg-[#FFA500] text-black font-display font-black text-xs uppercase tracking-widest rounded-sm flex items-center gap-2 transition-all shadow-[0_2px_15px_rgba(255,184,0,0.4)] disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    SUBMITTING REGISTRATION...
                  </>
                ) : (
                  <>
                    CONFIRM & SUBMIT REGISTRATION
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
