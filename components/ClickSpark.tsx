"use client";

import React, { useEffect, useRef } from "react";

interface Spark {
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export default function ClickSpark({
  sparkColor = "#A855F7",
  sparkSize = 6,
  sparkCount = 10,
  sparkDuration = 450,
}: {
  sparkColor?: string;
  sparkSize?: number;
  sparkCount?: number;
  sparkDuration?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<Spark[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = [sparkColor, "#C084FC", "#00F0FF", "#FFFFFF"];
    let isRunning = false;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const s = sparksRef.current[i];
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          sparksRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = s.color;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (sparksRef.current.length > 0) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        isRunning = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (let i = 0; i < sparkCount; i++) {
        const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.5;
        const speed = Math.random() * 2.5 + 1.5;
        sparksRef.current.push({
          x,
          y,
          angle,
          speed,
          size: Math.random() * sparkSize + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: 1 / (sparkDuration / 16),
        });
      }

      if (!isRunning) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [sparkColor, sparkCount, sparkDuration, sparkSize]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      aria-hidden="true"
    />
  );
}
