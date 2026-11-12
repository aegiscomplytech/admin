import { apiClient } from "@/lib/api-client"

/** GET /api/v1/admin/dashboard/overview — real numbers from the backend, nothing computed here. */
export async function getDashboardOverview() {
  const response = await apiClient("/v1/admin/dashboard/overview")
  return response.data
}
