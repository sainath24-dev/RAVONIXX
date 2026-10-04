import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticatedRequest } from "@/lib/tournaments/auth";
import {
  listAdminTournaments,
  createTournament,
} from "@/lib/tournaments/service";
import { tournamentUpsertSchema } from "@/lib/tournaments/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticatedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tournaments = await listAdminTournaments();
    return NextResponse.json({ success: true, tournaments });
  } catch (error) {
    console.error("Admin list tournaments error:", error);
    return NextResponse.json(
      { error: "Failed to list tournaments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticatedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = tournamentUpsertSchema.safeParse(body);

    if (!parsed.success) {
      console.error("Admin tournament validation error:", JSON.stringify(parsed.error.flatten()));
      return NextResponse.json(
        {
          error: "Validation error",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const created = await createTournament(parsed.data);
    return NextResponse.json({ success: true, tournament: created });
  } catch (error: any) {
    console.error("Admin create tournament error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create tournament" },
      { status: 400 }
    );
  }
}
