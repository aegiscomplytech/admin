import { NextResponse } from "next/server"

import { LOGIN_PATH, PUBLIC_PATHS, SESSION_COOKIE_NAME } from "@/lib/auth"

/**
 * Fast, optimistic check before a page loads: no session cookie on a
 * protected page means "go to login". The real check (is the session still
 * valid?) is done by the backend on every API call and by AdminAuthGuard.
 */
export function proxy(request) {
  const { pathname, search } = request.nextUrl

  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  if (isPublic || request.cookies.has(SESSION_COOKIE_NAME)) {
    return NextResponse.next()
  }

  const loginUrl = new URL(LOGIN_PATH, request.url)
  loginUrl.searchParams.set("next", `${pathname}${search}`)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  // Pages only: skip API calls (forwarded to the backend), Next.js assets and files like favicon.ico
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
}
