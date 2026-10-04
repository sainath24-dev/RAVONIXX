import { NextResponse } from "next/server";
import { getAllPlayers } from "@/lib/players/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const players = await getAllPlayers();
    return NextResponse.json(players);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}
