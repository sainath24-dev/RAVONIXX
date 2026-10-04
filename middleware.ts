import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all map assets and drone views from unauthorized scraping and external hotlinking
  if (pathname.startsWith("/images/maps/") || pathname.startsWith("/maps/")) {
    const referer = request.headers.get("referer");
    const secFetchSite = request.headers.get("sec-fetch-site");
    const host = request.headers.get("host") || "";

    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1") || process.env.NODE_ENV !== "production";
    const isSameOriginSec = !secFetchSite || secFetchSite === "same-origin" || secFetchSite === "same-site" || secFetchSite === "none";
    
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

    // In production, block if cross-site hotlinked from external websites
    if (!isLocalhost && !isSameOriginReferer && !isSameOriginSec) {
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
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    response.headers.set("X-Content-Type-Options", "nosniff");
    return response;
  }

  // Admin route protection: redirect unauthenticated visitors to /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminToken = request.cookies.get("ravonixx_admin_token")?.value;
    const isValidTokenFormat = (() => {
      if (!adminToken) return false;
      const parts = adminToken.split(".");
      if (parts.length !== 2) return false;
      const issuedAt = parseInt(parts[0], 10);
      if (isNaN(issuedAt) || Date.now() - issuedAt > 7 * 24 * 60 * 60 * 1000 || Date.now() < issuedAt - 60000) return false;
      if (!/^[a-f0-9]{64}$/i.test(parts[1])) return false;
      return true;
    })();

    if (!isValidTokenFormat) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in with valid token format, redirect /admin/login to /admin/tournaments
  if (pathname === "/admin/login") {
    const adminToken = request.cookies.get("ravonixx_admin_token")?.value;
    if (adminToken && adminToken.includes(".")) {
      const parts = adminToken.split(".");
      const issuedAt = parseInt(parts[0], 10);
      if (!isNaN(issuedAt) && Date.now() - issuedAt <= 7 * 24 * 60 * 60 * 1000) {
        return NextResponse.redirect(new URL("/admin/tournaments", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/images/maps/:path*", "/maps/:path*", "/admin/:path*"],
};

