import { apiClient } from "@/lib/api-client"

// Registered users of the frontend/ app (backend: /api/v1/admin/users)
const BASE = "/v1/admin/users"

/** GET / — { items, pagination, status_counts }. Empty params are left out. */
export async function listUsers(params) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value))
  }
  return (await apiClient(`${BASE}?${search}`)).data
}

/** { total, pending, approved, rejected } */
export async function getUserStats() {
  return (await apiClient(`${BASE}/stats`)).data
}

export async function getUser(id) {
  return (await apiClient(`${BASE}/${encodeURIComponent(id)}`)).data
}

export async function approveUser(id) {
  return apiClient(`${BASE}/${encodeURIComponent(id)}/approve`, { method: "PATCH" })
}

export async function rejectUser(id, reason) {
  return apiClient(`${BASE}/${encodeURIComponent(id)}/reject`, { method: "PATCH", body: { reason } })
}

export async function deleteUser(id, reason) {
  return apiClient(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE", body: { reason } })
}
