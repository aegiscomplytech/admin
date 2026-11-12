"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Building2Icon, KeyRoundIcon, Loader2Icon, LogOutIcon } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { useCompanyLogout, useCompanyMe } from "@/hooks/use-company"
import { COMPANY_CHANGE_PASSWORD_PATH, COMPANY_LOGIN_PATH } from "@/lib/auth"

/**
 * Layout + guard for the company area. Separate from the Super Admin layout:
 * it only uses the company session (GET /api/v1/auth/me).
 */
export default function CompanyLayout({ children }) {
  const { data: me, isPending, isError, refetch } = useCompanyMe()
  const logout = useCompanyLogout()
  const router = useRouter()
  const pathname = usePathname()

  // A temporary password (new registration or Super Admin reset) must be changed first;
  // the backend also refuses every other company API until then.
  const onPasswordPage = pathname === COMPANY_CHANGE_PASSWORD_PATH
  const mustChangePassword = Boolean(me?.user.must_change_password) && !onPasswordPage

  useEffect(() => {
    if (me === null) router.replace(`${COMPANY_LOGIN_PATH}?next=${encodeURIComponent(pathname)}`)
    else if (mustChangePassword) router.replace(COMPANY_CHANGE_PASSWORD_PATH)
  }, [me, mustChangePassword, pathname, router])

  if (isPending || me === null || isError || mustChangePassword) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-sm text-muted-foreground">
        {isError ? (
          <>
            <span>We couldn&apos;t reach the server. Please try again.</span>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </>
        ) : (
          <>
            <Loader2Icon className="size-5 animate-spin" aria-hidden="true" />
            <span>Checking your session…</span>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background px-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Building2Icon className="size-4" />
        </span>
        <div className="grid min-w-0 flex-1 leading-tight">
          <span className="truncate text-sm font-medium">{me.organization.display_name ?? me.organization.legal_name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {me.user.full_name}
            {me.user.admin_id && <span data-testid="admin-id"> · {me.user.admin_id}</span>}
          </span>
        </div>
        {!me.user.must_change_password && !onPasswordPage && (
          <Link href={COMPANY_CHANGE_PASSWORD_PATH} className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <KeyRoundIcon />
            <span className="max-sm:sr-only">Change password</span>
          </Link>
        )}
        <Button variant="outline" size="sm" onClick={() => logout.mutate()} disabled={logout.isPending}>
          <LogOutIcon />
          {logout.isPending ? "Signing out…" : "Sign out"}
        </Button>
      </header>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  )
}
