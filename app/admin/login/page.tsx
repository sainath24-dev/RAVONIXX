"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin/tournaments";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter your admin password.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Invalid password.");
      }

      router.push(from);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to authenticate.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md bg-[#0E1528] border border-[#1A233D] p-6 sm:p-8 rounded-sm shadow-2xl z-10">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="relative w-12 h-12 mb-3">
          <Image
            src="/images/logo/ravonixx_white.png"
            alt="RAVONIXX Logo"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
        <h1 className="font-display font-black text-2xl text-white tracking-wider uppercase">
          LOGIN
        </h1>
        <p className="text-xs text-white/60 mt-1">
          Admin Access
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded bg-red-900/40 border border-red-500/40 flex items-center gap-2 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5">
            Admin Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full bg-[#16203B] border border-white/20 rounded px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFB800] pr-10 font-sans"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-[#FFB800] hover:bg-[#FFA500] text-black font-display font-black tracking-wider text-xs uppercase rounded transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(255,184,0,0.3)] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              LOGGING IN...
            </>
          ) : (
            <>
              LOG IN
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 text-center">
        <Link
          href="/"
          className="text-xs text-white/60 hover:text-white font-display font-bold uppercase transition-colors"
        >
          ← Back to Website
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div 
      className="relative min-h-screen flex items-center justify-center p-4 font-sans select-none text-white"
      style={{
        backgroundImage: `linear-gradient(135deg, #090E1F 0%, #111A33 50%, #0A0F1E 100%)`,
      }}
    >
      <Suspense fallback={
        <div className="flex items-center justify-center p-8 text-white/60 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#FFB800]" />
          <span className="font-display uppercase text-xs tracking-wider">Loading...</span>
        </div>
      }>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
