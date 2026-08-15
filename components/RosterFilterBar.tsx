"use client";

import React from "react";

interface RosterFilterBarProps {
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  selectedTier: string;
  setSelectedTier: (tier: string) => void;
}

export default function RosterFilterBar({
  selectedRole,
  setSelectedRole,
  selectedTier,
  setSelectedTier,
}: RosterFilterBarProps) {
  const roles = ["All", "Rusher", "Support", "IGL", "Sniper", "Trap-Master"];
  const tiers = ["All", "Diamond", "Gold", "Silver", "Bronze"];

  return (
    <div className="flex flex-col gap-6 w-full border border-hairline bg-panel p-6 clip-card select-none">
      {/* Role Filter Row */}
      <div className="flex flex-col gap-3">
        <span className="display-font text-xs tracking-widest text-text-muted">
          FILTER BY ROLE // COMBAT SPECIALIZATION
        </span>
        <div className="flex flex-wrap gap-2.5">
          {roles.map((role) => {
            const isActive = selectedRole === role;
            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2 font-display text-xs tracking-wider border rounded-[2px] transition-colors duration-150 uppercase relative ${
                  isActive
                    ? "border-primary text-primary bg-panel-raised"
                    : "border-hairline text-text-muted hover:text-text-primary hover:bg-panel-raised"
                }`}
              >
                {role === "All" ? "ALL ROLES" : role}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tier Filter Row */}
      <div className="flex flex-col gap-3 border-t border-hairline/50 pt-5">
        <span className="display-font text-xs tracking-widest text-text-muted">
          FILTER BY DIVISION // COMPETITIVE TIER
        </span>
        <div className="flex flex-wrap gap-2.5">
          {tiers.map((tier) => {
            const isActive = selectedTier === tier;
            const tierColor = tier !== "All" ? `var(--tier-${tier.toLowerCase()})` : undefined;

            return (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-4 py-2 font-display text-xs tracking-wider border rounded-[2px] transition-colors duration-150 uppercase flex items-center gap-2 ${
                  isActive
                    ? "border-primary text-primary bg-panel-raised"
                    : "border-hairline text-text-muted hover:text-text-primary hover:bg-panel-raised"
                }`}
              >
                {tierColor && (
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tierColor }}
                  />
                )}
                {tier === "All" ? "ALL TIERS" : tier}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
