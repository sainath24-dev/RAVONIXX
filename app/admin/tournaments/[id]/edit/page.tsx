"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TournamentEditorForm from "@/components/admin/TournamentEditorForm";
import { Tournament } from "@/lib/tournaments/types";
import { Loader2, AlertCircle } from "lucide-react";

export default function EditTournamentPage() {
  const params = useParams();
  const id = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/tournaments/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load tournament");
        setTournament(data.tournament);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-text-muted">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="font-mono text-xs uppercase tracking-widest">
          Loading Tournament Configuration...
        </span>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="p-6 rounded bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{error || "Tournament not found"}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl tracking-wider text-white uppercase">
          EDIT TOURNAMENT CONFIGURATION
        </h1>
        <p className="text-xs font-mono text-text-muted mt-1 uppercase tracking-wider">
          Modify tournament brackets, status, rules, or room credentials
        </p>
      </div>

      <TournamentEditorForm initialData={tournament} isEdit={true} />
    </div>
  );
}
