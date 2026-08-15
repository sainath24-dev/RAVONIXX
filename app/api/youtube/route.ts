import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const YOUTUBE_API_KEY =
  process.env.YOUTUBE_API_KEY || "AIzaSyCutC_5VK-y8YFU-nKBkEHKPIOr9pwkEMk";

export async function GET(req: NextRequest) {
  try {
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
    )}&maxResults=8&type=video&videoEmbeddable=true&key=${YOUTUBE_API_KEY}`;

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
