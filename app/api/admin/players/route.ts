import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/tournaments/auth";
import { getAllPlayers, createPlayer } from "@/lib/players/repository";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const players = await getAllPlayers();
    return NextResponse.json(players);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.ign || !body.role || !body.uid) {
      return NextResponse.json(
        { error: "IGN, Role, and Free Fire UID are required." },
        { status: 400 }
      );
    }

    const created = await createPlayer({
      ign: body.ign.trim(),
      realName: body.realName?.trim() || body.ign.trim(),
      role: body.role.trim(),
      location: body.location?.trim() || "India",
      uid: body.uid.trim(),
      photoUrl: body.photoUrl?.trim() || "/character/xayne.jpeg",
      hudLayoutImageUrl: body.hudLayoutImageUrl?.trim() || "",
      device: body.device?.trim() || "Mobile",
      loadout: body.loadout || { skills: [], weapons: [] },
      settings: body.settings || {
        generalSens: Number(body.settings?.generalSens) || 100,
        redDotSens: Number(body.settings?.redDotSens) || 100,
        scope2xSens: Number(body.settings?.scope2xSens) || 100,
        scope4xSens: Number(body.settings?.scope4xSens) || 100,
        sniperScopeSens: Number(body.settings?.sniperScopeSens) || 100,
        freeLookSens: Number(body.settings?.freeLookSens) || 100,
        dpi: Number(body.settings?.dpi) || 480,
        controlLayout: body.settings?.controlLayout || "4-finger claw",
        hudCode: body.settings?.hudCode || "",
        gyroscope: Boolean(body.settings?.gyroscope),
      },
      achievements: Array.isArray(body.achievements) ? body.achievements : [],
      socials: body.socials || {},
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create player" }, { status: 500 });
  }
}
