import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticatedRequest } from "@/lib/tournaments/auth";
import { duplicateTournament } from "@/lib/tournaments/service";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthenticatedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const duplicated = await duplicateTournament(params.id);
    return NextResponse.json({ success: true, tournament: duplicated });
  } catch (error: any) {
    console.error("Admin duplicate tournament error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to duplicate tournament" },
      { status: 400 }
    );
  }
}
