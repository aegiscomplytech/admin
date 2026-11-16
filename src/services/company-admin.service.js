import { apiClient } from "@/lib/api-client"

// Company Admin API (company session). The company is always the signed-in admin's company: no call sends a company id.
const BASE = "/v1/company-admin"

function query(params = {}) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value))
  }
  const text = search.toString()
  return text ? `?${text}` : ""
}

export async function getDashboard() {
  return (await apiClient(`${BASE}/dashboard`)).data
}

export async function getModules() {
  return (await apiClient(`${BASE}/modules`)).data
}

export async function getSubscription() {
  return (await apiClient(`${BASE}/subscription`)).data
}

export async function getActivity(params) {
  return (await apiClient(`${BASE}/activity${query(params)}`)).data
}

// ---------- Users ----------

/** { page, limit, search, status: active | inactive | invited, roleId } */
export async function listUsers(params) {
  return (await apiClient(`${BASE}/users${query(params)}`)).data
}

export async function getUser(id) {
  return (await apiClient(`${BASE}/users/${encodeURIComponent(id)}`)).data
}

/** { full_name, email, mobile, department, designation, roleId, isActive, onboarding: invitation | password, password?, confirm_password? } */
export async function createUser(input) {
  return apiClient(`${BASE}/users`, { method: "POST", body: input })
}

/** Only the fields that change: { full_name, mobile, department, designation, roleId, isActive } */
export async function updateUser(id, input) {
  return apiClient(`${BASE}/users/${encodeURIComponent(id)}`, { method: "PATCH", body: input })
}

export async function resendInvitation(id) {
  return apiClient(`${BASE}/users/${encodeURIComponent(id)}/resend-invitation`, { method: "POST" })
}

// ---------- Roles ----------

export async function listRoles() {
  return (await apiClient(`${BASE}/roles`)).data
}

/** The purchased, usable modules and the permissions each offers (ids to send as permissionIds). */
export async function getPermissionCatalog() {
  return (await apiClient(`${BASE}/roles/permission-catalog`)).data
}

export async function getRole(id) {
  return (await apiClient(`${BASE}/roles/${encodeURIComponent(id)}`)).data
}

/** { roleName, description, permissionIds } */
export async function createRole(input) {
  return apiClient(`${BASE}/roles`, { method: "POST", body: input })
}

/** { roleName?, description?, isActive?, permissionIds? } */
export async function updateRole(id, input) {
  return apiClient(`${BASE}/roles/${encodeURIComponent(id)}`, { method: "PUT", body: input })
}

export async function deleteRole(id) {
  return apiClient(`${BASE}/roles/${encodeURIComponent(id)}`, { method: "DELETE" })
}
