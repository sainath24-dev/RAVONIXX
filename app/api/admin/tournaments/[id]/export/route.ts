import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticatedRequest } from "@/lib/tournaments/auth";
import { getTournamentById, getRegistrationsByTournamentId } from "@/lib/tournaments/repository";
import { generateExcelExport, generateCsvExport } from "@/lib/tournaments/export";

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

    const registrations = await getRegistrationsByTournamentId(params.id);

    const searchParams = req.nextUrl.searchParams;
    const format = (searchParams.get("format") || "xlsx").toLowerCase();

    const dateStr = new Date().toISOString().split("T")[0];
    const safeSlug = tournament.slug || "tournament";

    if (format === "csv") {
      const csvData = generateCsvExport(registrations);
      const filename = `${safeSlug}-registrations-${dateStr}.csv`;

      return new NextResponse(csvData, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    // Default: Excel (.xlsx)
    const excelBuffer = generateExcelExport(registrations);
    const filename = `${safeSlug}-registrations-${dateStr}.xlsx`;

    return new NextResponse(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Export registrations error:", error);
    return NextResponse.json(
      { error: "Failed to generate export file" },
      { status: 500 }
    );
  }
}
