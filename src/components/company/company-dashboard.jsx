"use client"

import Link from "next/link"
import { BlocksIcon, CreditCardIcon, RefreshCwIcon, UserCogIcon, UserPlusIcon, UsersIcon } from "lucide-react"

import { ModuleIcon } from "@/components/modules/module-icon"
import { OrganizationStatusBadge } from "@/components/organizations/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCompanyDashboard } from "@/hooks/use-company-admin"
import { formatAuditAction } from "@/lib/audit"
import { cn, formatDateTime } from "@/lib/utils"

function StatCard({ icon: Icon, label, value, detail, href, testId }) {
  return (
    <Card size="sm" data-testid={testId}>
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{detail}</span>
        {href && (
          <Link href={href} className="font-medium text-foreground underline-offset-2 hover:underline">
            View
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

export function CompanyErrorCard({ title, error, onRetry }) {
  return (
    <Card role="alert">
      <CardContent className="grid justify-items-center gap-3 py-10 text-center">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{error?.message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

/** Company Admin dashboard: users, roles, purchased modules, subscription, recent activity (all from the database). */
export function CompanyDashboard() {
  const { data, isPending, isError, error, refetch, isFetching } = useCompanyDashboard()

  if (isPending) {
    return (
      <div className="mx-auto grid w-full max-w-6xl gap-6" aria-busy="true">
        <Skeleton className="h-24" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }
  if (isError) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <CompanyErrorCard title="Couldn't load your dashboard" error={error} onRetry={() => refetch()} />
      </div>
    )
  }

  const { company, admin, stats, subscription, modules, recent_activity: activity } = data
  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6" data-testid="company-dashboard">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
            {company.display_name ?? company.legal_name}
            <OrganizationStatusBadge status={company.status} />
          </CardTitle>
          <CardDescription>
            Company dashboard · signed in as {admin.full_name}
            {admin.admin_id && <span className="font-mono"> ({admin.admin_id})</span>}
          </CardDescription>
          <CardAction>
            <Button variant="ghost" size="icon-sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            </Button>
          </CardAction>
        </CardHeader>
        {/* Own row, so the company name keeps the full width on phones */}
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/company/roles/new" className={buttonVariants({ size: "sm" })}>
            <UserCogIcon />
            Create role
          </Link>
          <Link href="/company/users/new" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <UserPlusIcon />
            Add user
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={UsersIcon}
          label="Users"
          value={stats.users.total}
          detail={`${stats.users.active} active · ${stats.users.invited} invited · ${stats.users.inactive} inactive`}
          href="/company/users"
          testId="stat-users"
        />
        <StatCard
          icon={UserCogIcon}
          label="Roles"
          value={stats.roles.custom + stats.roles.built_in}
          detail={`${stats.roles.custom} custom · ${stats.roles.built_in} built-in`}
          href="/company/roles"
          testId="stat-roles"
        />
        <StatCard
          icon={BlocksIcon}
          label="Active modules"
          value={stats.modules.active}
          detail={`${stats.modules.purchased} purchased`}
          href="/company/modules"
          testId="stat-modules"
        />
        <StatCard
          icon={CreditCardIcon}
          label="Subscription"
          value={subscription ? subscription.plan.name : "None"}
          detail={
            subscription
              ? subscription.valid_now
                ? subscription.days_left === null
                  ? "Active, no end date"
                  : `Active · ${subscription.days_left} day${subscription.days_left === 1 ? "" : "s"} left`
                : `Not valid (${subscription.status})`
              : "Ask the platform team to assign one"
          }
          href="/company/subscription"
          testId="stat-subscription"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Purchased modules</CardTitle>
            <CardDescription>The modules your company bought. Roles can only give permissions in active ones.</CardDescription>
          </CardHeader>
          <CardContent>
            {modules.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Your company has no modules yet.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2" data-testid="dashboard-modules">
                {modules.map((m) => (
                  <li key={m.code} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <ModuleIcon name={m.icon} />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">{m.name}</span>
                    {m.status !== "active" && <Badge variant="outline">Unavailable</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>What your company&apos;s admins changed.</CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Nothing yet. Create a role, then add your users.</p>
            ) : (
              <ol className="divide-y text-sm" data-testid="dashboard-activity">
                {activity.map((entry) => (
                  <li key={entry.id} className="grid gap-1 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{formatAuditAction(entry.action)}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDateTime(entry.created_at)}</span>
                    </div>
                    <span className="break-words">{entry.description}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
