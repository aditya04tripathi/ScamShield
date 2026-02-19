import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  const protectedRoutes = [
    "/dashboard",
    "/history",
    "/profile",
    "/scan",
    "/admin",
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  if (session) {
    try {
      await decrypt(session);
      if (request.nextUrl.pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (e) {
      console.error("Middleware Auth Error:", e);
      const response = NextResponse.redirect(
        new URL("/auth/sign-in", request.url),
      );
      response.cookies.delete("session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/history/:path*",
    "/profile/:path*",
    "/scan/:path*",
    "/admin/:path*",
    "/auth/:path*",
  ],
};
