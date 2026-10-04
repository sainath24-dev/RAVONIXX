import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticatedRequest } from "@/lib/tournaments/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const isAuth = isAdminAuthenticatedRequest(req);
  if (!isAuth) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
