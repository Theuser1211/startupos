import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/workspace", "/blueprints", "/dashboard", "/competitors", "/brief"];
const PUBLIC_PATHS = ["/auth/sign-in", "/auth/sign-up", "/interview", "/"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path));
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const isGuest = request.cookies.get("startupos-guest")?.value === "true";
  if (isGuest) {
    return NextResponse.next();
  }

  const token = request.cookies.get("startupos-token")?.value;

  if (!token) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  try {
    const payload = decodeJwtPayload(token);
    if (!payload || !payload.userId) {
      const response = NextResponse.redirect(new URL("/auth/sign-in", request.url));
      response.cookies.delete("startupos-token");
      return response;
    }

    const exp = payload.exp as number | undefined;
    if (exp && Date.now() >= exp * 1000) {
      const response = NextResponse.redirect(new URL("/auth/sign-in?expired=1", request.url));
      response.cookies.delete("startupos-token");
      return response;
    }

    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.userId as string);
    response.headers.set("x-user-email", payload.email as string);
    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/auth/sign-in?expired=1", request.url));
    response.cookies.delete("startupos-token");
    return response;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    "/workspace/:path*",
    "/blueprints/:path*",
    "/dashboard/:path*",
    "/competitors/:path*",
    "/brief/:path*",
  ],
};