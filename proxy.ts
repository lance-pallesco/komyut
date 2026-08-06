import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "komyut_super_secret_key_2026",
  });

  const { pathname } = req.nextUrl;

  // Define protected routes requiring authentication
  const protectedRoutes = ["/settings", "/profile/edit", "/create-post", "/bookmarks"];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/settings/:path*",
    "/profile/edit/:path*",
    "/create-post/:path*",
    "/bookmarks/:path*",
  ],
};
