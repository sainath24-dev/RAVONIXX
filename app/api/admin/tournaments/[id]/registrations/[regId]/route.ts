import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticatedRequest } from "@/lib/tournaments/auth";
import {
  getRegistrationById,
  updateRegistration,
  deleteRegistration,
} from "@/lib/tournaments/repository";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; regId: string } }
) {
  if (!isAdminAuthenticatedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const registration = await getRegistrationById(params.regId);
  if (!registration || registration.tournamentId !== params.id) {
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, registration });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; regId: string } }
) {
  if (!isAdminAuthenticatedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const registration = await getRegistrationById(params.regId);
    if (!registration || registration.tournamentId !== params.id) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Allowed updates: status, adminRank, adminNotes, teamName, captain, players, substitute, contact
    const allowedUpdates: any = {};
    if (body.status !== undefined) allowedUpdates.status = body.status;
    if (body.adminRank !== undefined) allowedUpdates.adminRank = body.adminRank;
    if (body.adminNotes !== undefined) allowedUpdates.adminNotes = body.adminNotes;
    if (body.teamName !== undefined) allowedUpdates.teamName = body.teamName;
    if (body.captain !== undefined) allowedUpdates.captain = body.captain;
    if (body.players !== undefined) allowedUpdates.players = body.players;
    if (body.substitute !== undefined) allowedUpdates.substitute = body.substitute;
    if (body.contact !== undefined) allowedUpdates.contact = body.contact;

    const updated = await updateRegistration(params.regId, allowedUpdates);
    return NextResponse.json({ success: true, registration: updated });
  } catch (error: any) {
    console.error("Admin update registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update registration" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; regId: string } }
) {
  if (!isAdminAuthenticatedRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const registration = await getRegistrationById(params.regId);
    if (!registration || registration.tournamentId !== params.id) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    const success = await deleteRegistration(params.regId);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete registration" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Registration deleted successfully",
    });
  } catch (error: any) {
    console.error("Admin delete registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete registration" },
      { status: 500 }
    );
  }
}
