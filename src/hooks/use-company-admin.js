"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import * as service from "@/services/company-admin.service"

/*
 * Company Admin queries live under the ["company", "admin", …] key: signing in or out of the company area removes
 * every ["company"] query (use-company.js), so no data of one company is ever shown to the next session.
 * `ignoreUnauthorized`: a company 401 never touches the Super Admin session state.
 */
const KEY = ["company", "admin"]
const meta = { ignoreUnauthorized: true }
const noRetryOn4xx = (count, error) => !(error?.status >= 400 && error?.status < 500) && count < 1

export function useCompanyDashboard() {
  return useQuery({ queryKey: [...KEY, "dashboard"], queryFn: service.getDashboard, meta, retry: noRetryOn4xx })
}

export function useCompanyModules() {
  return useQuery({ queryKey: [...KEY, "modules"], queryFn: service.getModules, meta, retry: noRetryOn4xx })
}

export function useCompanySubscription() {
  return useQuery({ queryKey: [...KEY, "subscription"], queryFn: service.getSubscription, meta, retry: noRetryOn4xx })
}

export function useCompanyUsers(params) {
  return useQuery({
    queryKey: [...KEY, "users", "list", params],
    queryFn: () => service.listUsers(params),
    placeholderData: keepPreviousData,
    meta,
    retry: noRetryOn4xx,
  })
}

export function useCompanyUser(id) {
  return useQuery({ queryKey: [...KEY, "users", "detail", id], queryFn: () => service.getUser(id), enabled: Boolean(id), meta, retry: noRetryOn4xx })
}

export function useCompanyRoles() {
  return useQuery({ queryKey: [...KEY, "roles", "list"], queryFn: service.listRoles, meta, retry: noRetryOn4xx })
}

export function usePermissionCatalog() {
  return useQuery({ queryKey: [...KEY, "roles", "catalog"], queryFn: service.getPermissionCatalog, meta, retry: noRetryOn4xx })
}

export function useCompanyRole(id) {
  return useQuery({ queryKey: [...KEY, "roles", "detail", id], queryFn: () => service.getRole(id), enabled: Boolean(id), meta, retry: noRetryOn4xx })
}

/** Every Company Admin mutation refreshes the company admin data (users, roles, dashboard, activity). */
function useCompanyMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    meta,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY, refetchType: "all" }),
  })
}

export const useCreateCompanyUser = () => useCompanyMutation(service.createUser)
/** variables: { id, input } */
export const useUpdateCompanyUser = () => useCompanyMutation(({ id, input }) => service.updateUser(id, input))
export const useResendInvitation = () => useCompanyMutation(service.resendInvitation)
export const useCreateCompanyRole = () => useCompanyMutation(service.createRole)
/** variables: { id, input } */
export const useUpdateCompanyRole = () => useCompanyMutation(({ id, input }) => service.updateRole(id, input))
export const useDeleteCompanyRole = () => useCompanyMutation(service.deleteRole)
