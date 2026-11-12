import { apiClient } from "@/lib/api-client"

// Super Admin plan + subscription API (Module 4).

function toQuery(params) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value))
  }
  return search.toString()
}

// ---------- Plans ----------

export const listPlans = async (params) => (await apiClient(`/v1/admin/plans?${toQuery(params)}`)).data
export const getPlan = async (id) => (await apiClient(`/v1/admin/plans/${encodeURIComponent(id)}`)).data
export const createPlan = (input) => apiClient("/v1/admin/plans", { method: "POST", body: input })
export const updatePlan = (id, input) => apiClient(`/v1/admin/plans/${encodeURIComponent(id)}`, { method: "PUT", body: input })
export const setPlanStatus = (id, isActive) =>
  apiClient(`/v1/admin/plans/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { isActive } })

// ---------- Subscriptions ----------

export const listSubscriptions = async (params) => (await apiClient(`/v1/admin/subscriptions?${toQuery(params)}`)).data
export const getSubscription = async (id) => (await apiClient(`/v1/admin/subscriptions/${encodeURIComponent(id)}`)).data
export const assignSubscription = (input) => apiClient("/v1/admin/subscriptions", { method: "POST", body: input })
export const changeSubscriptionPlan = (id, input) =>
  apiClient(`/v1/admin/subscriptions/${encodeURIComponent(id)}/change-plan`, { method: "PATCH", body: input })
export const changeSubscriptionStatus = (id, input) =>
  apiClient(`/v1/admin/subscriptions/${encodeURIComponent(id)}/status`, { method: "PATCH", body: input })
export const renewSubscription = (id, input) =>
  apiClient(`/v1/admin/subscriptions/${encodeURIComponent(id)}/renew`, { method: "POST", body: input })
