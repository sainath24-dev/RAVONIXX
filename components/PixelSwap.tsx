"use client";

import React, { useState, useEffect, useRef } from "react";

const GLYPHS = "01!<>-_\\/[]{}—=+*^?#________";

export default function PixelSwap({
  text,
  className = "",
  scrambleSpeed = 30,
}: {
  text: string;
  className?: string;
  scrambleSpeed?: number;
}) {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            if (char === " ") return " ";
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      iteration += 1 / 2;
    }, scrambleSpeed);
  };

  const handleMouseLeave = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayText(text);
  };

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`inline-block font-mono select-none cursor-default transition-colors ${className}`}
    >
      {displayText}
    </span>
  );
}
