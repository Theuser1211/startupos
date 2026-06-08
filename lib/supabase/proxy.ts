import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxySession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes — redirect to sign-in if not authenticated
  // Note: /workspace is NOT protected so anonymous users can access their blueprints
  const protectedPaths = ["/blueprints"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Auth pages — redirect to blueprints if already authenticated
  const authPaths = ["/auth/sign-in", "/auth/sign-up", "/auth/forgot-password", "/auth/reset-password"];
  const isAuthPage = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/blueprints";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
