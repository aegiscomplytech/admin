import { ApiError, apiClient } from "@/lib/api-client";

const AUTH_PATH = "/v1/admin/auth";

/** Logs in and returns the admin. The backend sets the HTTP-only session cookie. */
export async function login(credentials) {
  const response = await apiClient(`${AUTH_PATH}/login`, { method: "POST", body: credentials });
  return response.data;
}

export async function logout() {
  await apiClient(`${AUTH_PATH}/logout`, { method: "POST" });
}

/** Returns the logged-in admin, or null if there is no valid session. */
export async function getCurrentAdmin() {
  try {
    const response = await apiClient(`${AUTH_PATH}/me`);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export async function changePassword(input) {
  return apiClient(`${AUTH_PATH}/change-password`, { method: "POST", body: input });
}
