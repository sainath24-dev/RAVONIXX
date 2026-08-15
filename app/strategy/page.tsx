"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { 
  ZoomIn, ZoomOut, RotateCcw, Paintbrush, MapPin, Trash2, 
  Download, Eye, EyeOff, Undo, Shield, Target,
  ArrowRight, Circle, Minus, Play, RefreshCw,
  Mountain, Navigation, Upload, Save,
  Radio
} from "lucide-react";
import { MAPS_DATABASE } from "@/lib/mapData";

const ROLES = [
  { id: "igl", name: "IGL", color: "#D800FF" },
  { id: "sniper", name: "Sniper", color: "#00F0FF" },
  { id: "entry", name: "Entry", color: "#FF5500" },
  { id: "rusher", name: "Rusher", color: "#39FF14" },
  { id: "nader", name: "Nader", color: "#FFCC00" }
];

export type ToolMode = "pan" | "pencil" | "arrow" | "line" | "circle" | "marker";
export type MarkerType = "spawn" | "enemy" | "sniper" | "gloo";

export interface Point {
  x: number;
  y: number;
}

export interface TacticalPath {
  id: string;
  type: "pencil" | "arrow" | "line" | "circle";
  points: Point[];
  color: string;
  width: number;
  roleId: string;
}

export interface TacticalMarker {
  id: string;
  x: number;
  y: number;
  type: MarkerType;
  label: string;
  roleId: string;
}

export interface SafeZoneCircle {
  phase: number;
  x: number;
  y: number;
  radius: number;
}

export interface ActionHistory {
  type: "path" | "marker";
  id: string;
}

const GRID_COLS = ["B", "C", "D", "E", "F", "G", "H"];
const GRID_ROWS = ["J", "K", "L", "M", "N", "O", "P"];

export default function StrategyPage() {
  const mapList = Object.values(MAPS_DATABASE);
  const [selectedMapId, setSelectedMapId] = useState<string>("bermuda");
  const activeMap = MAPS_DATABASE[selectedMapId] || MAPS_DATABASE["bermuda"];

  // Viewport
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Tools & state
  const [activeTool, setActiveTool] = useState<ToolMode>("pan");
  const [activeRole, setActiveRole] = useState(ROLES[0]);
  const [activeMarkerType, setActiveMarkerType] = useState<MarkerType>("spawn");
  const [markerLabel, setMarkerLabel] = useState("");
  const [activeTab, setActiveTab] = useState<"tools" | "zones" | "presets">("tools");

  // Role visibility
  const [roleVisibility, setRoleVisibility] = useState<Record<string, boolean>>({
    igl: true,
    sniper: true,
    entry: true,
    rusher: true,
    nader: true
  });

  // Drawings & markers
  const [paths, setPaths] = useState<TacticalPath[]>([]);
  const [markers, setMarkers] = useState<TacticalMarker[]>([]);
  const [history, setHistory] = useState<ActionHistory[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawPoints, setCurrentDrawPoints] = useState<Point[]>([]);

  // Safe Zone Simulator
  const [safeZonePhase, setSafeZonePhase] = useState<number>(0);
  const [safeZones, setSafeZones] = useState<SafeZoneCircle[]>([]);

  // Grid
  const [showCoordinateGrid, setShowCoordinateGrid] = useState<boolean>(true);

  // Presets
  const [savedPresets, setSavedPresets] = useState<{ id: string; name: string; mapId: string; date: string; data: string }[]>([]);
  const [newPresetName, setNewPresetName] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartRef = useRef<{ distance: number; zoom: number; midpoint: { x: number; y: number }; pan: { x: number; y: number } } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("rvx_tactical_presets");
      if (stored) setSavedPresets(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  // Safe Zone Logic
  const generateNextSafeZone = () => {
    const nextPhase = safeZonePhase + 1;
    if (nextPhase > 5) return;

    let newZone: SafeZoneCircle;

    if (nextPhase === 1) {
      const x = 35 + Math.random() * 30;
      const y = 35 + Math.random() * 30;
      newZone = { phase: 1, x, y, radius: 36 };
    } else {
      const prevZone = safeZones[safeZones.length - 1];
      const radii = [36, 25, 16, 10, 5];
      const newRadius = radii[nextPhase - 1];
      const maxOffset = Math.max(0, (prevZone.radius - newRadius) * 0.85);
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * maxOffset;
      const x = Math.min(90, Math.max(10, prevZone.x + Math.cos(angle) * distance));
      const y = Math.min(90, Math.max(10, prevZone.y + Math.sin(angle) * distance));
      newZone = { phase: nextPhase, x, y, radius: newRadius };
    }

    setSafeZones(prev => [...prev, newZone]);
    setSafeZonePhase(nextPhase);
  };

  const resetSafeZones = () => {
    setSafeZonePhase(0);
    setSafeZones([]);
  };

  // Canvas Vector Drawing
  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string, width: number) => {
    const headLen = 14;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Saved Paths
    paths.forEach((p) => {
      if (!roleVisibility[p.roleId]) return;
      if (p.points.length < 2) return;

      ctx.save();
      ctx.strokeStyle = p.color;
      ctx.fillStyle = p.color;
      ctx.lineWidth = p.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (p.type === "pencil") {
        ctx.beginPath();
        ctx.moveTo(p.points[0].x, p.points[0].y);
        for (let i = 1; i < p.points.length; i++) {
          ctx.lineTo(p.points[i].x, p.points[i].y);
        }
        ctx.stroke();
      } else if (p.type === "line") {
        ctx.beginPath();
        ctx.moveTo(p.points[0].x, p.points[0].y);
        ctx.lineTo(p.points[p.points.length - 1].x, p.points[p.points.length - 1].y);
        ctx.stroke();
      } else if (p.type === "arrow") {
        drawArrow(ctx, p.points[0].x, p.points[0].y, p.points[p.points.length - 1].x, p.points[p.points.length - 1].y, p.color, p.width);
      } else if (p.type === "circle") {
        const start = p.points[0];
        const end = p.points[p.points.length - 1];
        const radius = Math.hypot(end.x - start.x, end.y - start.y);
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}15`;
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    });

    // Active Draw Preview
    if (isDrawing && currentDrawPoints.length > 0) {
      ctx.save();
      ctx.strokeStyle = activeRole.color;
      ctx.fillStyle = activeRole.color;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";

      if (activeTool === "pencil") {
        ctx.beginPath();
        ctx.moveTo(currentDrawPoints[0].x, currentDrawPoints[0].y);
        for (let i = 1; i < currentDrawPoints.length; i++) {
          ctx.lineTo(currentDrawPoints[i].x, currentDrawPoints[i].y);
        }
        ctx.stroke();
      } else if (activeTool === "line" && currentDrawPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(currentDrawPoints[0].x, currentDrawPoints[0].y);
        ctx.lineTo(currentDrawPoints[currentDrawPoints.length - 1].x, currentDrawPoints[currentDrawPoints.length - 1].y);
        ctx.stroke();
      } else if (activeTool === "arrow" && currentDrawPoints.length > 1) {
        drawArrow(ctx, currentDrawPoints[0].x, currentDrawPoints[0].y, currentDrawPoints[currentDrawPoints.length - 1].x, currentDrawPoints[currentDrawPoints.length - 1].y, activeRole.color, 4);
      } else if (activeTool === "circle" && currentDrawPoints.length > 1) {
        const start = currentDrawPoints[0];
        const end = currentDrawPoints[currentDrawPoints.length - 1];
        const radius = Math.hypot(end.x - start.x, end.y - start.y);
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `${activeRole.color}20`;
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [paths, roleVisibility, isDrawing, currentDrawPoints, activeRole, activeTool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 1000;
    canvas.height = 1000;
    redrawCanvas();
  }, [redrawCanvas, selectedMapId]);

  // Pointer & Touch Handlers (Universal Touch + Mouse + Stylus)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Multi-touch Pinch to Zoom & Pan Detection (2 fingers)
    if (pointersRef.current.size === 2) {
      setIsDrawing(false);
      setCurrentDrawPoints([]);
      setIsPanning(false);

      const pts = Array.from(pointersRef.current.values());
      const distance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const midpoint = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      pinchStartRef.current = { distance, zoom, midpoint, pan };
      return;
    }

    if (pointersRef.current.size > 2) return;

    // Single touch / mouse click
    const rect = containerRef.current.getBoundingClientRect();

    if (activeTool === "pan") {
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const x = Math.max(0, Math.min(canvas.width, ((e.clientX - rect.left) / rect.width) * canvas.width));
    const y = Math.max(0, Math.min(canvas.height, ((e.clientY - rect.top) / rect.height) * canvas.height));

    if (["pencil", "arrow", "line", "circle"].includes(activeTool)) {
      setIsDrawing(true);
      setCurrentDrawPoints([{ x, y }]);
    } else if (activeTool === "marker") {
      const mx = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const my = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      const markerId = Math.random().toString(36).substring(2, 9);
      const newMarker: TacticalMarker = {
        id: markerId,
        x: mx,
        y: my,
        type: activeMarkerType,
        label: markerLabel || `${activeRole.name} Pin`,
        roleId: activeRole.id
      };
      setMarkers(prev => [...prev, newMarker]);
      setHistory(prev => [...prev, { type: "marker", id: markerId }]);
      setMarkerLabel("");
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    if (!pointersRef.current.has(e.pointerId)) return;

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Handle two-finger pinch-to-zoom & two-finger pan on phone
    if (pointersRef.current.size === 2 && pinchStartRef.current) {
      const pts = Array.from(pointersRef.current.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const currentMid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };

      if (pinchStartRef.current.distance > 0) {
        const scaleChange = currentDist / pinchStartRef.current.distance;
        const newZoom = Math.max(1, Math.min(3.5, pinchStartRef.current.zoom * scaleChange));
        setZoom(newZoom);
      }

      const dx = currentMid.x - pinchStartRef.current.midpoint.x;
      const dy = currentMid.y - pinchStartRef.current.midpoint.y;
      setPan({
        x: pinchStartRef.current.pan.x + dx,
        y: pinchStartRef.current.pan.y + dy
      });
      return;
    }

    if (isPanning && activeTool === "pan") {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      return;
    }

    if (isDrawing && ["pencil", "arrow", "line", "circle"].includes(activeTool)) {
      const rect = containerRef.current.getBoundingClientRect();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const x = Math.max(0, Math.min(canvas.width, ((e.clientX - rect.left) / rect.width) * canvas.width));
      const y = Math.max(0, Math.min(canvas.height, ((e.clientY - rect.top) / rect.height) * canvas.height));

      if (activeTool === "pencil") {
        setCurrentDrawPoints(prev => [...prev, { x, y }]);
      } else {
        setCurrentDrawPoints(prev => (prev.length > 0 ? [prev[0], { x, y }] : [{ x, y }]));
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

    pointersRef.current.delete(e.pointerId);

    if (pointersRef.current.size < 2) {
      pinchStartRef.current = null;
    }

    if (isPanning) setIsPanning(false);

    if (isDrawing) {
      if (currentDrawPoints.length > 1) {
        const pathId = Math.random().toString(36).substring(2, 9);
        const newPath: TacticalPath = {
          id: pathId,
          type: activeTool as TacticalPath["type"],
          points: currentDrawPoints,
          color: activeRole.color,
          width: activeTool === "circle" ? 2.5 : 4,
          roleId: activeRole.id
        };
        setPaths(prev => [...prev, newPath]);
        setHistory(prev => [...prev, { type: "path", id: pathId }]);
      }
      setIsDrawing(false);
      setCurrentDrawPoints([]);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 0.15;
      const direction = e.deltaY < 0 ? 1 : -1;
      setZoom(prev => Math.max(1, Math.min(prev + direction * zoomFactor, 3.5)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const nextHistory = [...history];
    const lastAction = nextHistory.pop();
    if (lastAction) {
      if (lastAction.type === "path") setPaths(prev => prev.filter(p => p.id !== lastAction.id));
      else if (lastAction.type === "marker") setMarkers(prev => prev.filter(m => m.id !== lastAction.id));
      setHistory(nextHistory);
    }
  };

  const handleClearAll = () => {
    setPaths([]);
    setMarkers([]);
    setHistory([]);
    resetSafeZones();
  };

  // Presets
  const saveCurrentPreset = () => {
    if (!newPresetName.trim()) return;
    const presetData = {
      mapId: selectedMapId,
      paths,
      markers,
      safeZones,
      safeZonePhase
    };

    const newEntry = {
      id: Math.random().toString(36).substring(2, 9),
      name: newPresetName.trim().toUpperCase(),
      mapId: selectedMapId,
      date: new Date().toLocaleDateString(),
      data: JSON.stringify(presetData)
    };

    const updated = [...savedPresets, newEntry];
    setSavedPresets(updated);
    localStorage.setItem("rvx_tactical_presets", JSON.stringify(updated));
    setNewPresetName("");
  };

  const loadPreset = (presetString: string) => {
    try {
      const parsed = JSON.parse(presetString);
      if (parsed.mapId) setSelectedMapId(parsed.mapId);
      if (parsed.paths) setPaths(parsed.paths);
      if (parsed.markers) setMarkers(parsed.markers);
      if (parsed.safeZones) setSafeZones(parsed.safeZones);
      if (typeof parsed.safeZonePhase === "number") setSafeZonePhase(parsed.safeZonePhase);
      handleResetZoom();
    } catch {
      // ignore
    }
  };

  const deletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updated);
    localStorage.setItem("rvx_tactical_presets", JSON.stringify(updated));
  };

  const exportPresetJSON = () => {
    const presetData = {
      mapId: selectedMapId,
      paths,
      markers,
      safeZones,
      safeZonePhase
    };
    const blob = new Blob([JSON.stringify(presetData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `ravonixx_${selectedMapId}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) loadPreset(content);
    };
    reader.readAsText(file);
  };

  const downloadPlanImage = () => {
    const mergeCanvas = document.createElement("canvas");
    mergeCanvas.width = 1200;
    mergeCanvas.height = 1200;
    const ctx = mergeCanvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.src = activeMap.src;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1200, 1200);

      // Safe Zones
      safeZones.forEach((zone) => {
        const cx = (zone.x / 100) * 1200;
        const cy = (zone.y / 100) * 1200;
        const cr = (zone.radius / 100) * 1200;
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 3.5;
        ctx.stroke();
      });

      // Paths
      paths.forEach((p) => {
        if (!roleVisibility[p.roleId]) return;
        if (p.points.length < 2) return;
        ctx.save();
        ctx.strokeStyle = p.color;
        ctx.fillStyle = p.color;
        ctx.lineWidth = p.width * 1.2;
        ctx.lineCap = "round";

        if (p.type === "pencil") {
          ctx.beginPath();
          ctx.moveTo(p.points[0].x * 1.2, p.points[0].y * 1.2);
          for (let i = 1; i < p.points.length; i++) ctx.lineTo(p.points[i].x * 1.2, p.points[i].y * 1.2);
          ctx.stroke();
        } else if (p.type === "line") {
          ctx.beginPath();
          ctx.moveTo(p.points[0].x * 1.2, p.points[0].y * 1.2);
          ctx.lineTo(p.points[p.points.length - 1].x * 1.2, p.points[p.points.length - 1].y * 1.2);
          ctx.stroke();
        } else if (p.type === "arrow") {
          drawArrow(ctx, p.points[0].x * 1.2, p.points[0].y * 1.2, p.points[p.points.length - 1].x * 1.2, p.points[p.points.length - 1].y * 1.2, p.color, p.width * 1.2);
        } else if (p.type === "circle") {
          const start = p.points[0];
          const end = p.points[p.points.length - 1];
          const radius = Math.hypot(end.x - start.x, end.y - start.y) * 1.2;
          ctx.beginPath();
          ctx.arc(start.x * 1.2, start.y * 1.2, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      });

      // Markers
      markers.forEach((m) => {
        if (!roleVisibility[m.roleId]) return;
        const mx = (m.x / 100) * 1200;
        const my = (m.y / 100) * 1200;
        ctx.beginPath();
        ctx.arc(mx, my, 16, 0, Math.PI * 2);
        ctx.fillStyle = "#FF5500";
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.font = "bold 14px sans-serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(m.label, mx + 20, my + 6);
      });

      const link = document.createElement("a");
      link.download = `ravonixx_${selectedMapId}.png`;
      link.href = mergeCanvas.toDataURL();
      link.click();
    };
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-6 min-h-[90vh]">
      {/* Background Texture Asset with Low Opacity */}
      <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-screen -z-0">
        <Image
          src="/design_assets/randomstyle1.jpeg"
          alt="Tactics backdrop"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-wider text-text-primary">
          {activeMap.name} Strategy
        </h1>

        {/* Map Selector */}
        <div className="flex items-center gap-1 p-1 bg-panel border border-hairline rounded overflow-x-auto max-w-full">
          {mapList.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedMapId(m.id);
                handleResetZoom();
                handleClearAll();
              }}
              className={`px-3 py-1 text-[11px] font-display font-bold uppercase rounded transition-colors whitespace-nowrap ${
                selectedMapId === m.id
                  ? "bg-primary text-black"
                  : "text-text-muted hover:text-white"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        
        {/* Left Controls (4 cols on desktop, order-2 on mobile) */}
        <div className="order-2 lg:order-1 lg:col-span-4 flex flex-col gap-4 w-full">
          
          {/* Tab Navigation */}
          <div className="grid grid-cols-3 bg-panel border border-hairline p-1 rounded">
            <button
              onClick={() => setActiveTab("tools")}
              className={`py-1.5 text-[10px] font-display font-bold uppercase rounded ${
                activeTab === "tools" ? "bg-primary text-black" : "text-text-muted hover:text-white"
              }`}
            >
              Draw & Pins
            </button>
            <button
              onClick={() => setActiveTab("zones")}
              className={`py-1.5 text-[10px] font-display font-bold uppercase rounded ${
                activeTab === "zones" ? "bg-primary text-black" : "text-text-muted hover:text-white"
              }`}
            >
              Safe Zones
            </button>
            <button
              onClick={() => setActiveTab("presets")}
              className={`py-1.5 text-[10px] font-display font-bold uppercase rounded ${
                activeTab === "presets" ? "bg-primary text-black" : "text-text-muted hover:text-white"
              }`}
            >
              Save & Export
            </button>
          </div>

          {/* TAB 1: DRAW & PINS */}
          {activeTab === "tools" && (
            <div className="flex flex-col gap-4">
              
              {/* Tool Picker */}
              <div className="bg-panel border border-hairline p-4 rounded flex flex-col gap-3">
                <span className="text-[10px] font-display font-bold text-text-muted uppercase">Tools</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setActiveTool("pan")}
                    className={`p-2 border text-[10px] font-display font-bold uppercase flex items-center justify-center gap-1 rounded ${
                      activeTool === "pan" ? "border-primary bg-primary text-black" : "border-hairline text-text-muted hover:text-white"
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" /> Pan
                  </button>
                  <button
                    onClick={() => setActiveTool("pencil")}
                    className={`p-2 border text-[10px] font-display font-bold uppercase flex items-center justify-center gap-1 rounded ${
                      activeTool === "pencil" ? "border-primary bg-primary text-black" : "border-hairline text-text-muted hover:text-white"
                    }`}
                  >
                    <Paintbrush className="w-3.5 h-3.5" /> Draw
                  </button>
                  <button
                    onClick={() => setActiveTool("arrow")}
                    className={`p-2 border text-[10px] font-display font-bold uppercase flex items-center justify-center gap-1 rounded ${
                      activeTool === "arrow" ? "border-primary bg-primary text-black" : "border-hairline text-text-muted hover:text-white"
                    }`}
                  >
                    <ArrowRight className="w-3.5 h-3.5" /> Arrow
                  </button>
                  <button
                    onClick={() => setActiveTool("line")}
                    className={`p-2 border text-[10px] font-display font-bold uppercase flex items-center justify-center gap-1 rounded ${
                      activeTool === "line" ? "border-primary bg-primary text-black" : "border-hairline text-text-muted hover:text-white"
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" /> Line
                  </button>
                  <button
                    onClick={() => setActiveTool("circle")}
                    className={`p-2 border text-[10px] font-display font-bold uppercase flex items-center justify-center gap-1 rounded ${
                      activeTool === "circle" ? "border-primary bg-primary text-black" : "border-hairline text-text-muted hover:text-white"
                    }`}
                  >
                    <Circle className="w-3.5 h-3.5" /> Circle
                  </button>
                  <button
                    onClick={() => setActiveTool("marker")}
                    className={`p-2 border text-[10px] font-display font-bold uppercase flex items-center justify-center gap-1 rounded ${
                      activeTool === "marker" ? "border-primary bg-primary text-black" : "border-hairline text-text-muted hover:text-white"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" /> Pin
                  </button>
                </div>

                {/* Marker Submenu */}
                {activeTool === "marker" && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-hairline">
                    <span className="text-[9px] font-display text-text-muted uppercase">Pin Type</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: "spawn", label: "Spawn", icon: Target },
                        { id: "enemy", label: "Enemy", icon: Radio },
                        { id: "sniper", label: "Sniper", icon: Mountain },
                        { id: "gloo", label: "Gloo", icon: Shield }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveMarkerType(item.id as MarkerType)}
                          className={`p-1.5 border text-[9px] font-display font-bold uppercase flex items-center gap-1 rounded ${
                            activeMarkerType === item.id ? "border-primary text-primary bg-primary/10" : "border-hairline text-text-muted"
                          }`}
                        >
                          <item.icon className="w-3 h-3" /> {item.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={markerLabel}
                      onChange={(e) => setMarkerLabel(e.target.value.substring(0, 16))}
                      placeholder="Pin label"
                      className="w-full bg-panel-raised border border-hairline p-2 text-xs font-body text-text-primary rounded focus:outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>

              {/* Roles */}
              <div className="bg-panel border border-hairline p-4 rounded flex flex-col gap-2.5">
                <span className="text-[10px] font-display font-bold text-text-muted uppercase">Role</span>
                <div className="flex flex-col gap-1.5">
                  {ROLES.map((role) => (
                    <div
                      key={role.id}
                      className={`flex items-center justify-between p-2 border rounded ${
                        activeRole.id === role.id ? "border-primary/50 bg-panel-raised" : "border-hairline"
                      }`}
                    >
                      <button
                        onClick={() => setActiveRole(role)}
                        className="flex items-center gap-2 flex-grow text-left focus:outline-none"
                      >
                        <div style={{ backgroundColor: role.color }} className="w-3 h-3 rounded-full" />
                        <span className="text-[10px] font-display font-bold uppercase text-text-primary">
                          {role.name}
                        </span>
                      </button>
                      <button
                        onClick={() => setRoleVisibility(prev => ({ ...prev, [role.id]: !prev[role.id] }))}
                        className={`p-1 ${roleVisibility[role.id] ? "text-primary" : "text-text-muted opacity-40"}`}
                        title="Toggle visibility"
                      >
                        {roleVisibility[role.id] ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid Toggle */}
              <label className="flex items-center justify-between p-3 bg-panel border border-hairline rounded cursor-pointer">
                <span className="text-[10px] font-display font-bold uppercase text-text-primary">
                  Show Grid (B-H, J-P)
                </span>
                <input
                  type="checkbox"
                  checked={showCoordinateGrid}
                  onChange={(e) => setShowCoordinateGrid(e.target.checked)}
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
              </label>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className="p-2 bg-panel border border-hairline hover:border-primary text-[10px] font-display font-bold uppercase flex items-center justify-center gap-1 rounded disabled:opacity-40"
                >
                  <Undo className="w-3.5 h-3.5" /> Undo
                </button>
                <button
                  onClick={handleClearAll}
                  className="p-2 bg-panel border border-hairline hover:border-red-500 hover:text-red-500 text-[10px] font-display font-bold uppercase flex items-center justify-center gap-1 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SAFE ZONES */}
          {activeTab === "zones" && (
            <div className="flex flex-col gap-4">
              <div className="bg-panel border border-hairline p-4 rounded flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-display font-bold text-text-muted uppercase">Safe Zone Simulator</span>
                  <span className="text-[10px] font-mono font-bold text-primary">
                    {safeZonePhase === 0 ? "Inactive" : `Zone ${safeZonePhase}/5`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={generateNextSafeZone}
                    disabled={safeZonePhase >= 5}
                    className="p-2 bg-primary text-black text-[10px] font-display font-bold uppercase flex items-center justify-center gap-1 rounded disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    {safeZonePhase === 0 ? "Spawn Zone 1" : "Next Shift"}
                  </button>
                  <button
                    onClick={resetSafeZones}
                    disabled={safeZonePhase === 0}
                    className="p-2 bg-panel-raised border border-hairline text-text-primary text-[10px] font-display font-bold uppercase flex items-center justify-center gap-1 rounded disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRESETS & EXPORT */}
          {activeTab === "presets" && (
            <div className="flex flex-col gap-4">
              <div className="bg-panel border border-hairline p-4 rounded flex flex-col gap-2.5">
                <span className="text-[10px] font-display font-bold text-text-muted uppercase">Save Plan</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Plan Name"
                    className="flex-grow bg-panel-raised border border-hairline p-2 text-xs font-body text-text-primary rounded focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={saveCurrentPreset}
                    disabled={!newPresetName.trim()}
                    className="px-3 bg-primary text-black text-[10px] font-display font-bold uppercase rounded disabled:opacity-50 flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              </div>

              {/* Saved list */}
              <div className="bg-panel border border-hairline p-4 rounded flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                <span className="text-[10px] font-display font-bold text-text-muted uppercase">
                  Saved Plans ({savedPresets.length})
                </span>
                {savedPresets.length === 0 ? (
                  <span className="text-xs text-text-muted">No saved plans</span>
                ) : (
                  savedPresets.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => loadPreset(preset.data)}
                      className="p-2 bg-panel-raised/50 border border-hairline hover:border-primary flex items-center justify-between rounded cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-display font-bold text-text-primary uppercase">
                          {preset.name}
                        </span>
                        <span className="text-[9px] font-mono text-text-muted">
                          {preset.mapId.toUpperCase()} • {preset.date}
                        </span>
                      </div>
                      <button
                        onClick={(e) => deletePreset(preset.id, e)}
                        className="text-text-muted hover:text-red-500 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Export Buttons */}
              <button
                onClick={downloadPlanImage}
                className="w-full py-2 bg-primary text-black text-[10px] font-display font-bold uppercase rounded flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export PNG
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={exportPresetJSON}
                  className="py-1.5 px-2 bg-panel border border-hairline hover:border-primary text-text-primary text-[10px] font-display font-bold uppercase rounded flex items-center justify-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Export JSON
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-1.5 px-2 bg-panel border border-hairline hover:border-primary text-text-primary text-[10px] font-display font-bold uppercase rounded flex items-center justify-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" /> Import JSON
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </div>
            </div>
          )}

        </div>

        {/* Right Blackboard Viewport (8 cols on desktop, order-1 on mobile) */}
        <div className="order-1 lg:order-2 lg:col-span-8 flex flex-col gap-2 relative w-full">
          
          {/* Zoom Toolbar */}
          <div className="flex items-center justify-between bg-panel border border-hairline px-3 py-2 rounded text-xs select-none">
            <div className="flex items-center gap-2">
              <div style={{ backgroundColor: activeRole.color }} className="w-2.5 h-2.5 rounded-full" />
              <span className="font-display font-bold text-text-primary uppercase tracking-wider text-[10px]">
                {activeRole.name} • <span className="text-primary">{activeTool.toUpperCase()}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setZoom(z => Math.min(z + 0.3, 3.5))} className="p-1.5 border border-hairline rounded hover:border-primary text-text-muted hover:text-white" title="Zoom In">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setZoom(z => Math.max(z - 0.3, 1))} className="p-1.5 border border-hairline rounded hover:border-primary text-text-muted hover:text-white" title="Zoom Out">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleResetZoom} className="p-1.5 border border-hairline rounded hover:border-primary text-text-muted hover:text-white" title="Reset View">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Map Viewport Canvas Container with Touch Support */}
          <div className="relative aspect-square w-full bg-black border border-hairline overflow-hidden rounded select-none touch-none shadow-2xl">
            
            {/* Top Coordinate Header (B, C, D, E, F, G, H) */}
            {showCoordinateGrid && (
              <div className="absolute top-0 left-6 right-0 h-6 bg-black/60 z-20 flex pointer-events-none border-b border-white/10">
                {GRID_COLS.map((col, idx) => (
                  <div key={idx} className="flex-1 flex items-center justify-center font-mono text-[10px] font-bold text-white/70">
                    {col}
                  </div>
                ))}
              </div>
            )}

            {/* Left Coordinate Sidebar (J, K, L, M, N, O, P) */}
            {showCoordinateGrid && (
              <div className="absolute top-6 left-0 bottom-0 w-6 bg-black/60 z-20 flex flex-col pointer-events-none border-r border-white/10">
                {GRID_ROWS.map((row, idx) => (
                  <div key={idx} className="flex-1 flex items-center justify-center font-mono text-[10px] font-bold text-white/70">
                    {row}
                  </div>
                ))}
              </div>
            )}

            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                cursor: activeTool === "pan" ? (isPanning ? "grabbing" : "grab") : "crosshair",
                touchAction: "none"
              }}
              className="relative w-full h-full select-none touch-none"
            >
              {/* Map Image */}
              <div className="absolute inset-0 select-none pointer-events-none">
                <Image
                  src={activeMap.src}
                  alt={activeMap.name}
                  fill
                  priority
                  className="object-cover opacity-90 select-none pointer-events-none"
                  sizes="(max-width: 1024px) 100vw, 850px"
                  unoptimized
                />
              </div>

              {/* Grid Lines Overlay */}
              {showCoordinateGrid && (
                <div className="absolute inset-0 pointer-events-none z-[2]">
                  <div className="w-full h-full grid grid-cols-7 grid-rows-7 border border-white/10">
                    {Array(49).fill(null).map((_, i) => (
                      <div key={i} className="border border-white/5" />
                    ))}
                  </div>
                </div>
              )}

              {/* Safe Zone Rings */}
              {safeZones.map((zone, idx) => (
                <div
                  key={`safezone-${idx}`}
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: `${zone.radius * 2}%`,
                    height: `${zone.radius * 2}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                  className={`absolute rounded-full pointer-events-none border-2 border-dashed z-[3] ${
                    idx === safeZones.length - 1
                      ? "border-white bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                      : "border-white/30"
                  }`}
                >
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 font-mono font-bold text-[8px] text-white bg-black/80 px-1 rounded">
                    Z{zone.phase}
                  </span>
                </div>
              ))}

              {/* User Custom Markers */}
              {markers.map((m) => {
                if (!roleVisibility[m.roleId]) return null;
                return (
                  <div
                    key={m.id}
                    style={{ left: `${m.x}%`, top: `${m.y}%` }}
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary border-2 border-white flex items-center justify-center shadow">
                      <Target className="w-3 h-3 text-black" />
                    </div>
                    <span className="absolute left-1/2 -translate-x-1/2 top-6 bg-black border border-hairline px-1 py-0.2 text-[8px] font-display text-white uppercase rounded whitespace-nowrap">
                      {m.label}
                    </span>
                  </div>
                );
              })}

              {/* Canvas Overlay */}
              <canvas
                ref={canvasRef}
                style={{ touchAction: "none" }}
                className="absolute inset-0 w-full h-full z-[5] pointer-events-none"
              />
            </div>
          </div>

          {/* Mobile Quick-Toolbar for Instant Phone Access */}
          <div className="lg:hidden flex flex-col gap-2 p-2.5 bg-panel border border-hairline rounded-lg shadow-lg">
            {/* Quick Tools */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
              {[
                { id: "pencil", label: "Draw", icon: Paintbrush },
                { id: "arrow", label: "Arrow", icon: ArrowRight },
                { id: "circle", label: "Circle", icon: Circle },
                { id: "line", label: "Line", icon: Minus },
                { id: "marker", label: "Pin", icon: MapPin },
                { id: "pan", label: "Pan", icon: Navigation }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTool(t.id as ToolMode)}
                  className={`flex-1 py-2 px-1.5 border text-[9px] font-display font-black uppercase flex flex-col items-center justify-center gap-1 rounded transition-all min-w-[50px] ${
                    activeTool === t.id
                      ? "border-primary bg-primary text-black shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                      : "border-hairline text-text-muted hover:text-white bg-panel-raised"
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Roles & Undo */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-hairline">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-display text-text-muted uppercase">Role:</span>
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setActiveRole(r)}
                    style={{
                      backgroundColor: r.color,
                      boxShadow: activeRole.id === r.id ? `0 0 10px ${r.color}` : "none"
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      activeRole.id === r.id ? "border-white scale-110" : "border-transparent opacity-70"
                    }`}
                    title={r.name}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className="px-2 py-1 bg-panel-raised border border-hairline text-[9px] font-display font-bold uppercase rounded text-text-muted hover:text-white disabled:opacity-30 flex items-center gap-1"
                >
                  <Undo className="w-3 h-3" /> Undo
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-2 py-1 bg-panel-raised border border-hairline text-[9px] font-display font-bold uppercase rounded text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
