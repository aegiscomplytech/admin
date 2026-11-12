"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import * as service from "@/services/billing.service"

/**
 * After any plan/subscription change: refresh lists, details and the activity log.
 *
 * refetchType "all": Next.js keeps visited pages mounted but hidden, and a hidden page's queries are
 * inactive. The default ("active" only) would leave e.g. the plans list with the old price until it
 * is shown again. Returning the promise makes the mutation wait, so the page navigates only once
 * fresh data is loaded.
 */
function useRefreshBilling() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all(
      ["plans", "subscriptions", "audit-logs", "dashboard"].map((key) =>
        queryClient.invalidateQueries({ queryKey: [key], refetchType: "all" })
      )
    )
}

const notFoundNoRetry = (count, error) => error?.status !== 404 && count < 1

// ---------- Plans ----------

export function usePlans(params) {
  return useQuery({ queryKey: ["plans", "list", params], queryFn: () => service.listPlans(params), placeholderData: keepPreviousData })
}

export function usePlan(id) {
  return useQuery({ queryKey: ["plans", "detail", id], queryFn: () => service.getPlan(id), enabled: Boolean(id), retry: notFoundNoRetry })
}

export function useCreatePlan() {
  const refresh = useRefreshBilling()
  return useMutation({ mutationFn: service.createPlan, onSuccess: refresh })
}

export function useUpdatePlan(id) {
  const refresh = useRefreshBilling()
  return useMutation({ mutationFn: (input) => service.updatePlan(id, input), onSuccess: refresh })
}

export function useSetPlanStatus() {
  const refresh = useRefreshBilling()
  return useMutation({ mutationFn: ({ id, isActive }) => service.setPlanStatus(id, isActive), onSuccess: refresh })
}

// ---------- Subscriptions ----------

export function useSubscriptions(params) {
  return useQuery({
    queryKey: ["subscriptions", "list", params],
    queryFn: () => service.listSubscriptions(params),
    placeholderData: keepPreviousData,
  })
}

export function useSubscription(id) {
  return useQuery({
    queryKey: ["subscriptions", "detail", id],
    queryFn: () => service.getSubscription(id),
    enabled: Boolean(id),
    retry: notFoundNoRetry,
  })
}

export function useAssignSubscription() {
  const refresh = useRefreshBilling()
  return useMutation({ mutationFn: service.assignSubscription, onSuccess: refresh })
}

/** variables: { id, action: "status" | "change-plan" | "renew", input } */
export function useSubscriptionAction() {
  const refresh = useRefreshBilling()
  return useMutation({
    mutationFn: ({ id, action, input }) => {
      if (action === "status") return service.changeSubscriptionStatus(id, input)
      if (action === "change-plan") return service.changeSubscriptionPlan(id, input)
      if (action === "renew") return service.renewSubscription(id, input)
      throw new Error(`Unknown action: ${action}`)
    },
    onSuccess: refresh,
  })
}
