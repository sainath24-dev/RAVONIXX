import { NextRequest, NextResponse } from "next/server";
import { tournamentRegistrationSchema } from "@/lib/tournaments/types";
import { registerTeamForTournament } from "@/lib/tournaments/service";
import { isRegistrationRateLimited } from "@/lib/tournaments/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // 1. IP extraction and rate-limiting
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (isRegistrationRateLimited(ip)) {
      return NextResponse.json(
        {
          error:
            "Too many registration requests. Please wait a minute before trying again.",
        },
        { status: 429 }
      );
    }

    // 2. Body parsing and honeypot check
    const body = await req.json();

    if (body.hp_website && body.hp_website.length > 0) {
      // Honeypot triggered by bot
      return NextResponse.json(
        { error: "Invalid registration attempt" },
        { status: 400 }
      );
    }

    // 3. Zod schema validation
    const parsed = tournamentRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 4. Service execution (handles dates, slots, duplicate UIDs, duplicate team names)
    const result = await registerTeamForTournament(slug, parsed.data, ip);

    return NextResponse.json({
      success: true,
      message: "Team successfully registered!",
      registration: {
        registrationNumber: result.registration.registrationNumber,
        teamName: result.registration.teamName,
        createdAt: result.registration.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Tournament registration error:", error.message || error);
    return NextResponse.json(
      {
        error: error.message || "An error occurred while processing registration.",
      },
      { status: 400 }
    );
  }
}
