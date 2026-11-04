"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCurrentAdmin } from "@/hooks/use-auth"
import { LOGIN_PATH } from "@/lib/auth"

function FullPageMessage({ children }) {
  return (
    <div className="flex min-h-svh flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground">
      {children}
    </div>
  )
}

/**
 * Renders the admin area only for a logged-in admin.
 * Logged out or session expired: redirects to the login page.
 */
export function AdminAuthGuard({ children }) {
  const { data: admin, isPending, isError, refetch } = useCurrentAdmin()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (admin === null) {
      router.replace(`${LOGIN_PATH}?next=${encodeURIComponent(pathname)}`)
    }
  }, [admin, pathname, router])

  const isReady = Boolean(admin) && !isError

  return (
    <>
      {isError && (
        <FullPageMessage>
          <span>We couldn&apos;t reach the server. Please try again.</span>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </FullPageMessage>
      )}
      {!isReady && !isError && (
        <FullPageMessage>
          <Loader2Icon className="size-5 animate-spin" aria-hidden="true" />
          <span>Checking your session…</span>
        </FullPageMessage>
      )}
      {/* Always rendered so Next.js can prerender the route; hidden until the session is confirmed.
          Pages render nothing without an admin, so no data is shown before that. */}
      <div className={isReady ? "contents" : "hidden"}>{children}</div>
    </>
  )
}
