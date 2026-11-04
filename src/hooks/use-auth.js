"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { LOGIN_PATH } from "@/lib/auth"
import * as authService from "@/services/auth.service"

export const CURRENT_ADMIN_QUERY_KEY = ["auth", "me"]

/**
 * The logged-in admin, loaded from GET /me.
 * `data` is the admin, `null` when logged out, `undefined` while loading.
 * Refetches when the window regains focus, so it stays in sync with the backend session.
 */
export function useCurrentAdmin() {
  return useQuery({
    queryKey: CURRENT_ADMIN_QUERY_KEY,
    queryFn: authService.getCurrentAdmin,
    staleTime: 60_000,
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.login,
    // A 401 here means wrong credentials, not an expired session
    meta: { ignoreUnauthorized: true },
    onSuccess: (admin) => queryClient.setQueryData(CURRENT_ADMIN_QUERY_KEY, admin),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: authService.logout,
    meta: { ignoreUnauthorized: true },
    // Even if the request fails, forget the admin locally and go to login
    onSettled: () => {
      queryClient.setQueryData(CURRENT_ADMIN_QUERY_KEY, null)
      router.replace(LOGIN_PATH)
    },
  })
}

export function useChangePassword() {
  return useMutation({ mutationFn: authService.changePassword })
}
