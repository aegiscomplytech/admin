import { apiClient } from "@/lib/api-client"

const BASE = "/v1/admin/organizations"

/** GET / — { items, pagination, status_counts }. Empty params are left out. */
export async function listOrganizations(params) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value))
  }
  return (await apiClient(`${BASE}?${search}`)).data
}

export async function getOrganization(id) {
  return (await apiClient(`${BASE}/${encodeURIComponent(id)}`)).data
}

export async function approveOrganization(id) {
  return apiClient(`${BASE}/${encodeURIComponent(id)}/approve`, { method: "PATCH" })
}

export async function rejectOrganization(id, reason) {
  return apiClient(`${BASE}/${encodeURIComponent(id)}/reject`, { method: "PATCH", body: { reason } })
}

/** New temporary password, emailed to the company admin only. Response data = company details. */
export async function resetCredentials(id, reason) {
  return apiClient(`${BASE}/${encodeURIComponent(id)}/reset-credentials`, { method: "POST", body: { reason } })
}

/** status: "suspended" | "approved" (reactivate) | "deactivated" */
export async function changeOrganizationStatus(id, status, reason) {
  return apiClient(`${BASE}/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { status, reason } })
}
