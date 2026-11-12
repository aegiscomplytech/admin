// Auth constants and helpers shared by the proxy, pages and components.
// The session itself lives in an HTTP-only cookie set by the backend;
// nothing about it (or any password) is ever stored in localStorage.

/** Must match SESSION_COOKIE_NAME in the backend .env */
export const SESSION_COOKIE_NAME = "admin_session";

export const LOGIN_PATH = "/login";
export const DEFAULT_AUTHENTICATED_PATH = "/dashboard";

/** Pages that can be opened without being logged in. */
export const PUBLIC_PATHS = ["/login", "/forgot-password", "/verify-otp", "/register", "/verify-email", "/company/login"];

// ---------- Company users (separate login, separate cookie) ----------

/** Must match COMPANY_SESSION_COOKIE_NAME in the backend .env */
export const COMPANY_SESSION_COOKIE_NAME = "company_session";
export const COMPANY_LOGIN_PATH = "/company/login";
export const COMPANY_HOME_PATH = "/company";

/** The company area (/company and below, except the company login page). */
export function isCompanyPath(pathname) {
  return (pathname === COMPANY_HOME_PATH || pathname.startsWith(`${COMPANY_HOME_PATH}/`)) && !pathname.startsWith(COMPANY_LOGIN_PATH);
}

/** Like getSafeRedirectPath, but only allows pages inside the company area. */
export function getSafeCompanyRedirectPath(next) {
  return typeof next === "string" && isCompanyPath(next.split(/[?#]/)[0]) && !next.startsWith("//") ? next : COMPANY_HOME_PATH;
}

/**
 * Only allows redirects to paths inside this app (blocks open redirects
 * like ?next=https://evil.com or ?next=//evil.com).
 */
export function getSafeRedirectPath(next) {
  if (
    typeof next === "string" &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.startsWith("/\\") &&
    !next.startsWith(LOGIN_PATH)
  ) {
    return next;
  }
  return DEFAULT_AUTHENTICATED_PATH;
}

const ROLE_LABELS = { SUPER_ADMIN: "Super Admin" };

export function formatRole(role) {
  return ROLE_LABELS[role] ?? role;
}
