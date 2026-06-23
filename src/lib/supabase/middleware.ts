import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicEnv } from "@/lib/env/public";

const protectedPrefixes = ["/recipes", "/recettes", "/planning", "/courses", "/congelateur"] as const;
const authRoutes = ["/login", "/signup"];

function isProtectedRoute(pathname: string): boolean {
  if (pathname === "/") {
    return true;
  }

  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  const { supabaseUrl, supabasePublishableKey } = getPublicEnv();
  const { pathname } = request.nextUrl;

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        let anyChanged = false;

        cookiesToSet.forEach(({ name, value, options }) => {
          const existing = request.cookies.get(name)?.value;
          if (existing === value) {
            return;
          }

          anyChanged = true;
          request.cookies.set(name, value);
          supabaseResponse.cookies.set(name, value, options);
        });

        if (anyChanged) {
          Object.entries(headers).forEach(([key, headerValue]) => {
            supabaseResponse.headers.set(key, headerValue);
          });
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (!user && isProtectedRoute(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthRoute) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  return supabaseResponse;
}
