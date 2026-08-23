import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory Sliding Window Rate Limiter
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15; // Max 15 searches per minute per IP

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

export async function GET(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before querying again." },
        { status: 429 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn("YOUTUBE_API_KEY is not configured in server environment.");
      return NextResponse.json(
        { error: "YouTube search service currently unconfigured" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || !query.trim()) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    // Restrict query length to prevent excessive payloads
    const sanitizedQuery = query.trim().slice(0, 100);
    const formattedQuery = `Free Fire Esports ${sanitizedQuery}`;

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      formattedQuery
    )}&maxResults=8&type=video&videoEmbeddable=true&key=${apiKey}`;

    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Cache search queries for 1 hour to optimize quota and performance
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `YouTube API returned status ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("YouTube API route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
