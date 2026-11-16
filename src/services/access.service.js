import { apiClient } from "@/lib/api-client"

// Dynamic Module Access Management (Super Admin): route registry, company access, roles & permissions.

const q = (params = {}) => {
  const s = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") s.set(k, String(v))
  const text = s.toString()
  return text ? `?${text}` : ""
}
const id = encodeURIComponent

// ---------- Menu / route registry (/v1/admin/menu-registry) ----------

export const listMenus = async (params) => (await apiClient(`/v1/admin/menu-registry${q(params)}`)).data
export const getMenu = async (menuId) => (await apiClient(`/v1/admin/menu-registry/${id(menuId)}`)).data
export const setMenuActive = (menuId, isActive) => apiClient(`/v1/admin/menu-registry/${id(menuId)}`, { method: "PATCH", body: { isActive } })
export const listSyncLogs = async (params) => (await apiClient(`/v1/admin/menu-registry/logs${q(params)}`)).data
export const getSyncLog = async (logId) => (await apiClient(`/v1/admin/menu-registry/logs/${id(logId)}`)).data

// ---------- Company access (/v1/admin/companies) ----------

export const listCompanyAccess = async (params) => (await apiClient(`/v1/admin/companies${q(params)}`)).data
export const getCompanyAccess = async (companyId) => (await apiClient(`/v1/admin/companies/${id(companyId)}/modules`)).data
/** The company gets exactly these modules: [moduleId] or [{ module, expiresAt }]. */
export const saveCompanyModules = (companyId, input) => apiClient(`/v1/admin/companies/${id(companyId)}/modules`, { method: "PUT", body: input })
export const updateCompanyModule = (companyId, moduleId, input) =>
  apiClient(`/v1/admin/companies/${id(companyId)}/modules/${id(moduleId)}`, { method: "PATCH", body: input })
export const removeCompanyModule = (companyId, moduleId) =>
  apiClient(`/v1/admin/companies/${id(companyId)}/modules/${id(moduleId)}`, { method: "DELETE" })
export const setCompanyMenu = (companyId, menuId, isEnabled) =>
  apiClient(`/v1/admin/companies/${id(companyId)}/menus/${id(menuId)}`, { method: "PUT", body: { isEnabled } })
export const getAccessHistory = async (companyId, params) =>
  (await apiClient(`/v1/admin/companies/${id(companyId)}/access-history${q(params)}`)).data

// ---------- Roles & permissions (/v1/admin/roles) ----------

export const listRoles = async () => (await apiClient("/v1/admin/roles")).data
export const listPermissions = async () => (await apiClient("/v1/admin/roles/permissions")).data
export const getRole = async (roleId) => (await apiClient(`/v1/admin/roles/${id(roleId)}`)).data
export const createRole = (input) => apiClient("/v1/admin/roles", { method: "POST", body: input })
export const updateRole = (roleId, input) => apiClient(`/v1/admin/roles/${id(roleId)}`, { method: "PUT", body: input })
/** grants: [{ permission, moduleId?, menuId? }] (no moduleId / menuId = every module) */
export const setRolePermissions = (roleId, grants) => apiClient(`/v1/admin/roles/${id(roleId)}/permissions`, { method: "PUT", body: { grants } })
export const deleteRole = (roleId) => apiClient(`/v1/admin/roles/${id(roleId)}`, { method: "DELETE" })

// ---------- Users of the company app: company + role ----------

export const assignUserCompany = (userId, input) => apiClient(`/v1/admin/users/${id(userId)}/company`, { method: "PATCH", body: input })

// ---------- Module catalog additions ----------

export const getModule = async (moduleId) => (await apiClient(`/v1/admin/modules/${id(moduleId)}`)).data
export const deleteModule = (moduleId) => apiClient(`/v1/admin/modules/${id(moduleId)}`, { method: "DELETE" })
