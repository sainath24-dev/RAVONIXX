"use client";

import React from "react";
import TournamentEditorForm from "@/components/admin/TournamentEditorForm";

export default function NewTournamentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl tracking-wider text-white uppercase">
          CREATE NEW TOURNAMENT
        </h1>
        <p className="text-xs font-mono text-text-muted mt-1 uppercase tracking-wider">
          Configure competitive format, dates, prize pool, and registration rules
        </p>
      </div>

      <TournamentEditorForm isEdit={false} />
    </div>
  );
}
