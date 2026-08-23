import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all map assets and drone views from unauthorized scraping and external hotlinking
  if (pathname.startsWith("/images/maps/") || pathname.startsWith("/maps/")) {
    const referer = request.headers.get("referer");
    const secFetchSite = request.headers.get("sec-fetch-site");
    const host = request.headers.get("host");

    // Allow requests originating from the same host / origin
    const isSameOriginSec = secFetchSite === "same-origin" || secFetchSite === "same-site";
    
    let isSameOriginReferer = false;
    if (referer && host) {
      try {
        const refererUrl = new URL(referer);
        if (refererUrl.host === host) {
          isSameOriginReferer = true;
        }
      } catch {
        isSameOriginReferer = false;
      }
    }

    // Block if neither same-origin referer nor same-origin sec-fetch-site header is present
    if (!isSameOriginReferer && !isSameOriginSec) {
      return new NextResponse(
        JSON.stringify({
          error: "Forbidden",
          message: "RAVONIXX Proprietary Tactical Assets. Direct access, unauthorized scraping, and external hotlinking are strictly prohibited."
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            "X-Content-Type-Options": "nosniff",
            "Cross-Origin-Resource-Policy": "same-origin",
            "Cache-Control": "no-store"
          }
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    response.headers.set("Cache-Control", "private, no-transform, max-age=86400");
    response.headers.set("X-Content-Type-Options", "nosniff");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/images/maps/:path*", "/maps/:path*"],
};
