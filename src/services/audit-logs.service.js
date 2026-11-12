import { apiClient } from "@/lib/api-client"

/**
 * GET /api/v1/admin/audit-logs
 * `params`: { page, limit, action?, module?, start_date?, end_date? }. Empty values are left out.
 * Returns { items, pagination, filters }.
 */
export async function getAuditLogs(params) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value))
  }
  const response = await apiClient(`/v1/admin/audit-logs?${search}`)
  return response.data
}
