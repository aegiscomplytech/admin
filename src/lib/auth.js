// Auth constants and helpers shared by the proxy, pages and components.
// The session itself lives in an HTTP-only cookie set by the backend;
// nothing about it (or any password) is ever stored in localStorage.

/** Must match SESSION_COOKIE_NAME in the backend .env */
export const SESSION_COOKIE_NAME = "admin_session";

export const LOGIN_PATH = "/login";
export const DEFAULT_AUTHENTICATED_PATH = "/dashboard";

/** Pages that can be opened without being logged in. */
export const PUBLIC_PATHS = ["/login", "/forgot-password", "/verify-otp", "/register"];

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
