import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticatedRequest } from "@/lib/tournaments/auth";
import { getTournamentById, getRegistrationsByTournamentId } from "@/lib/tournaments/repository";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthenticatedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tournament = await getTournamentById(params.id);
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const allRegistrations = await getRegistrationsByTournamentId(params.id);

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const statusFilter = searchParams.get("status") || "ALL";
    const sortBy = searchParams.get("sortBy") || "regNo";
    const sortDir = searchParams.get("sortDir") === "desc" ? -1 : 1;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Apply filtering
    let filtered = allRegistrations.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) {
        return false;
      }

      if (!search) return true;

      const teamMatch = r.teamName.toLowerCase().includes(search);
      const captainMatch =
        r.captain.name.toLowerCase().includes(search) ||
        r.captain.ign.toLowerCase().includes(search) ||
        r.captain.uid.toLowerCase().includes(search);
      const playersMatch = r.players.some(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.uid.toLowerCase().includes(search)
      );
      const subMatch =
        r.substitute &&
        (r.substitute.name.toLowerCase().includes(search) ||
          r.substitute.uid.toLowerCase().includes(search));
      const contactMatch =
        r.contact.phone.toLowerCase().includes(search) ||
        r.contact.email.toLowerCase().includes(search);
      const regNoMatch = String(r.registrationNumber).includes(search);

      return (
        teamMatch ||
        captainMatch ||
        playersMatch ||
        subMatch ||
        contactMatch ||
        regNoMatch
      );
    });

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          sortDir
        );
      }
      if (sortBy === "teamName") {
        return a.teamName.localeCompare(b.teamName) * sortDir;
      }
      return (a.registrationNumber - b.registrationNumber) * sortDir;
    });

    // Pagination
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const paginatedRegistrations = filtered.slice(
      (currentPage - 1) * limit,
      currentPage * limit
    );

    return NextResponse.json({
      success: true,
      tournament: {
        id: tournament.id,
        title: tournament.title,
        slug: tournament.slug,
        gameName: tournament.gameName,
        format: tournament.format,
        maxTeams: tournament.maxTeams,
        status: tournament.status,
      },
      stats: {
        totalRegistered: allRegistrations.length,
        maxSlots: tournament.maxTeams || null,
        slotsRemaining: tournament.maxTeams
          ? Math.max(0, tournament.maxTeams - allRegistrations.length)
          : null,
      },
      pagination: {
        totalCount,
        totalPages,
        currentPage,
        limit,
      },
      registrations: paginatedRegistrations,
    });
  } catch (error) {
    console.error("Admin get registrations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
