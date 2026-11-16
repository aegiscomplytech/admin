"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import * as service from "@/services/users.service"

export function useUsers(params) {
  return useQuery({
    queryKey: ["users", "list", params],
    queryFn: () => service.listUsers(params),
    placeholderData: keepPreviousData,
  })
}

export function useUserStats() {
  return useQuery({ queryKey: ["users", "stats"], queryFn: service.getUserStats })
}

export function useUser(id) {
  return useQuery({
    queryKey: ["users", "detail", id],
    queryFn: () => service.getUser(id),
    enabled: Boolean(id),
    retry: (count, error) => error?.status !== 404 && count < 1,
  })
}

/**
 * approve / reject / delete. `variables`: { id, action, reason? }.
 * Refreshes user lists, statistics, details and the activity log afterwards.
 */
export function useUserAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, action, reason }) => {
      switch (action) {
        case "approve":
          return service.approveUser(id)
        case "reject":
          return service.rejectUser(id, reason)
        case "delete":
          return service.deleteUser(id, reason)
        default:
          throw new Error(`Unknown action: ${action}`)
      }
    },
    onSuccess: (response, { id, action }) => {
      if (action === "delete") queryClient.removeQueries({ queryKey: ["users", "detail", id] })
      else if (response?.data) queryClient.setQueryData(["users", "detail", id], response.data)
      // "all": also refresh lists on pages Next.js keeps hidden (their queries are inactive)
      return Promise.all(
        [["users", "list"], ["users", "stats"], ["audit-logs"]].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey, refetchType: "all" })
        )
      )
    },
  })
}
