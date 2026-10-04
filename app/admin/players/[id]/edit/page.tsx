"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import PlayerEditorForm from "@/components/admin/PlayerEditorForm";
import { Player } from "@/lib/players";

export default function EditPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/players/${id}`);
        if (!res.ok) throw new Error("Player not found");
        const data = await res.json();
        setPlayer(data);
      } catch (err: any) {
        setError(err.message || "Failed to load player");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPlayer();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-text-muted">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="font-mono text-xs uppercase tracking-wider">Loading operator dossier...</span>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="p-6 rounded bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3 max-w-lg mx-auto my-12">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span className="text-xs font-mono">{error || "Player not found"}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-hairline pb-4">
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wider uppercase">
          EDIT OPERATOR: {player.ign}
        </h1>
        <p className="text-xs font-mono text-text-muted mt-0.5">
          Update competitive profile, sensitivity calibration, and achievements.
        </p>
      </div>

      <PlayerEditorForm initialData={player} isEdit />
    </div>
  );
}
