"use client";

import React from "react";
import PlayerEditorForm from "@/components/admin/PlayerEditorForm";

export default function NewPlayerPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-hairline pb-4">
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wider uppercase">
          RECRUIT NEW OPERATOR
        </h1>
        <p className="text-xs font-mono text-text-muted mt-0.5">
          Register a new pro Free Fire player with their photo, UID, sensitivity setup, and loadout.
        </p>
      </div>

      <PlayerEditorForm />
    </div>
  );
}
