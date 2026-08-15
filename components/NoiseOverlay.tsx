"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

export default function NoiseOverlay() {
  const pathname = usePathname();
  
  // Enforce zero noise/HUD styling on the policy page
  if (pathname === '/policy') return null;

  return (
    <>
      <div className="fixed inset-0 noise-overlay pointer-events-none z-[9999]" aria-hidden="true" />
      <div className="fixed inset-0 scanlines-overlay pointer-events-none z-[9998]" aria-hidden="true" />
    </>
  );
}
