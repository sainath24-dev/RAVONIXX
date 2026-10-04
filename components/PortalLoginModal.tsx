"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, KeyRound, Eye, EyeOff, 
  ArrowRight, X, Heart, AlertCircle, Loader2
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PortalLoginModal({ isOpen, onClose }: Props) {
  const router = useRouter();

  // Mode: "SELECT" | "PLAYER_MESSAGE" | "ADMIN_LOGIN"
  const [mode, setMode] = useState<"SELECT" | "PLAYER_MESSAGE" | "ADMIN_LOGIN">("SELECT");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setMode("SELECT");
    setPassword("");
    setError(null);
    onClose();
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter your admin password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid admin password.");
      }

      handleReset();
      router.push("/admin/tournaments");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#0E1528] border border-[#1A233D] rounded-sm shadow-2xl p-6 sm:p-8 text-white select-none">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={handleReset}
          className="absolute top-4 right-4 p-2 text-white/60 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* MODE 1: Role Selection */}
        {mode === "SELECT" && (
          <div className="space-y-6">
            <div className="text-center">
              <div 
                className="w-12 h-12 mx-auto bg-[#FFB800] text-black font-display font-black flex items-center justify-center text-sm shadow-[0_2px_10px_rgba(255,184,0,0.3)] mb-3"
                style={{ clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)" }}
              >
                FF
              </div>
              <h3 className="font-display font-black text-2xl text-white tracking-wider uppercase">
                WEBSITE LOGIN
              </h3>
              <p className="text-xs text-white/60 mt-1">
                Please select how you want to continue:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Player (No Login Required) */}
              <button
                type="button"
                onClick={() => setMode("PLAYER_MESSAGE")}
                className="p-5 rounded bg-[#131A30] hover:bg-[#1A2444] border border-white/10 hover:border-[#FFB800]/50 text-left transition-all group flex flex-col justify-between h-44 shadow-lg"
              >
                <div>
                  <div className="w-10 h-10 rounded bg-white/5 group-hover:bg-[#FFB800]/20 border border-white/10 group-hover:border-[#FFB800]/40 flex items-center justify-center text-white group-hover:text-[#FFB800] transition-colors mb-3">
                    <User className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-bold text-base text-white uppercase tracking-wider group-hover:text-[#FFB800] transition-colors">
                    PLAYER
                  </h4>
                  <p className="text-[11px] text-white/60 mt-1 leading-relaxed">
                    View tournaments, maps, player sensitivities & register your squad.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  <span>No Login Needed</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option 2: Admin */}
              <button
                type="button"
                onClick={() => setMode("ADMIN_LOGIN")}
                className="p-5 rounded bg-[#131A30] hover:bg-[#1A2444] border border-white/10 hover:border-[#FFB800]/50 text-left transition-all group flex flex-col justify-between h-44 shadow-lg"
              >
                <div>
                  <div className="w-10 h-10 rounded bg-white/5 group-hover:bg-[#FFB800]/20 border border-white/10 group-hover:border-[#FFB800]/40 flex items-center justify-center text-white group-hover:text-[#FFB800] transition-colors mb-3">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-bold text-base text-white uppercase tracking-wider group-hover:text-[#FFB800] transition-colors">
                    ADMIN
                  </h4>
                  <p className="text-[11px] text-white/60 mt-1 leading-relaxed">
                    Host tournaments, manage players, view teams & registrations.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-[#FFB800] font-bold uppercase tracking-wider">
                  <span>Admin Login</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: Player Humble Message (Exact user request: "you can use the website without login thank you in the humble way") */}
        {mode === "PLAYER_MESSAGE" && (
          <div className="text-center py-2 space-y-5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-1">
              <Heart className="w-7 h-7 text-emerald-400" />
            </div>

            <div>
              <h3 className="font-display font-black text-2xl text-white tracking-wider uppercase">
                DEAR PLAYER,
              </h3>
              <p className="text-xs text-white/60 mt-1">
                Welcome to RAVONIXX Esports
              </p>
            </div>

            <div className="p-5 rounded bg-[#131A30] border border-white/10 text-xs text-white/80 leading-relaxed text-left space-y-3 font-sans">
              <p className="text-sm font-semibold text-white">
                You can freely use and enjoy all features of this website without needing to log in. Thank you!
              </p>
              <ul className="space-y-1.5 text-white/80 list-disc list-inside text-xs">
                <li>Register your team for Free Fire tournaments</li>
                <li>Check roadmap stages, match schedules, and rules</li>
                <li>View player profiles, photos, and sensitivities</li>
                <li>Explore 3D tactical aerial map guides</li>
              </ul>
              <p className="text-[#FFB800] text-xs pt-1">
                Thank you for being part of our community. Best of luck on the battleground!
              </p>
            </div>

            <div className="flex items-center justify-center pt-1">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 bg-[#FFB800] hover:bg-[#FFA500] text-black font-display font-black text-xs uppercase tracking-wider rounded shadow transition-colors"
              >
                CONTINUE TO WEBSITE
              </button>
            </div>
          </div>
        )}

        {/* MODE 3: Admin Login Form (Clean, simple, no default password displayed, eye toggle) */}
        {mode === "ADMIN_LOGIN" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#FFB800]" />
                <h3 className="font-display font-black text-xl text-white tracking-wider uppercase">
                  ADMIN LOGIN
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMode("SELECT")}
                className="text-xs font-display font-bold text-white/60 hover:text-white uppercase tracking-wider"
              >
                Back
              </button>
            </div>

            {error && (
              <div className="p-3 rounded bg-red-900/40 border border-red-500/40 text-red-200 flex items-center gap-2 text-xs font-sans">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="w-full bg-[#16203B] border border-white/20 rounded px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFB800] font-sans pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMode("SELECT")}
                  className="flex-1 py-2.5 border border-white/15 text-white/70 hover:text-white text-xs font-display font-bold uppercase rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-[#FFB800] hover:bg-[#FFA500] text-black font-display font-black text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(255,184,0,0.3)] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{loading ? "LOGGING IN..." : "LOGIN"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
