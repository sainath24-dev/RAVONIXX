import { NextResponse } from "next/server";
import { listPublicTournaments } from "@/lib/tournaments/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tournaments = await listPublicTournaments();
    return NextResponse.json({ success: true, tournaments });
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return NextResponse.json(
      { error: "Failed to fetch tournaments" },
      { status: 500 }
    );
  }
}
