"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import * as service from "@/services/access.service"

/** Everything that can change when access changes. */
const ACCESS_KEYS = ["menu-registry", "company-access", "roles", "modules", "company-modules", "plan-modules", "audit-logs", "dashboard", "users"]

/**
 * The mutation finishes once the data ON SCREEN is fresh (active queries). Pages Next.js keeps mounted but
 * hidden (inactive queries) are refreshed in the background, so the success message is not held up by them.
 */
function useRefreshAccess() {
  const queryClient = useQueryClient()
  return async () => {
    await Promise.all(ACCESS_KEYS.map((key) => queryClient.invalidateQueries({ queryKey: [key] })))
    for (const key of ACCESS_KEYS) void queryClient.refetchQueries({ queryKey: [key], type: "inactive" })
  }
}

const noRetryOn404 = (count, error) => error?.status !== 404 && count < 1

function useAccessMutation(mutationFn) {
  const refresh = useRefreshAccess()
  return useMutation({ mutationFn, onSuccess: refresh })
}

// ---------- Menu registry ----------

/** New routes appear on their own: the list refreshes every 30 s while the page is open. */
export function useMenus(params) {
  return useQuery({
    queryKey: ["menu-registry", "list", params],
    queryFn: () => service.listMenus(params),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  })
}

export function useMenu(menuId) {
  return useQuery({ queryKey: ["menu-registry", "detail", menuId], queryFn: () => service.getMenu(menuId), enabled: Boolean(menuId), retry: noRetryOn404 })
}

export function useSetMenuActive() {
  return useAccessMutation(({ id, isActive }) => service.setMenuActive(id, isActive))
}

export function useSyncLogs(params) {
  return useQuery({
    queryKey: ["menu-registry", "logs", params],
    queryFn: () => service.listSyncLogs(params),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  })
}

export function useSyncLog(logId) {
  return useQuery({ queryKey: ["menu-registry", "log", logId], queryFn: () => service.getSyncLog(logId), enabled: Boolean(logId), retry: noRetryOn404 })
}

// ---------- Company access ----------

export function useCompanyAccessList(params) {
  return useQuery({ queryKey: ["company-access", "list", params], queryFn: () => service.listCompanyAccess(params), placeholderData: keepPreviousData })
}

export function useCompanyAccess(companyId) {
  return useQuery({
    queryKey: ["company-access", "detail", companyId],
    queryFn: () => service.getCompanyAccess(companyId),
    enabled: Boolean(companyId),
    retry: noRetryOn404,
  })
}

export function useAccessHistory(companyId, params) {
  return useQuery({
    queryKey: ["company-access", "history", companyId, params],
    queryFn: () => service.getAccessHistory(companyId, params),
    enabled: Boolean(companyId),
    placeholderData: keepPreviousData,
  })
}

/** variables: { modules: [{ module, expiresAt }], reason? } */
export function useSaveCompanyModules(companyId) {
  return useAccessMutation((input) => service.saveCompanyModules(companyId, input))
}

/** variables: { moduleId, input: { isEnabled?, expiresAt? } } */
export function useUpdateCompanyModule(companyId) {
  return useAccessMutation(({ moduleId, input }) => service.updateCompanyModule(companyId, moduleId, input))
}

export function useRemoveCompanyModule(companyId) {
  return useAccessMutation((moduleId) => service.removeCompanyModule(companyId, moduleId))
}

/** variables: { menuId, isEnabled } */
export function useSetCompanyMenu(companyId) {
  return useAccessMutation(({ menuId, isEnabled }) => service.setCompanyMenu(companyId, menuId, isEnabled))
}

// ---------- Roles ----------

export function useRoles() {
  return useQuery({ queryKey: ["roles", "list"], queryFn: service.listRoles })
}

export function usePermissions() {
  return useQuery({ queryKey: ["roles", "permissions"], queryFn: service.listPermissions, staleTime: 5 * 60_000 })
}

export function useRole(roleId) {
  return useQuery({ queryKey: ["roles", "detail", roleId], queryFn: () => service.getRole(roleId), enabled: Boolean(roleId), retry: noRetryOn404 })
}

export function useCreateRole() {
  return useAccessMutation((input) => service.createRole(input))
}

export function useUpdateRole(roleId) {
  return useAccessMutation((input) => service.updateRole(roleId, input))
}

export function useSetRolePermissions(roleId) {
  return useAccessMutation((grants) => service.setRolePermissions(roleId, grants))
}

export function useDeleteRole() {
  return useAccessMutation((roleId) => service.deleteRole(roleId))
}

// ---------- Users / modules ----------

/** variables: { userId, companyId, roleId } */
export function useAssignUserCompany() {
  return useAccessMutation(({ userId, companyId, roleId }) => service.assignUserCompany(userId, { companyId, roleId }))
}

export function useModuleDetails(moduleId) {
  return useQuery({ queryKey: ["modules", "detail", moduleId], queryFn: () => service.getModule(moduleId), enabled: Boolean(moduleId), retry: noRetryOn404 })
}

export function useDeleteModule() {
  return useAccessMutation((moduleId) => service.deleteModule(moduleId))
}
