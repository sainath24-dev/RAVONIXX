import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

export const dynamic = "force-dynamic";

// In-memory Rate Limiter: IP -> { count, expiresAt }
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_FEEDBACK_PER_WINDOW = 5; // Max 5 submissions per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_FEEDBACK_PER_WINDOW) {
    return true;
  }

  record.count += 1;
  return false;
}

const feedbackSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  role: z.string().trim().max(50).default("Community Member"),
  avatarUrl: z.string().trim().max(200).default("/character/kelly.jpeg"),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(5, "Feedback message must be at least 5 characters").max(1000),
});

function sanitizeForDiscord(text: string): string {
  return text
    .replace(/@everyone/g, "@\u200beveryone")
    .replace(/@here/g, "@\u200bhere")
    .replace(/<@&?\d+>/g, "[mention]");
}

export async function POST(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many feedback submissions. Please wait a minute before submitting again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = feedbackSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid feedback payload", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn("DISCORD_WEBHOOK_URL not configured. Feedback recorded in local state only.");
      return NextResponse.json({ success: true, message: "Feedback recorded successfully" });
    }

    const payload = {
      username: "RAVONIXX Community Voice",
      embeds: [
        {
          title: "💬 New Player Feedback & Review",
          description: `**"${sanitizeForDiscord(data.text)}"**`,
          color: 16766720, // Gold / Yellow
          fields: [
            { name: "👤 Player / Creator", value: sanitizeForDiscord(data.name), inline: true },
            { name: "🏷️ Role", value: sanitizeForDiscord(data.role), inline: true },
            { name: "⭐ Rating", value: `${"★".repeat(data.rating)} (${data.rating}/5)`, inline: true },
          ],
          footer: { text: "RAVONIXX Esports Community Wall • ravonixx.xyz" },
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
      console.error("Discord feedback dispatch failed with status:", discordRes.status);
    }

    return NextResponse.json({ success: true, message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Internal server error processing feedback" },
      { status: 500 }
    );
  }
}
