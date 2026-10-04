import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

export const dynamic = "force-dynamic";

// Rate limiting in-memory map: IP -> { count, expiresAt }
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 submissions per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count += 1;
  return false;
}

// Strict Server-side Contact Validation Schema
const contactServerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  ign: z.string().trim().min(2, "IGN must be at least 2 characters").max(50),
  uid: z.string().trim().min(6, "UID must be at least 6 digits").max(20),
  email: z.string().trim().email("Please provide a valid email address").max(150),
  discord: z.string().trim().min(2, "Discord handle is required").max(50),
  region: z.string().trim().min(1, "Please select your region").max(100),
  tier: z.string().trim().min(1, "Please select your division tier").max(100),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(2000),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the RAVONIXX Policies and Code of Conduct",
  }),
});

// Sanitize user text to prevent Discord markdown injection or mass mentions (@everyone / @here)
function sanitizeForDiscord(text: string): string {
  return text
    .replace(/@everyone/g, "@\u200beveryone")
    .replace(/@here/g, "@\u200bhere")
    .replace(/<@&?\d+>/g, "[mention]");
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP Identification for Rate Limiting
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before submitting again." },
        { status: 429 }
      );
    }

    // 2. Body parsing and server-side Zod validation
    const body = await req.json();
    const parseResult = contactServerSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // 3. Webhook URL strictly resolved from server environment
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn("DISCORD_WEBHOOK_URL not configured in server environment.");
      return NextResponse.json({ success: true, message: "Registration recorded successfully" });
    }

    // 4. Construct Safe Embed Payload
    const payload = {
      username: "RAVONIXX Player Dispatch",
      embeds: [
        {
          title: "🎯 New Player / Scrim Dossier Registration",
          description: "A new registration has been received on **ravonixx.xyz**.",
          color: 11026687, // Purple accent (#A855F7)
          fields: [
            { name: "👤 Real Name", value: sanitizeForDiscord(data.name), inline: true },
            { name: "🎮 Free Fire IGN", value: `\`${sanitizeForDiscord(data.ign)}\``, inline: true },
            { name: "🆔 Free Fire UID", value: `\`${sanitizeForDiscord(data.uid)}\``, inline: true },
            { name: "📱 Discord Tag", value: `\`${sanitizeForDiscord(data.discord)}\``, inline: true },
            { name: "📧 Email", value: sanitizeForDiscord(data.email), inline: true },
            { name: "🌍 Server Region", value: sanitizeForDiscord(data.region), inline: true },
            { name: "🏆 Division Tier", value: sanitizeForDiscord(data.tier), inline: true },
            { name: "💬 Message / Scrim Inquiry", value: sanitizeForDiscord(data.message), inline: false },
            { name: "📜 Terms & Conditions", value: "✅ Agreed to RAVONIXX Code of Conduct & Policies", inline: false },
          ],
          footer: {
            text: "RAVONIXX Esports & Consultancy • ravonixx.xyz",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const discordRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!discordRes.ok) {
      console.error("Discord webhook dispatch error status:", discordRes.status);
      return NextResponse.json(
        { error: "Failed to dispatch notification to team" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: "Registration dispatched successfully" });
  } catch (error) {
    console.error("Contact API internal error:", error);
    return NextResponse.json(
      { error: "Internal server error processing registration" },
      { status: 500 }
    );
  }
}
