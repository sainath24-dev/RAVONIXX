"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

interface StatPopInProps {
  value: number;
  suffix?: string;
  label: string;
  delay: number; // in seconds
}

export default function StatPopIn({ value, suffix = "", label, delay }: StatPopInProps) {
  const count = useSpring(0, { stiffness: 40, damping: 15 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      count.set(value);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [value, delay, count]);

  useEffect(() => {
    const unsubscribe = count.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return () => unsubscribe();
  }, [count]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="bg-panel/90 border border-hairline p-4 min-w-[140px] flex flex-col clip-card select-none"
    >
      <span className="font-display font-bold text-2xl md:text-3xl text-primary">
        {displayValue}{suffix}
      </span>
      <span className="font-display text-[10px] tracking-widest text-text-muted mt-1 uppercase">
        {label}
      </span>
    </motion.div>
  );
}
