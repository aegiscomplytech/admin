"use client"

import Link from "next/link"
import { PlusIcon, RefreshCwIcon, UserCogIcon } from "lucide-react"

import { PERMISSION_LABELS, RoleKindBadge } from "@/components/company/company-badges"
import { CompanyErrorCard } from "@/components/company/company-dashboard"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCompanyRoles } from "@/hooks/use-company-admin"
import { cn } from "@/lib/utils"

function RoleCard({ role }) {
  return (
    <li className="grid gap-2 rounded-lg border p-4" data-testid="company-role" data-role-name={role.name}>
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/company/roles/${role.id}`} className="font-medium underline-offset-2 hover:underline">
          {role.name}
        </Link>
        <RoleKindBadge builtIn={role.is_builtin} />
        {!role.is_active && <Badge variant="destructive">Inactive</Badge>}
        <span className="ml-auto text-xs text-muted-foreground">
          {role.users} user{role.users === 1 ? "" : "s"}
        </span>
      </div>
      {role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
      {role.modules.length === 0 ? (
        <p className="text-xs text-muted-foreground">No permissions in your modules.</p>
      ) : (
        <ul className="grid gap-1 text-xs">
          {role.modules.map((m) => (
            <li key={m.code} className="flex flex-wrap items-center gap-1">
              <span className="font-medium">{m.name}:</span>
              {m.permissions.map((p) => (
                <Badge key={p} variant="secondary">
                  {PERMISSION_LABELS[p] ?? p}
                </Badge>
              ))}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

/** Company Admin: the company's custom roles and the built-in roles it can use. */
export default function CompanyRolesPage() {
  const { data: roles, isPending, isError, error, refetch, isFetching } = useCompanyRoles()
  const custom = roles?.filter((r) => !r.is_builtin) ?? []
  const builtIn = roles?.filter((r) => r.is_builtin) ?? []

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Roles &amp; Permissions</CardTitle>
          <CardDescription>
            Create roles with permissions from the modules your company purchased, then give them to your users. The server refuses permissions of
            modules you do not have.
          </CardDescription>
          <CardAction className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            </Button>
            <Link href="/company/roles/new" className={buttonVariants({ size: "sm" })}>
              <PlusIcon />
              Create role
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-6">
          {isPending && <Skeleton className="h-48" />}
          {isError && <CompanyErrorCard title="Couldn't load the roles" error={error} onRetry={() => refetch()} />}
          {roles && (
            <>
              <section className="grid gap-3">
                <h2 className="text-sm font-medium">Your roles ({custom.length})</h2>
                {custom.length === 0 ? (
                  <div className="grid justify-items-center gap-2 rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                    <UserCogIcon className="size-6" />
                    <p>No custom roles yet. Create one, e.g. &quot;HR Manager&quot;.</p>
                  </div>
                ) : (
                  <ul className="grid gap-3 md:grid-cols-2" data-testid="custom-roles">
                    {custom.map((role) => (
                      <RoleCard key={role.id} role={role} />
                    ))}
                  </ul>
                )}
              </section>
              <section className="grid gap-3">
                <h2 className="text-sm font-medium">Built-in roles ({builtIn.length})</h2>
                <p className="text-xs text-muted-foreground">Provided by the platform for every company. You can give them to users but not change them.</p>
                <ul className="grid gap-3 md:grid-cols-2" data-testid="builtin-roles">
                  {builtIn.map((role) => (
                    <RoleCard key={role.id} role={role} />
                  ))}
                </ul>
              </section>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
