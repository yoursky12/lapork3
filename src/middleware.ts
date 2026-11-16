import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session")?.value;
  const validToken =
    process.env.ADMIN_SESSION_TOKEN || "lapork3_admin_verified_2026";

  if (sessionCookie !== validToken) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};