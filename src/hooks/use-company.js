"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { COMPANY_LOGIN_PATH } from "@/lib/auth"
import * as service from "@/services/company.service"

// Company queries use the "company" key and `ignoreUnauthorized`, so a company 401 never
// touches the Super Admin session state (and the other way round).
export const COMPANY_ME_QUERY_KEY = ["company", "me"]

export function useCompanyMe() {
  return useQuery({
    queryKey: COMPANY_ME_QUERY_KEY,
    queryFn: service.getCompanyMe,
    staleTime: 30_000,
    retry: false,
    meta: { ignoreUnauthorized: true },
  })
}

export function useRegistrationStatus() {
  return useQuery({
    queryKey: ["company", "registration-status"],
    queryFn: service.getRegistrationStatus,
    retry: false,
    meta: { ignoreUnauthorized: true },
  })
}

export function useCompanyLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: service.companyLogin,
    meta: { ignoreUnauthorized: true },
    onSuccess: () => queryClient.removeQueries({ queryKey: ["company"] }),
  })
}

export function useCompanyLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: service.companyLogout,
    meta: { ignoreUnauthorized: true },
    onSettled: () => {
      queryClient.removeQueries({ queryKey: ["company"] })
      queryClient.setQueryData(COMPANY_ME_QUERY_KEY, null)
      router.replace(COMPANY_LOGIN_PATH)
    },
  })
}

export function useRegisterCompany() {
  return useMutation({ mutationFn: service.registerCompany, meta: { ignoreUnauthorized: true } })
}

export function useResendVerification() {
  return useMutation({ mutationFn: service.resendVerification, meta: { ignoreUnauthorized: true } })
}

/** After a successful change, the session no longer needs a password change: reload "me". */
export function useCompanyChangePassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: service.companyChangePassword,
    meta: { ignoreUnauthorized: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["company"], refetchType: "all" }),
  })
}
