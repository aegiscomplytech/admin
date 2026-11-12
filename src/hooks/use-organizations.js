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
 * approve / reject / suspend / reactivate / deactivate.
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
