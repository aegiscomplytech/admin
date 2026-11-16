"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import * as service from "@/services/organizations.service"

export function useOrganizations(params) {
  return useQuery({
    queryKey: ["organizations", "list", params],
    queryFn: () => service.listOrganizations(params),
    placeholderData: keepPreviousData,
  })
}

export function useOrganization(id) {
  return useQuery({
    queryKey: ["organizations", "detail", id],
    queryFn: () => service.getOrganization(id),
    enabled: Boolean(id),
    retry: (count, error) => error?.status !== 404 && count < 1,
  })
}

/**
 * approve / reject / suspend / reactivate / deactivate / reset_credentials.
 * `variables`: { id, action, reason? }. Refreshes company lists, details and activity logs afterwards.
 */
export function useOrganizationAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, action, reason }) => {
      switch (action) {
        case "approve":
          return service.approveOrganization(id)
        case "reject":
          return service.rejectOrganization(id, reason)
        case "suspend":
          return service.changeOrganizationStatus(id, "suspended", reason)
        case "reactivate":
          return service.changeOrganizationStatus(id, "approved", reason)
        case "deactivate":
          return service.changeOrganizationStatus(id, "deactivated", reason)
        case "reset_credentials":
          return service.resetCredentials(id, reason)
        default:
          throw new Error(`Unknown action: ${action}`)
      }
    },
    onSuccess: (response, { id }) => {
      if (response?.data) queryClient.setQueryData(["organizations", "detail", id], response.data)
      // "all": also refresh lists on pages Next.js keeps hidden (their queries are inactive)
      return Promise.all(
        ["organizations", "subscriptions", "dashboard", "audit-logs"].map((key) =>
          queryClient.invalidateQueries({ queryKey: [key], refetchType: "all" })
        )
      )
    },
  })
}

/** After any company change: the details (from the response) and every list that may show it. */
function useCompanyRefresh() {
  const queryClient = useQueryClient()
  return (id, response) => {
    if (id && response?.data) queryClient.setQueryData(["organizations", "detail", id], response.data)
    return Promise.all(
      ["organizations", "company-access", "subscriptions", "dashboard", "audit-logs"].map((key) =>
        queryClient.invalidateQueries({ queryKey: [key], refetchType: "all" })
      )
    )
  }
}

export function useCreateCompany() {
  const refresh = useCompanyRefresh()
  return useMutation({ mutationFn: service.createCompany, onSuccess: (response) => refresh(response.data?.id, response) })
}

/** variables: { id, input } */
export function useUpdateCompany() {
  const refresh = useCompanyRefresh()
  return useMutation({ mutationFn: ({ id, input }) => service.updateCompany(id, input), onSuccess: (response, { id }) => refresh(id, response) })
}

/**
 * Company Admin accounts. variables:
 *   { action: "create", id, input: { full_name, email } }
 *   { action: "activate" | "deactivate", id, userId, reason? }
 *   { action: "reset", id, userId, reason }
 */
export function useCompanyAdminAction() {
  const refresh = useCompanyRefresh()
  return useMutation({
    mutationFn: ({ action, id, userId, input, reason }) => {
      if (action === "create") return service.createCompanyAdmin(id, input)
      if (action === "activate") return service.setCompanyAdminStatus(id, userId, "active", reason)
      if (action === "deactivate") return service.setCompanyAdminStatus(id, userId, "inactive", reason)
      if (action === "reset") return service.resetCompanyAdminCredentials(id, userId, reason)
      throw new Error(`Unknown action: ${action}`)
    },
    onSuccess: (response, { id }) => refresh(id, response),
  })
}
