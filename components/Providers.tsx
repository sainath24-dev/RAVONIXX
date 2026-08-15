"use client";

import React from "react";
import { ReactLenis } from "lenis/react";
import { MotionConfig } from "framer-motion";
import "lenis/dist/lenis.css";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.12, duration: 1.0, smoothWheel: true }}>
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </ReactLenis>
  );
}
