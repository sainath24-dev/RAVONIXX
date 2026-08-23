"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { 
  ZoomIn, ZoomOut, RotateCcw, Paintbrush, MapPin, Trash2, 
  Download, Eye, EyeOff, Undo, Shield, Target,
  ArrowRight, Circle, Minus, Play, RefreshCw,
  Navigation, Upload, Save, ChevronLeft, ChevronRight,
  MessageSquare, Layers, Flag, Flame, ShoppingCart,
  Edit2, Check, Grid
} from "lucide-react";
import { MAPS_DATABASE } from "@/lib/mapData";

// MARKER CONFIGURATIONS WITH DISTINCT COLORS & ICONS
type MarkerType = "spawn" | "enemy" | "sniper" | "gloo" | "vending" | "rotation";

interface MarkerConfig {
  id: MarkerType;
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const MARKER_CONFIGS: Record<MarkerType, MarkerConfig> = {
  spawn: {
    id: "spawn",
    label: "Spawn / Drop",
    color: "#10B981",
    icon: Flag
  },
  enemy: {
    id: "enemy",
    label: "Enemy Contact",
    color: "#EF4444",
    icon: Flame
  },
  sniper: {
    id: "sniper",
    label: "Sniper Vantage",
    color: "#06B6D4",
    icon: Target
  },
  gloo: {
    id: "gloo",
    label: "Gloo Defense",
    color: "#F59E0B",
    icon: Shield
  },
  vending: {
    id: "vending",
    label: "Loot / Arsenal",
    color: "#A855F7",
    icon: ShoppingCart
  },
  rotation: {
    id: "rotation",
    label: "Rotation Route",
    color: "#3B82F6",
    icon: Navigation
  }
};

// CUSTOM SQUAD ROSTER
interface PlayerSlot {
  id: string;
  name: string;
  color: string;
  visible: boolean;
}

const DEFAULT_SQUAD: PlayerSlot[] = [
  { id: "p1", name: "Player 1 (IGL)", color: "#00F0FF", visible: true },
  { id: "p2", name: "Player 2 (Sniper)", color: "#D800FF", visible: true },
  { id: "p3", name: "Player 3 (Rusher)", color: "#39FF14", visible: true },
  { id: "p4", name: "Player 4 (Support)", color: "#FF5500", visible: true }
];

const COLOR_PALETTE = [
  "#00F0FF", "#D800FF", "#39FF14", "#FF5500", 
  "#FFCC00", "#FF0055", "#3B82F6", "#FFFFFF"
];

type ToolMode = "pencil" | "arrow" | "line" | "circle" | "marker" | "pan";

interface Point {
  x: number;
  y: number;
}

interface TacticalPath {
  id: string;
  type: "pencil" | "arrow" | "line" | "circle";
  points: Point[];
  color: string;
  width: number;
  playerId: string;
}

interface TacticalMarker {
  id: string;
  x: number;
  y: number;
  type: MarkerType;
  label: string;
  playerId: string;
  color: string;
}

interface SafeZoneCircle {
  phase: number;
  x: number;
  y: number;
  radius: number;
}

interface ActionHistory {
  type: "path" | "marker";
  id: string;
}

interface BoardViewData {
  paths: TacticalPath[];
  markers: TacticalMarker[];
  history: ActionHistory[];
}

const GRID_COLS = ["B", "C", "D", "E", "F", "G", "H"];
const GRID_ROWS = ["J", "K", "L", "M", "N", "O", "P"];

export default function StrategyPage() {
  const mapList = Object.values(MAPS_DATABASE);
  const [selectedMapId, setSelectedMapId] = useState<string>("bermuda");
  const activeMap = MAPS_DATABASE[selectedMapId] || MAPS_DATABASE["bermuda"];

  // Location & Drone View Selection
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedViewIndex, setSelectedViewIndex] = useState<number>(0);

  // Custom Squad Roster
  const [squad, setSquad] = useState<PlayerSlot[]>(DEFAULT_SQUAD);
  const [activePlayerId, setActivePlayerId] = useState<string>("p1");
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editPlayerName, setEditPlayerName] = useState<string>("");

  const activePlayer = squad.find(p => p.id === activePlayerId) || squad[0];

  // Isolated Board Storage per View
  const [boardStore, setBoardStore] = useState<Record<string, BoardViewData>>({});

  // Viewport Zoom & Pan
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Tools
  const [activeTool, setActiveTool] = useState<ToolMode>("pencil");
  const [activeMarkerType, setActiveMarkerType] = useState<MarkerType>("spawn");
  const [markerLabel, setMarkerLabel] = useState("");
  const [activeTab, setActiveTab] = useState<"tools" | "squad" | "zones" | "presets">("tools");

  // Safe Zone Simulator
  const [safeZonePhase, setSafeZonePhase] = useState<number>(0);
  const [safeZones, setSafeZones] = useState<SafeZoneCircle[]>([]);

  // Grid
  const [showCoordinateGrid, setShowCoordinateGrid] = useState<boolean>(true);

  // Discussion & Tactical Notes
  const [discussionNotes, setDiscussionNotes] = useState<Record<string, string>>({});

  // Presets
  const [savedPresets, setSavedPresets] = useState<{ id: string; name: string; mapId: string; date: string; data: string }[]>([]);
  const [newPresetName, setNewPresetName] = useState("");

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawPoints, setCurrentDrawPoints] = useState<Point[]>([]);
  const [isPanning, setIsPanning] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const locations = activeMap.locations || [];
  const activeLocation = locations.find(l => l.id === selectedLocationId);

  // Unique key for the current view
  const currentViewKey = `${selectedMapId}_${selectedLocationId || "2d"}_v${selectedLocationId ? selectedViewIndex : 0}`;

  // Active board state for this specific view
  const currentBoard: BoardViewData = boardStore[currentViewKey] || { paths: [], markers: [], history: [] };
  const paths = currentBoard.paths;
  const markers = currentBoard.markers;
  const history = currentBoard.history;

  // Active display image
  const activeDisplaySrc = activeLocation && activeLocation.droneViews[selectedViewIndex]
    ? activeLocation.droneViews[selectedViewIndex]
    : activeMap.src;
  const isDroneView = Boolean(activeLocation && activeLocation.droneViews[selectedViewIndex]);

  // Load saved session on mount & register anti-tamper console banner
  useEffect(() => {
    try {
      const storedSquad = localStorage.getItem("rvx_squad_roster");
      if (storedSquad) setSquad(JSON.parse(storedSquad));
      const storedPresets = localStorage.getItem("rvx_tactical_presets");
      if (storedPresets) setSavedPresets(JSON.parse(storedPresets));
      const storedNotes = localStorage.getItem("rvx_tactical_discussion");
      if (storedNotes) setDiscussionNotes(JSON.parse(storedNotes));
      const storedBoards = localStorage.getItem("rvx_board_drawings");
      if (storedBoards) setBoardStore(JSON.parse(storedBoards));

      if (typeof window !== "undefined") {
        console.log(
          "%c🛡️ RAVONIXX SECURE TACTICAL ENGINE\n%cAll 3D aerial drone views and tactical map assets are proprietary and protected under RAVONIXX copyright. Unauthorized scraping, extraction, or redistribution is strictly monitored and prohibited.",
          "color: #00F0FF; font-size: 14px; font-weight: bold; font-family: monospace;",
          "color: #A1A1AA; font-size: 11px; font-family: monospace;"
        );
      }
    } catch {
      // ignore
    }
  }, []);

  // Helper to update current view's drawings
  const updateCurrentBoard = useCallback((updater: (prev: BoardViewData) => BoardViewData) => {
    setBoardStore((prevStore) => {
      const existing = prevStore[currentViewKey] || { paths: [], markers: [], history: [] };
      const updated = updater(existing);
      const newStore = { ...prevStore, [currentViewKey]: updated };
      try {
        localStorage.setItem("rvx_board_drawings", JSON.stringify(newStore));
      } catch {
        // ignore
      }
      return newStore;
    });
  }, [currentViewKey]);

  // Player Roster management
  const handleSavePlayerName = (playerId: string) => {
    if (!editPlayerName.trim()) {
      setEditingPlayerId(null);
      return;
    }
    const updated = squad.map(p => p.id === playerId ? { ...p, name: editPlayerName.trim() } : p);
    setSquad(updated);
    setEditingPlayerId(null);
    try {
      localStorage.setItem("rvx_squad_roster", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleUpdatePlayerColor = (playerId: string, color: string) => {
    const updated = squad.map(p => p.id === playerId ? { ...p, color } : p);
    setSquad(updated);
    try {
      localStorage.setItem("rvx_squad_roster", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const togglePlayerVisibility = (playerId: string) => {
    const updated = squad.map(p => p.id === playerId ? { ...p, visible: !p.visible } : p);
    setSquad(updated);
    try {
      localStorage.setItem("rvx_squad_roster", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Discussion Notes per Map / Location
  const currentNoteKey = `${selectedMapId}_${selectedLocationId || "overview"}`;
  const currentNote = discussionNotes[currentNoteKey] || "";

  const handleUpdateNote = (text: string) => {
    const updated = { ...discussionNotes, [currentNoteKey]: text };
    setDiscussionNotes(updated);
    try {
      localStorage.setItem("rvx_tactical_discussion", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Zoom button controls (no wheel scrolling)
  const handleZoomIn = () => setZoom(z => Math.min(Number((z + 0.25).toFixed(2)), 3.0));
  const handleZoomOut = () => {
    setZoom(z => {
      const nextZ = Math.max(Number((z - 0.25).toFixed(2)), 1.0);
      if (nextZ === 1) setPan({ x: 0, y: 0 });
      return nextZ;
    });
  };
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Map & Location Navigation
  const handleSelectMap = (mapId: string) => {
    setSelectedMapId(mapId);
    setSelectedLocationId(null);
    setSelectedViewIndex(0);
    handleResetZoom();
  };

  const handleSelectLocation = (locId: string | null) => {
    setSelectedLocationId(locId);
    setSelectedViewIndex(0);
    handleResetZoom();
  };

  // Safe Zone Simulator
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

  // Canvas Vector Drawing Helpers
  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string, width: number) => {
    const headLen = 16;
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

    ctx.clearRect(0, 0, 1000, 1000);

    const playerVisibilityMap = squad.reduce<Record<string, boolean>>((acc, p) => {
      acc[p.id] = p.visible;
      return acc;
    }, {});

    // Saved Paths for this view in 1000x1000 space
    paths.forEach((p) => {
      if (playerVisibilityMap[p.playerId] === false) return;
      if (p.points.length < 2) return;

      ctx.save();
      ctx.strokeStyle = p.color;
      ctx.fillStyle = p.color;
      ctx.lineWidth = p.width || 3.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (p.type === "pencil") {
        ctx.beginPath();
        ctx.moveTo(p.points[0].x, p.points[0].y);
        for (let i = 1; i < p.points.length; i++) ctx.lineTo(p.points[i].x, p.points[i].y);
        ctx.stroke();
      } else if (p.type === "line") {
        ctx.beginPath();
        ctx.moveTo(p.points[0].x, p.points[0].y);
        ctx.lineTo(p.points[p.points.length - 1].x, p.points[p.points.length - 1].y);
        ctx.stroke();
      } else if (p.type === "arrow") {
        drawArrow(ctx, p.points[0].x, p.points[0].y, p.points[p.points.length - 1].x, p.points[p.points.length - 1].y, p.color, p.width || 3.5);
      } else if (p.type === "circle") {
        const start = p.points[0];
        const end = p.points[p.points.length - 1];
        const radius = Math.hypot(end.x - start.x, end.y - start.y);
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });

    // Active Drawing preview
    if (isDrawing && currentDrawPoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = activePlayer.color;
      ctx.fillStyle = activePlayer.color;
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (activeTool === "pencil") {
        ctx.beginPath();
        ctx.moveTo(currentDrawPoints[0].x, currentDrawPoints[0].y);
        for (let i = 1; i < currentDrawPoints.length; i++) ctx.lineTo(currentDrawPoints[i].x, currentDrawPoints[i].y);
        ctx.stroke();
      } else if (activeTool === "line") {
        ctx.beginPath();
        ctx.moveTo(currentDrawPoints[0].x, currentDrawPoints[0].y);
        ctx.lineTo(currentDrawPoints[currentDrawPoints.length - 1].x, currentDrawPoints[currentDrawPoints.length - 1].y);
        ctx.stroke();
      } else if (activeTool === "arrow") {
        drawArrow(ctx, currentDrawPoints[0].x, currentDrawPoints[0].y, currentDrawPoints[currentDrawPoints.length - 1].x, currentDrawPoints[currentDrawPoints.length - 1].y, activePlayer.color, 3.5);
      } else if (activeTool === "circle") {
        const start = currentDrawPoints[0];
        const end = currentDrawPoints[currentDrawPoints.length - 1];
        const radius = Math.hypot(end.x - start.x, end.y - start.y);
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [paths, isDrawing, currentDrawPoints, activeTool, activePlayer, squad]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Center-based Coordinate Calculation (supports Button Zoom)
  const getCoordinates = (clientX: number, clientY: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return { canvasX: 0, canvasY: 0, normX: 0, normY: 0 };
    const rect = viewport.getBoundingClientRect();

    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const contentX = (relX - cx - pan.x) / zoom + cx;
    const contentY = (relY - cy - pan.y) / zoom + cy;

    const normX = Math.min(Math.max((contentX / rect.width) * 100, 0), 100);
    const normY = Math.min(Math.max((contentY / rect.height) * 100, 0), 100);

    const canvasX = (normX / 100) * 1000;
    const canvasY = (normY / 100) * 1000;

    return { canvasX, canvasY, normX, normY };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (activeTool === "pan") {
      setIsPanning(true);
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    if (activeTool === "marker") {
      const { normX, normY } = getCoordinates(e.clientX, e.clientY);
      const markerId = Math.random().toString(36).substring(2, 9);
      const markerCfg = MARKER_CONFIGS[activeMarkerType];
      const newMarker: TacticalMarker = {
        id: markerId,
        x: normX,
        y: normY,
        type: activeMarkerType,
        label: markerLabel.trim() || `${activePlayer.name}: ${markerCfg.label}`,
        playerId: activePlayer.id,
        color: markerCfg.color
      };

      updateCurrentBoard(prev => ({
        ...prev,
        markers: [...prev.markers, newMarker],
        history: [...prev.history, { type: "marker", id: markerId }]
      }));
      setMarkerLabel("");
    } else {
      const { canvasX, canvasY } = getCoordinates(e.clientX, e.clientY);
      setIsDrawing(true);
      setCurrentDrawPoints([{ x: canvasX, y: canvasY }]);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activeTool === "pan") {
      if (isPanning) {
        setPan({
          x: e.clientX - dragStartRef.current.x,
          y: e.clientY - dragStartRef.current.y
        });
      }
      return;
    }

    if (!isDrawing) return;
    const { canvasX, canvasY } = getCoordinates(e.clientX, e.clientY);
    setCurrentDrawPoints(prev => [...prev, { x: canvasX, y: canvasY }]);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (activeTool === "pan") {
      setIsPanning(false);
      return;
    }

    if (isDrawing) {
      setIsDrawing(false);
      if (currentDrawPoints.length > 1) {
        const pathId = Math.random().toString(36).substring(2, 9);
        const newPath: TacticalPath = {
          id: pathId,
          type: activeTool === "pencil" ? "pencil" : activeTool === "arrow" ? "arrow" : activeTool === "circle" ? "circle" : "line",
          points: currentDrawPoints,
          color: activePlayer.color,
          width: 3.5,
          playerId: activePlayer.id
        };

        updateCurrentBoard(prev => ({
          ...prev,
          paths: [...prev.paths, newPath],
          history: [...prev.history, { type: "path", id: pathId }]
        }));
      }
      setCurrentDrawPoints([]);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastAction = history[history.length - 1];

    updateCurrentBoard(prev => {
      let updatedPaths = prev.paths;
      let updatedMarkers = prev.markers;
      if (lastAction.type === "path") {
        updatedPaths = prev.paths.filter(p => p.id !== lastAction.id);
      } else if (lastAction.type === "marker") {
        updatedMarkers = prev.markers.filter(m => m.id !== lastAction.id);
      }
      return {
        ...prev,
        paths: updatedPaths,
        markers: updatedMarkers,
        history: prev.history.slice(0, -1)
      };
    });
  };

  const handleClearCurrentView = () => {
    updateCurrentBoard(() => ({
      paths: [],
      markers: [],
      history: []
    }));
  };

  // Presets Save / Load
  const saveCurrentPreset = () => {
    if (!newPresetName.trim()) return;
    const presetData = {
      viewKey: currentViewKey,
      mapId: selectedMapId,
      locationId: selectedLocationId,
      viewIndex: selectedViewIndex,
      boardStore,
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
    try {
      localStorage.setItem("rvx_tactical_presets", JSON.stringify(updated));
    } catch {
      // ignore
    }
    setNewPresetName("");
  };

  const loadPreset = (presetString: string) => {
    try {
      if (typeof presetString !== "string" || presetString.length > 2 * 1024 * 1024) {
        console.warn("Rejected oversized or invalid preset data");
        return;
      }

      // Check for forbidden prototype pollution keys
      if (presetString.includes("__proto__") || presetString.includes("constructor") || presetString.includes("prototype")) {
        console.warn("Blocked potentially malicious object prototype payload in preset import");
        return;
      }

      const parsed = JSON.parse(presetString);
      if (!parsed || typeof parsed !== "object") return;

      if (typeof parsed.mapId === "string") setSelectedMapId(parsed.mapId);
      if (parsed.locationId === null || typeof parsed.locationId === "string") setSelectedLocationId(parsed.locationId);
      if (typeof parsed.viewIndex === "number" && parsed.viewIndex >= 0 && parsed.viewIndex < 10) setSelectedViewIndex(parsed.viewIndex);
      if (parsed.boardStore && typeof parsed.boardStore === "object" && !Array.isArray(parsed.boardStore)) setBoardStore(parsed.boardStore);
      if (Array.isArray(parsed.safeZones)) setSafeZones(parsed.safeZones);
      if (typeof parsed.safeZonePhase === "number") setSafeZonePhase(parsed.safeZonePhase);
    } catch {
      // ignore parse errors
    }
  };

  const deletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updated);
    try {
      localStorage.setItem("rvx_tactical_presets", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const exportPresetJSON = () => {
    const presetData = {
      mapId: selectedMapId,
      locationId: selectedLocationId,
      viewIndex: selectedViewIndex,
      boardStore,
      safeZones,
      safeZonePhase
    };
    const blob = new Blob([JSON.stringify(presetData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `ravonixx_${selectedMapId}_playbook.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Enforce 2MB Maximum File Size Ceiling
    if (file.size > 2 * 1024 * 1024) {
      alert("Selected JSON file exceeds maximum allowed size of 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) loadPreset(content);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const downloadPlanImage = () => {
    const mergeCanvas = document.createElement("canvas");
    mergeCanvas.width = 1200;
    mergeCanvas.height = 1200;
    const ctx = mergeCanvas.getContext("2d");
    if (!ctx) return;

    const playerVisibilityMap = squad.reduce<Record<string, boolean>>((acc, p) => {
      acc[p.id] = p.visible;
      return acc;
    }, {});

    const img = new window.Image();
    img.src = activeDisplaySrc;
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
        if (playerVisibilityMap[p.playerId] === false) return;
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

      // Distinct Markers
      markers.forEach((m) => {
        if (playerVisibilityMap[m.playerId] === false) return;
        const mx = (m.x / 100) * 1200;
        const my = (m.y / 100) * 1200;
        
        ctx.beginPath();
        ctx.arc(mx, my, 18, 0, Math.PI * 2);
        ctx.fillStyle = m.color;
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = "bold 13px sans-serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(m.label, mx + 24, my + 5);
      });

      const link = document.createElement("a");
      link.download = `ravonixx_${selectedMapId}_${selectedLocationId ? `${selectedLocationId}_view${selectedViewIndex + 1}` : "tactical"}.png`;
      link.href = mergeCanvas.toDataURL();
      link.click();
    };
  };

  const playerVisibilityMap = squad.reduce<Record<string, boolean>>((acc, p) => {
    acc[p.id] = p.visible;
    return acc;
  }, {});

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full max-w-[1900px] mx-auto px-4 sm:px-8 lg:px-12 py-8 flex flex-col gap-8 min-h-[90vh] select-none"
    >
      {/* Background Texture Asset */}
      <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-screen -z-0">
        <Image
          src="/design_assets/randomstyle1.jpeg"
          alt="Tactics backdrop"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      
      {/* 3-TIER TACTICAL NAVIGATION SYSTEM */}
      <div className="flex flex-col gap-5 pb-6 border-b border-hairline w-full">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-panel border border-hairline rounded-lg shadow-sm">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-wider text-text-primary">
                {activeMap.name} Strategy Board
              </h1>
              <p className="text-xs sm:text-sm font-mono text-text-muted mt-0.5">
                Active Display: <strong className="text-white uppercase">{activeLocation ? `${activeLocation.name} (Drone Angle ${selectedViewIndex + 1}/${activeLocation.droneViews.length})` : `${activeMap.name} 2D Tactical Map`}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* TIER 1: MAPS SELECTOR */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-text-muted">
              Tier 1: Battleground Map
            </span>
            <span className="text-xs font-mono text-text-dim">6 Maps Available</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 w-full">
            {mapList.map((m) => {
              const isActive = selectedMapId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectMap(m.id)}
                  className={`group relative flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border text-left transition-all duration-150 ${
                    isActive
                      ? "bg-zinc-800 border-white text-white scale-[1.02] z-10"
                      : "bg-panel/80 hover:bg-panel-raised border-hairline hover:border-white/40 text-text-muted hover:text-white"
                  }`}
                >
                  <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 border ${
                    isActive ? "border-white" : "border-hairline group-hover:border-white/30"
                  }`}>
                    <Image
                      src={m.src}
                      alt={m.name}
                      fill
                      sizes="60px"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      className="object-cover pointer-events-none select-none"
                    />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className={`font-display font-black text-sm sm:text-base uppercase tracking-wider truncate ${
                      isActive ? "text-white" : "text-text-muted group-hover:text-white"
                    }`}>
                      {m.name}
                    </span>
                    <span className="text-[11px] font-mono text-text-dim truncate mt-0.5">
                      {m.locations?.length || 0} Drop Zones
                    </span>
                  </div>

                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TIER 2: LOCATIONS RIBBON */}
        {locations.length > 0 && (
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>
                  Tier 2: Locations & Hotspots in <strong className="text-white">{activeMap.name}</strong>
                </span>
              </span>
              <span className="text-xs font-mono text-text-dim">
                {locations.length} Hotspots
              </span>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 w-full">
              {/* Full 2D Map Pill */}
              <button
                onClick={() => handleSelectLocation(null)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-display font-bold uppercase tracking-wide whitespace-nowrap border transition-all flex-shrink-0 ${
                  selectedLocationId === null
                    ? "bg-white text-black border-white font-black"
                    : "bg-panel hover:bg-zinc-800 border-hairline hover:border-white/40 text-text-muted hover:text-white"
                }`}
              >
                <span>Full 2D Map</span>
              </button>

              {/* Location Pills */}
              {locations.map((loc) => {
                const isLocActive = selectedLocationId === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => handleSelectLocation(loc.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-display font-bold uppercase tracking-wide whitespace-nowrap border transition-all flex-shrink-0 ${
                      isLocActive
                        ? "bg-zinc-800 text-white border-white font-black scale-[1.02]"
                        : "bg-panel hover:bg-zinc-800 border-hairline hover:border-white/40 text-text-muted hover:text-white"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isLocActive ? "bg-cyan-400" : "bg-zinc-600"}`} />
                    <span>{loc.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isLocActive ? "bg-zinc-700 text-white border border-white/20" : "bg-panel-raised text-text-dim"
                    }`}>
                      {loc.droneViews.length}V
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TIER 3: MULTI-ANGLE DRONE VIEWS */}
        {activeLocation && (
          <div className="flex flex-col gap-2.5 pt-2 bg-panel border border-hairline p-4 sm:p-5 rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="text-xs sm:text-sm font-display font-black uppercase text-white tracking-wider">
                  Tier 3: 3D Aerial Drone Angle for <span className="text-cyan-400 underline decoration-cyan-400">{activeLocation.name}</span>
                </span>
              </div>

              <button
                onClick={() => handleSelectLocation(null)}
                className="px-3.5 py-1.5 text-xs font-display font-bold uppercase bg-panel-raised border border-hairline hover:border-white/40 text-text-muted hover:text-white rounded-lg transition-colors self-start sm:self-auto"
              >
                Back to 2D Map
              </button>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap pt-1">
              <button
                onClick={() =>
                  setSelectedViewIndex((prev) =>
                    prev > 0 ? prev - 1 : activeLocation.droneViews.length - 1
                  )
                }
                className="p-3 bg-panel hover:bg-zinc-800 border border-hairline hover:border-white/40 text-text-muted hover:text-white rounded-lg transition-colors"
                title="Previous Drone Angle"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 flex-1">
                {activeLocation.droneViews.map((_, idx) => {
                  const isViewActive = selectedViewIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedViewIndex(idx)}
                      className={`group relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-xs sm:text-sm font-display font-black uppercase tracking-wider transition-all ${
                        isViewActive
                          ? "bg-white text-black border-white scale-[1.02] z-10"
                          : "bg-panel hover:bg-zinc-800 border-hairline hover:border-white/30 text-text-muted hover:text-white"
                      }`}
                    >
                      <span>View {idx + 1}</span>
                      {isViewActive && (
                        <span className="w-2 h-2 rounded-full bg-black ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setSelectedViewIndex((prev) =>
                    prev < activeLocation.droneViews.length - 1 ? prev + 1 : 0
                  )
                }
                className="p-3 bg-panel hover:bg-zinc-800 border border-hairline hover:border-white/40 text-text-muted hover:text-white rounded-lg transition-colors"
                title="Next Drone Angle"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        
        {/* Left Controls */}
        <div className="order-2 lg:order-1 lg:col-span-4 flex flex-col gap-5 w-full">
          
          {/* Tab Navigation */}
          <div className="grid grid-cols-4 bg-panel border border-hairline p-1.5 rounded-xl">
            <button
              onClick={() => setActiveTab("tools")}
              className={`py-2.5 sm:py-3 text-xs sm:text-sm font-display font-bold uppercase rounded-lg transition-colors ${
                activeTab === "tools" ? "bg-white/15 text-white border border-white/30 shadow" : "text-text-muted hover:text-white"
              }`}
            >
              Draw & Pins
            </button>
            <button
              onClick={() => setActiveTab("squad")}
              className={`py-2.5 sm:py-3 text-xs sm:text-sm font-display font-bold uppercase rounded-lg transition-colors ${
                activeTab === "squad" ? "bg-white/15 text-white border border-white/30 shadow" : "text-text-muted hover:text-white"
              }`}
            >
              Squad Roster
            </button>
            <button
              onClick={() => setActiveTab("zones")}
              className={`py-2.5 sm:py-3 text-xs sm:text-sm font-display font-bold uppercase rounded-lg transition-colors ${
                activeTab === "zones" ? "bg-white/15 text-white border border-white/30 shadow" : "text-text-muted hover:text-white"
              }`}
            >
              Safe Zones
            </button>
            <button
              onClick={() => setActiveTab("presets")}
              className={`py-2.5 sm:py-3 text-xs sm:text-sm font-display font-bold uppercase rounded-lg transition-colors ${
                activeTab === "presets" ? "bg-white/15 text-white border border-white/30 shadow" : "text-text-muted hover:text-white"
              }`}
            >
              Save & Export
            </button>
          </div>

          {/* TAB 1: DRAW & PINS */}
          {activeTab === "tools" && (
            <div className="flex flex-col gap-5">
              
              {/* Tool Picker */}
              <div className="bg-panel border border-hairline p-5 rounded-xl flex flex-col gap-4 shadow-sm">
                <span className="text-xs sm:text-sm font-display font-bold text-text-muted uppercase">Tactical Tools</span>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => setActiveTool("pencil")}
                    className={`p-3 border text-xs sm:text-sm font-display font-bold uppercase flex items-center justify-center gap-1.5 rounded-lg transition-colors ${
                      activeTool === "pencil" ? "border-white/60 bg-white/15 text-white shadow" : "border-hairline text-text-muted hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Paintbrush className="w-4 h-4" /> Draw
                  </button>
                  <button
                    onClick={() => setActiveTool("arrow")}
                    className={`p-3 border text-xs sm:text-sm font-display font-bold uppercase flex items-center justify-center gap-1.5 rounded-lg transition-colors ${
                      activeTool === "arrow" ? "border-white/60 bg-white/15 text-white shadow" : "border-hairline text-text-muted hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" /> Arrow
                  </button>
                  <button
                    onClick={() => setActiveTool("line")}
                    className={`p-3 border text-xs sm:text-sm font-display font-bold uppercase flex items-center justify-center gap-1.5 rounded-lg transition-colors ${
                      activeTool === "line" ? "border-white/60 bg-white/15 text-white shadow" : "border-hairline text-text-muted hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Minus className="w-4 h-4" /> Line
                  </button>
                  <button
                    onClick={() => setActiveTool("circle")}
                    className={`p-3 border text-xs sm:text-sm font-display font-bold uppercase flex items-center justify-center gap-1.5 rounded-lg transition-colors ${
                      activeTool === "circle" ? "border-white/60 bg-white/15 text-white shadow" : "border-hairline text-text-muted hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Circle className="w-4 h-4" /> Circle
                  </button>
                  <button
                    onClick={() => setActiveTool("marker")}
                    className={`p-3 border text-xs sm:text-sm font-display font-bold uppercase flex items-center justify-center gap-1.5 rounded-lg transition-colors ${
                      activeTool === "marker" ? "border-white/60 bg-white/15 text-white shadow" : "border-hairline text-text-muted hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <MapPin className="w-4 h-4" /> Pin
                  </button>
                  <button
                    onClick={() => setActiveTool("pan")}
                    className={`p-3 border text-xs sm:text-sm font-display font-bold uppercase flex items-center justify-center gap-1.5 rounded-lg transition-colors ${
                      activeTool === "pan" ? "border-white/60 bg-white/15 text-white shadow" : "border-hairline text-text-muted hover:text-white hover:bg-white/5"
                    }`}
                    title="Drag map to pan when zoomed"
                  >
                    <Navigation className="w-4 h-4" /> Pan
                  </button>
                </div>

                {/* DISTINCT TACTICAL MARKER TYPES */}
                {activeTool === "marker" && (
                  <div className="flex flex-col gap-3 pt-3 border-t border-hairline">
                    <span className="text-xs sm:text-sm font-display font-bold text-text-muted uppercase">
                      Select Distinct Pin Type:
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      {Object.values(MARKER_CONFIGS).map((item) => {
                        const Icon = item.icon;
                        const isMarkerActive = activeMarkerType === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveMarkerType(item.id)}
                            className={`p-3 border rounded-lg text-left flex items-center gap-2.5 transition-all ${
                              isMarkerActive
                                ? "bg-zinc-800 border-white text-white shadow-md scale-[1.02]"
                                : "border-hairline bg-panel-raised/50 text-text-muted hover:text-white hover:border-white/30"
                            }`}
                          >
                            <div 
                              style={{ backgroundColor: `${item.color}25`, borderColor: item.color }} 
                              className="w-7 h-7 rounded-md flex items-center justify-center border flex-shrink-0"
                            >
                              <Icon className="w-4 h-4" style={{ color: item.color }} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-display font-bold uppercase truncate" style={{ color: isMarkerActive ? "#FFFFFF" : item.color }}>
                                {item.label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <input
                      type="text"
                      value={markerLabel}
                      onChange={(e) => setMarkerLabel(e.target.value)}
                      placeholder="Custom Pin Label (Optional)"
                      className="bg-panel-raised border border-hairline p-3 text-xs sm:text-sm font-body text-text-primary rounded-lg focus:outline-none focus:border-white/50"
                    />
                  </div>
                )}
              </div>

              {/* Active Player Selector */}
              <div className="bg-panel border border-hairline p-5 rounded-xl flex flex-col gap-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-display font-bold text-text-muted uppercase">Drawing As:</span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">{activePlayer.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {squad.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setActivePlayerId(p.id)}
                      className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                        activePlayerId === p.id 
                          ? "bg-zinc-800 border-white text-white shadow-sm" 
                          : "border-hairline bg-panel-raised/40 text-text-muted hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span 
                          style={{ backgroundColor: p.color }} 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                        />
                        <span className="text-xs sm:text-sm font-display font-bold truncate">
                          {p.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Board Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className="flex-1 py-3 bg-panel border border-hairline hover:border-white/30 text-text-primary text-xs font-display font-bold uppercase rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                >
                  <Undo className="w-4 h-4" /> Undo Last
                </button>
                <button
                  onClick={handleClearCurrentView}
                  disabled={paths.length === 0 && markers.length === 0}
                  className="flex-1 py-3 bg-panel border border-hairline hover:border-red-500/50 text-red-400 hover:text-red-300 text-xs font-display font-bold uppercase rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" /> Clear View
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: CUSTOM SQUAD ROSTER */}
          {activeTab === "squad" && (
            <div className="flex flex-col gap-5">
              <div className="bg-panel border border-hairline p-5 rounded-xl flex flex-col gap-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-display font-bold text-text-muted uppercase">Custom Squad Lineup</span>
                  <span className="text-xs font-mono text-text-dim">Edit names & colors</span>
                </div>

                <div className="flex flex-col gap-3">
                  {squad.map((p) => {
                    const isEditing = editingPlayerId === p.id;
                    return (
                      <div 
                        key={p.id}
                        className={`p-4 rounded-xl border flex flex-col gap-3 transition-all ${
                          activePlayerId === p.id 
                            ? "bg-zinc-800/90 border-white/60 shadow-md" 
                            : "bg-panel-raised/50 border-hairline"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          {isEditing ? (
                            <div className="flex items-center gap-2.5 flex-1">
                              <input
                                type="text"
                                value={editPlayerName}
                                onChange={(e) => setEditPlayerName(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && handleSavePlayerName(p.id)}
                                className="bg-zinc-900 border border-white/50 px-3 py-1.5 text-xs sm:text-sm text-white rounded-lg flex-1 focus:outline-none"
                              />
                              <button
                                onClick={() => handleSavePlayerName(p.id)}
                                className="p-2 bg-white text-black rounded-lg hover:bg-zinc-200"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <span 
                                style={{ backgroundColor: p.color }} 
                                className="w-3.5 h-3.5 rounded-full flex-shrink-0" 
                              />
                              <span className="font-display font-black text-sm sm:text-base uppercase text-white truncate">
                                {p.name}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingPlayerId(p.id);
                                  setEditPlayerName(p.name);
                                }}
                                className="text-text-muted hover:text-white p-1"
                                title="Rename Player"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => togglePlayerVisibility(p.id)}
                              className={`p-1.5 rounded-lg text-text-muted hover:text-white ${!p.visible ? "opacity-40" : ""}`}
                              title={p.visible ? "Hide player paths" : "Show player paths"}
                            >
                              {p.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-red-400" />}
                            </button>
                          </div>
                        </div>

                        {/* Quick Color Selector */}
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-xs font-mono text-text-dim">Color:</span>
                          {COLOR_PALETTE.map((c) => (
                            <button
                              key={c}
                              onClick={() => handleUpdatePlayerColor(p.id, c)}
                              style={{ backgroundColor: c }}
                              className={`w-5 h-5 rounded-full border transition-transform ${
                                p.color === c ? "border-white scale-125 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SAFE ZONE SIMULATOR */}
          {activeTab === "zones" && (
            <div className="flex flex-col gap-5">
              <div className="bg-panel border border-hairline p-5 rounded-xl flex flex-col gap-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-display font-bold text-text-muted uppercase">Safe Zone Simulator</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-white">
                    {safeZonePhase === 0 ? "Inactive" : `Zone ${safeZonePhase}/5`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={generateNextSafeZone}
                    disabled={safeZonePhase >= 5}
                    className="p-3 bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-display font-bold uppercase flex items-center justify-center gap-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    {safeZonePhase === 0 ? "Spawn Zone 1" : "Next Shift"}
                  </button>
                  <button
                    onClick={resetSafeZones}
                    disabled={safeZonePhase === 0}
                    className="p-3 bg-panel-raised border border-hairline hover:border-white/30 text-text-primary text-xs sm:text-sm font-display font-bold uppercase flex items-center justify-center gap-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" /> Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRESETS & EXPORT */}
          {activeTab === "presets" && (
            <div className="flex flex-col gap-5">
              <div className="bg-panel border border-hairline p-5 rounded-xl flex flex-col gap-3 shadow-sm">
                <span className="text-xs sm:text-sm font-display font-bold text-text-muted uppercase">Save Playbook Plan</span>
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Plan Name (e.g. Finals Drop 1)"
                    className="flex-grow bg-panel-raised border border-hairline p-3 text-xs sm:text-sm font-body text-text-primary rounded-lg focus:outline-none focus:border-white/50"
                  />
                  <button
                    onClick={saveCurrentPreset}
                    disabled={!newPresetName.trim()}
                    className="px-4 bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-display font-bold uppercase rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                </div>
              </div>

              {/* Saved list */}
              <div className="bg-panel border border-hairline p-5 rounded-xl flex flex-col gap-2.5 max-h-[240px] overflow-y-auto shadow-sm">
                <span className="text-xs sm:text-sm font-display font-bold text-text-muted uppercase">
                  Saved Plans ({savedPresets.length})
                </span>
                {savedPresets.length === 0 ? (
                  <span className="text-xs sm:text-sm text-text-muted">No saved plans</span>
                ) : (
                  savedPresets.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => loadPreset(preset.data)}
                      className="p-3 bg-panel-raised/50 border border-hairline hover:border-white/40 flex items-center justify-between rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-display font-bold text-text-primary uppercase">
                          {preset.name}
                        </span>
                        <span className="text-[10px] font-mono text-text-muted">
                          {preset.mapId.toUpperCase()} • {preset.date}
                        </span>
                      </div>
                      <button
                        onClick={(e) => deletePreset(preset.id, e)}
                        className="text-text-muted hover:text-red-500 p-1.5"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Export Buttons */}
              <button
                onClick={downloadPlanImage}
                className="w-full py-3 bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-display font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-2 shadow"
              >
                <Download className="w-4 h-4" /> Export PNG
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={exportPresetJSON}
                  className="py-2.5 px-3 bg-panel border border-hairline hover:border-white/40 text-text-primary text-xs font-display font-bold uppercase rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Export JSON
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 bg-panel border border-hairline hover:border-white/40 text-text-primary text-xs font-display font-bold uppercase rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-4 h-4" /> Import JSON
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

        {/* Right Blackboard Viewport */}
        <div className="order-1 lg:order-2 lg:col-span-8 flex flex-col gap-3.5 relative w-full">
          
          {/* Blackboard Quick Actions & Status Bar */}
          <div className="flex items-center justify-between bg-panel border border-hairline px-4 py-3 rounded-xl text-xs sm:text-sm select-none shadow-sm flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div style={{ backgroundColor: activePlayer.color }} className="w-3 h-3 rounded-full flex-shrink-0" />
              <span className="font-display font-bold text-text-primary uppercase tracking-wider text-xs sm:text-sm">
                {activePlayer.name} • <span className="text-white font-black">{activeTool.toUpperCase()}</span>
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Dedicated Zoom Controls (Button Only - No Wheel Hijacking) */}
              <div className="flex items-center gap-1 bg-panel-raised p-1 rounded-lg border border-hairline">
                <button 
                  onClick={handleZoomIn} 
                  disabled={zoom >= 3.0}
                  className="p-1.5 hover:bg-white/10 rounded text-text-muted hover:text-white disabled:opacity-30 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 text-[11px] font-mono font-bold text-white min-w-[38px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button 
                  onClick={handleZoomOut} 
                  disabled={zoom <= 1.0}
                  className="p-1.5 hover:bg-white/10 rounded text-text-muted hover:text-white disabled:opacity-30 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                {zoom > 1.0 && (
                  <button 
                    onClick={handleResetZoom} 
                    className="p-1.5 hover:bg-white/10 rounded text-cyan-400 hover:text-cyan-300 transition-colors"
                    title="Reset 100% Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="h-5 w-px bg-white/10 mx-0.5 sm:mx-1 hidden sm:block" />

              {/* Grid Toggle */}
              <button 
                onClick={() => setShowCoordinateGrid(!showCoordinateGrid)} 
                className={`px-2.5 py-1.5 border text-xs font-display font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 ${
                  showCoordinateGrid ? "bg-zinc-800 border-white text-white" : "border-hairline text-text-muted hover:text-white"
                }`}
                title="Toggle Grid Lines"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>

              {/* Undo */}
              <button 
                onClick={handleUndo} 
                disabled={history.length === 0}
                className="px-2.5 py-1.5 bg-panel-raised border border-hairline text-xs font-display font-bold uppercase rounded-lg text-text-muted hover:text-white disabled:opacity-30 flex items-center gap-1.5 transition-colors"
                title="Undo last stroke"
              >
                <Undo className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Undo</span>
              </button>

              {/* Clear */}
              <button 
                onClick={handleClearCurrentView} 
                disabled={paths.length === 0 && markers.length === 0}
                className="px-2.5 py-1.5 bg-panel-raised border border-hairline text-xs font-display font-bold uppercase rounded-lg text-red-400 hover:text-red-300 disabled:opacity-30 flex items-center gap-1.5 transition-colors"
                title="Clear current view drawings and markers"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </div>
          </div>

          {/* Map Viewport Canvas Container */}
          <div 
            ref={viewportRef}
            onContextMenu={(e) => e.preventDefault()}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ 
              touchAction: "none",
              cursor: activeTool === "pan" ? (isPanning ? "grabbing" : "grab") : "crosshair"
            }}
            className="relative aspect-square w-full bg-black border border-hairline overflow-hidden rounded-xl select-none shadow-2xl touch-none"
          >
            
            {/* View Mode Indicator Badge */}
            <div className="absolute top-3 right-3 z-20 pointer-events-none bg-black/90 border border-white/20 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-white flex items-center gap-2 shadow-sm">
              {isDroneView ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>{activeLocation?.name} • VIEW {selectedViewIndex + 1}/{activeLocation?.droneViews.length}</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>{activeMap.name} • 2D TACTICAL</span>
                </>
              )}
            </div>

            {/* Top Coordinate Header (B, C, D, E, F, G, H) */}
            {showCoordinateGrid && (
              <div className="absolute top-0 left-7 right-0 h-7 bg-black/60 z-20 flex pointer-events-none border-b border-white/10">
                {GRID_COLS.map((col, idx) => (
                  <div key={idx} className="flex-1 flex items-center justify-center font-mono text-xs font-bold text-white/70">
                    {col}
                  </div>
                ))}
              </div>
            )}

            {/* Left Coordinate Sidebar (J, K, L, M, N, O, P) */}
            {showCoordinateGrid && (
              <div className="absolute top-7 left-0 bottom-0 w-7 bg-black/60 z-20 flex flex-col pointer-events-none border-r border-white/10">
                {GRID_ROWS.map((row, idx) => (
                  <div key={idx} className="flex-1 flex items-center justify-center font-mono text-xs font-bold text-white/70">
                    {row}
                  </div>
                ))}
              </div>
            )}

            {/* Transformed Content Layer */}
            <div
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                transformOrigin: "center center",
                touchAction: "none"
              }}
              className="relative w-full h-full select-none pointer-events-none"
            >
              {/* Map / Drone Image */}
              <div 
                onContextMenu={(e) => e.preventDefault()}
                className="absolute inset-0 select-none pointer-events-none"
              >
                <Image
                  src={activeDisplaySrc}
                  alt={activeLocation ? `${activeLocation.name} - View ${selectedViewIndex + 1}` : activeMap.name}
                  fill
                  priority
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  className="object-cover opacity-95 select-none pointer-events-none"
                  sizes="(max-width: 1024px) 100vw, 950px"
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
                      ? "border-white bg-white/5"
                      : "border-white/30"
                  }`}
                >
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 font-mono font-bold text-[9px] text-white bg-black/80 px-1.5 py-0.5 rounded">
                    Z{zone.phase}
                  </span>
                </div>
              ))}

              {/* Distinct Custom Pins & Markers */}
              {markers.map((m) => {
                if (playerVisibilityMap[m.playerId] === false) return null;
                const markerCfg = MARKER_CONFIGS[m.type] || MARKER_CONFIGS.spawn;
                const Icon = markerCfg.icon;

                return (
                  <div
                    key={m.id}
                    style={{ left: `${m.x}%`, top: `${m.y}%` }}
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group pointer-events-none"
                  >
                    <div 
                      style={{ backgroundColor: m.color, borderColor: "#FFFFFF" }}
                      className="w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-lg"
                    >
                      <Icon className="w-4 h-4 text-black" />
                    </div>
                    <span 
                      style={{ borderColor: m.color }}
                      className="mt-1 bg-black/90 border px-2 py-0.5 text-[10px] font-display font-bold text-white uppercase rounded-md whitespace-nowrap shadow-md"
                    >
                      {m.label}
                    </span>
                  </div>
                );
              })}

              {/* Canvas Overlay with fixed 1000x1000 logical resolution */}
              <canvas
                ref={canvasRef}
                width={1000}
                height={1000}
                style={{ touchAction: "none" }}
                className="absolute inset-0 w-full h-full z-[5] pointer-events-none"
              />
            </div>
          </div>

          {/* Mobile Quick-Toolbar */}
          <div className="lg:hidden flex flex-col gap-3 p-3.5 bg-panel border border-hairline rounded-xl shadow-lg">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
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
                  className={`flex-1 py-2.5 px-2 border text-xs font-display font-black uppercase flex flex-col items-center justify-center gap-1 rounded-lg transition-all min-w-[55px] ${
                    activeTool === t.id
                      ? "border-white/80 bg-white/15 text-white shadow-md"
                      : "border-hairline text-text-muted hover:text-white bg-panel-raised"
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-hairline">
              <div className="flex items-center gap-2 overflow-x-auto">
                {squad.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePlayerId(p.id)}
                    style={{ backgroundColor: p.color }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      activePlayerId === p.id ? "border-white scale-110" : "border-transparent opacity-70"
                    }`}
                    title={p.name}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className="px-3 py-1.5 bg-panel-raised border border-hairline text-xs font-display font-bold uppercase rounded-lg text-text-muted hover:text-white disabled:opacity-30 flex items-center gap-1.5"
                >
                  <Undo className="w-3.5 h-3.5" /> Undo
                </button>
                <button
                  onClick={handleClearCurrentView}
                  className="px-3 py-1.5 bg-panel-raised border border-hairline text-xs font-display font-bold uppercase rounded-lg text-red-400 hover:text-red-300 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* TACTICAL BRIEFING & MATCH DISCUSSION SECTION */}
      <div className="w-full bg-panel border border-hairline p-6 sm:p-8 rounded-xl flex flex-col gap-6 shadow-2xl mt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-panel-raised border border-hairline rounded-lg shadow-sm">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-black text-base sm:text-xl uppercase tracking-wider text-white">
                Tactical Discussion & Match Callouts
              </h2>
              <span className="text-xs sm:text-sm font-mono text-text-muted">
                Active Focus: <strong className="text-white uppercase">{activeLocation ? activeLocation.name : `${activeMap.name} Overview`}</strong>
              </span>
            </div>
          </div>

          {/* Clean Quick Strategy Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-display font-bold uppercase text-text-dim">Tags:</span>
            {[
              "Drop Priority: Tier 1",
              "High Ground Advantage",
              "Choke Point Hold",
              "Fast Rotation Route",
              "Heavy Contest Zone",
              "Arsenal / Vending Secure"
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  const separator = currentNote.length > 0 ? "\n" : "";
                  handleUpdateNote(`${currentNote}${separator}[${tag}]`);
                }}
                className="px-3.5 py-2 text-xs sm:text-sm font-display font-bold uppercase bg-panel-raised hover:bg-zinc-800 border border-hairline hover:border-white/40 text-text-muted hover:text-white rounded-lg transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Discussion Notes Editor */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-display font-bold uppercase text-text-muted">
              Team Callouts & Briefing Notes
            </label>
            <span className="text-xs font-mono text-text-dim">
              Auto-saved for {activeLocation ? activeLocation.name : activeMap.name}
            </span>
          </div>
          <textarea
            value={currentNote}
            onChange={(e) => handleUpdateNote(e.target.value)}
            placeholder={`Write tactical notes, drop assignments, rotation timings, or defensive holds for ${activeLocation ? activeLocation.name : activeMap.name}...`}
            rows={6}
            className="w-full bg-panel-raised border border-hairline hover:border-white/30 focus:border-white/70 p-4 sm:p-5 text-sm sm:text-base font-body text-text-primary rounded-xl focus:outline-none transition-colors resize-y placeholder:text-text-dim shadow-inner"
          />
        </div>
      </div>
    </div>
  );
}
