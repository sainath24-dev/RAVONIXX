"use client";

import React, { useEffect, useRef } from "react";

interface StrandsProps {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  threadCount?: number;
  frequency?: number;
  opacity?: number;
  thickness?: number;
}

export default function StrandsBackground({
  color1 = "#A855F7",
  color2 = "#C084FC",
  color3 = "#00F0FF",
  speed = 1.2,
  threadCount = 8,
  frequency = 2.5,
  opacity = 0.45,
  thickness = 1.2,
}: StrandsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = (e.clientX - rect.left) / canvas.width;
      mouseRef.current.targetY = (e.clientY - rect.top) / canvas.height;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const palette = [color1, color2, color3];

    const render = () => {
      time += 0.012 * speed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse tracking
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const w = canvas.width;
      const h = canvas.height;
      const centerY = h * 0.5;

      for (let i = 0; i < threadCount; i++) {
        const offset = (i / threadCount) * Math.PI * 2;
        const color = palette[i % palette.length];

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.globalAlpha = opacity * (1 - Math.abs(i - threadCount / 2) / (threadCount / 1.5));
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;

        const points = 60;
        for (let j = 0; j <= points; j++) {
          const x = (j / points) * w;
          const normalizedX = j / points;
          
          // Wave dynamics with mouse influence
          const wave1 = Math.sin(normalizedX * frequency * Math.PI + time + offset) * (h * 0.14);
          const wave2 = Math.cos(normalizedX * (frequency * 1.5) * Math.PI - time * 0.8 + offset) * (h * 0.08);
          const mouseDisplacement = Math.sin((normalizedX - mouseRef.current.x) * Math.PI) * (mouseRef.current.y - 0.5) * (h * 0.2);

          const y = centerY + wave1 + wave2 + mouseDisplacement;

          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color1, color2, color3, frequency, opacity, speed, thickness, threadCount]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 mix-blend-screen"
      aria-hidden="true"
    />
  );
}
