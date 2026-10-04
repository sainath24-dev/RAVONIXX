import { NextRequest, NextResponse } from "next/server";
import { getTournamentDetailBySlug } from "@/lib/tournaments/service";
import { isAdminAuthenticatedRequest } from "@/lib/tournaments/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const isAdmin = isAdminAuthenticatedRequest(req);
    const tournament = await getTournamentDetailBySlug(slug, isAdmin);

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, tournament });
  } catch (error) {
    console.error("Error fetching tournament detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch tournament detail" },
      { status: 500 }
    );
  }
}
