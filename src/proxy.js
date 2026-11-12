import { NextResponse } from "next/server"

import {
  COMPANY_LOGIN_PATH,
  COMPANY_SESSION_COOKIE_NAME,
  LOGIN_PATH,
  PUBLIC_PATHS,
  SESSION_COOKIE_NAME,
  isCompanyPath,
} from "@/lib/auth"

/**
 * Fast, optimistic check before a page loads: no session cookie on a protected page
 * means "go to the right login page". The real check (is the session still valid?)
 * is done by the backend on every API call and by the auth guards.
 *
 *   /company/...  -> needs the company cookie, else /company/login
 *   other pages   -> need the Super Admin cookie, else /login
 */
export function proxy(request) {
  const { pathname, search } = request.nextUrl

  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  if (isPublic) return NextResponse.next()

  const companyArea = isCompanyPath(pathname)
  const cookieName = companyArea ? COMPANY_SESSION_COOKIE_NAME : SESSION_COOKIE_NAME
  if (request.cookies.has(cookieName)) return NextResponse.next()

  const loginUrl = new URL(companyArea ? COMPANY_LOGIN_PATH : LOGIN_PATH, request.url)
  loginUrl.searchParams.set("next", `${pathname}${search}`)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  // Pages only: skip API calls (forwarded to the backend), Next.js assets and files like favicon.ico
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
}
