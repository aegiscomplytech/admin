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

// ---------- Company Admin system ----------

/** Creates an active company. Response data = company details. */
export async function createCompany(input) {
  return apiClient(BASE, { method: "POST", body: input })
}

/** Edits company details (send only changed fields; null clears an optional field). */
export async function updateCompany(id, input) {
  return apiClient(`${BASE}/${encodeURIComponent(id)}`, { method: "PUT", body: input })
}

/** { full_name, email }: the Admin ID + temporary password are emailed to the new Company Admin. */
export async function createCompanyAdmin(id, input) {
  return apiClient(`${BASE}/${encodeURIComponent(id)}/admins`, { method: "POST", body: input })
}

/** status: "active" | "inactive" */
export async function setCompanyAdminStatus(id, userId, status, reason) {
  return apiClient(`${BASE}/${encodeURIComponent(id)}/admins/${encodeURIComponent(userId)}`, { method: "PATCH", body: { status, reason } })
}

export async function resetCompanyAdminCredentials(id, userId, reason) {
  return apiClient(`${BASE}/${encodeURIComponent(id)}/admins/${encodeURIComponent(userId)}/reset-credentials`, {
    method: "POST",
    body: { reason },
  })
}
