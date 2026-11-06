"use client"

import { useState } from "react"
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { Toaster, toast } from "@/components/ui/toast"
import { CURRENT_ADMIN_QUERY_KEY } from "@/hooks/use-auth"

/**
 * When any API call returns 401 while the admin is logged in, the session has
 * expired or been revoked (e.g. password changed on another device).
 * Clearing the cached admin makes the auth guard send the user to the login page.
 */
function handleUnauthorized(queryClient, error, meta) {
  if (error?.status !== 401 || meta?.ignoreUnauthorized) return
  if (!queryClient.getQueryData(CURRENT_ADMIN_QUERY_KEY)) return

  queryClient.setQueryData(CURRENT_ADMIN_QUERY_KEY, null)
  toast.add({
    type: "warning",
    title: "Session expired",
    description: "Please log in again to continue.",
  })
}

function createQueryClient() {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => handleUnauthorized(queryClient, error, query.meta),
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) =>
        handleUnauthorized(queryClient, error, mutation.meta),
    }),
    defaultOptions: {
      queries: { retry: 1, refetchOnWindowFocus: true },
    },
  })
  return queryClient
}

export function AppProviders({ children }) {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster>{children}</Toaster>
    </QueryClientProvider>
  )
}
