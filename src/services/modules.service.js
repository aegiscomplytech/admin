import { apiClient } from "@/lib/api-client"

// Module 5: module catalog, plan modules and company module access (Super Admin), plus the company's own modules.

const q = (params) => {
  const s = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") s.set(k, String(v))
  return s.toString()
}
const id = encodeURIComponent

export const listModules = async (params) => (await apiClient(`/v1/admin/modules?${q(params)}`)).data
export const createModule = (input) => apiClient("/v1/admin/modules", { method: "POST", body: input })
export const updateModule = (moduleId, input) => apiClient(`/v1/admin/modules/${id(moduleId)}`, { method: "PUT", body: input })
export const setModuleStatus = (moduleId, isActive) =>
  apiClient(`/v1/admin/modules/${id(moduleId)}/status`, { method: "PATCH", body: { isActive } })

export const getPlanModules = async (planId) => (await apiClient(`/v1/admin/plans/${id(planId)}/modules`)).data
export const getPlanModuleSummary = async (planId) => (await apiClient(`/v1/admin/plans/${id(planId)}/module-summary`)).data
export const setPlanModules = (planId, moduleIds) =>
  apiClient(`/v1/admin/plans/${id(planId)}/modules`, { method: "PUT", body: { moduleIds } })

export const getCompanyModules = async (organizationId) => (await apiClient(`/v1/admin/organizations/${id(organizationId)}/modules`)).data
/** action: "grant" | "revoke" | "reset" */
export const changeCompanyModule = (organizationId, moduleId, action, input) =>
  action === "reset"
    ? apiClient(`/v1/admin/organizations/${id(organizationId)}/modules/${id(moduleId)}/override`, { method: "DELETE" })
    : apiClient(`/v1/admin/organizations/${id(organizationId)}/modules/${id(moduleId)}/${action}`, { method: "POST", body: input })

/** The logged-in company user's accessible modules. */
export const getMyModules = async () => (await apiClient("/v1/organization/modules/me")).data
