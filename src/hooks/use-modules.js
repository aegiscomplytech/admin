"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import * as service from "@/services/modules.service"

/**
 * Refresh everything module-related after a change. refetchType "all" also refreshes pages Next.js
 * keeps mounted but hidden; returning the promise lets the mutation finish only once data is fresh.
 */
function useRefreshModules() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all(
      ["modules", "plan-modules", "company-modules", "plans", "audit-logs"].map((key) =>
        queryClient.invalidateQueries({ queryKey: [key], refetchType: "all" })
      )
    )
}

const noRetryOn404 = (count, error) => error?.status !== 404 && count < 1

export function useModuleList(params) {
  return useQuery({ queryKey: ["modules", "list", params], queryFn: () => service.listModules(params), placeholderData: keepPreviousData })
}

export function useSaveModule() {
  const refresh = useRefreshModules()
  return useMutation({
    mutationFn: ({ id, input }) => (id ? service.updateModule(id, input) : service.createModule(input)),
    onSuccess: refresh,
  })
}

export function useSetModuleStatus() {
  const refresh = useRefreshModules()
  return useMutation({ mutationFn: ({ id, isActive }) => service.setModuleStatus(id, isActive), onSuccess: refresh })
}

export function usePlanModules(planId) {
  return useQuery({ queryKey: ["plan-modules", planId], queryFn: () => service.getPlanModules(planId), enabled: Boolean(planId), retry: noRetryOn404 })
}

export function usePlanModuleSummary(planId) {
  return useQuery({ queryKey: ["plan-modules", planId, "summary"], queryFn: () => service.getPlanModuleSummary(planId), enabled: Boolean(planId), retry: noRetryOn404 })
}

export function useSavePlanModules(planId) {
  const refresh = useRefreshModules()
  return useMutation({ mutationFn: (moduleIds) => service.setPlanModules(planId, moduleIds), onSuccess: refresh })
}

export function useCompanyModules(organizationId) {
  return useQuery({
    queryKey: ["company-modules", organizationId],
    queryFn: () => service.getCompanyModules(organizationId),
    enabled: Boolean(organizationId),
    retry: noRetryOn404,
  })
}

/** variables: { moduleId, action: "grant" | "revoke" | "reset", input? } */
export function useChangeCompanyModule(organizationId) {
  const refresh = useRefreshModules()
  return useMutation({
    mutationFn: ({ moduleId, action, input }) => service.changeCompanyModule(organizationId, moduleId, action, input),
    onSuccess: refresh,
  })
}

/** Company side: modules the logged-in company can use. */
export function useMyModules(enabled = true) {
  return useQuery({ queryKey: ["company", "my-modules"], queryFn: service.getMyModules, enabled, retry: false, meta: { ignoreUnauthorized: true } })
}
