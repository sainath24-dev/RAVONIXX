import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticatedRequest } from "@/lib/tournaments/auth";
import { getTournamentById, updateTournament, deleteTournament } from "@/lib/tournaments/repository";
import { tournamentUpsertSchema } from "@/lib/tournaments/types";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthenticatedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tournament = await getTournamentById(params.id);
  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, tournament });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthenticatedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = tournamentUpsertSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updated = await updateTournament(params.id, parsed.data);
    return NextResponse.json({ success: true, tournament: updated });
  } catch (error: any) {
    console.error("Admin update tournament error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update tournament" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthenticatedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const success = await deleteTournament(params.id);
    if (!success) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Tournament deleted" });
  } catch (error: any) {
    console.error("Admin delete tournament error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete tournament" },
      { status: 500 }
    );
  }
}
