"use client"

import Link from "next/link"
import {
  ActivityIcon,
  ArrowRightIcon,
  CalendarClockIcon,
  HistoryIcon,
  LogInIcon,
  RefreshCwIcon,
  UsersIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardOverview } from "@/hooks/use-dashboard"
import { formatAuditAction, formatAuditModule } from "@/lib/audit"
import { formatRole } from "@/lib/auth"
import { formatDateTime } from "@/lib/utils"

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <Card size="sm">
      <CardContent className="grid gap-3">
        <div className="flex items-center justify-between gap-2 text-muted-foreground">
          <span className="text-xs font-medium">{label}</span>
          <Icon className="size-4" aria-hidden="true" />
        </div>
        <div className="text-2xl leading-none font-semibold tabular-nums">{value}</div>
        {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, children }) {
  return (
    <div className="grid gap-0.5 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium break-all">{children}</dd>
    </div>
  )
}

function EmptyText({ children }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6" aria-busy="true" aria-label="Loading dashboard">
      <Skeleton className="h-24" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useDashboardOverview()

  if (isPending) return <DashboardSkeleton />

  if (isError) {
    return (
      <Card className="mx-auto w-full max-w-lg">
        <CardHeader>
          <CardTitle>Couldn&apos;t load the dashboard</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCwIcon className={isFetching ? "animate-spin" : undefined} />
            Try again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { admin, administrators, logins, activity } = data
  const previous = logins.previous

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Welcome back, {admin.full_name}</CardTitle>
          <CardDescription>
            {previous
              ? `Your previous login was on ${formatDateTime(previous.created_at)}${previous.ip_address ? ` from ${previous.ip_address}` : ""}.`
              : "This is your first recorded login."}
          </CardDescription>
          <CardAction>
            <Button variant="ghost" size="icon-sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCwIcon className={isFetching ? "animate-spin" : undefined} />
            </Button>
          </CardAction>
        </CardHeader>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Summary">
        <StatCard
          icon={UsersIcon}
          label="Platform administrators"
          value={administrators.total}
          hint={`${administrators.active} active`}
        />
        <StatCard
          icon={ActivityIcon}
          label="Activity (last 24 hours)"
          value={activity.last_24_hours}
          hint={`${activity.last_7_days} in the last 7 days`}
        />
        <StatCard
          icon={CalendarClockIcon}
          label="Latest activity"
          value={<span className="text-base">{formatDateTime(activity.latest_at, "No activity yet")}</span>}
          hint={activity.recent[0] ? formatAuditAction(activity.recent[0].action) : undefined}
        />
        <StatCard
          icon={LogInIcon}
          label="Previous login"
          value={<span className="text-base">{formatDateTime(previous?.created_at, "None")}</span>}
          hint={previous?.ip_address ? `IP ${previous.ip_address}` : undefined}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account information</CardTitle>
            <CardDescription>Your Super Admin account.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="divide-y text-sm">
              <InfoRow label="Name">{admin.full_name}</InfoRow>
              <InfoRow label="Email">{admin.email}</InfoRow>
              <InfoRow label="Role">{formatRole(admin.role)}</InfoRow>
              <InfoRow label="Status">
                <Badge variant={admin.is_active ? "secondary" : "destructive"}>
                  {admin.is_active ? "Active" : "Inactive"}
                </Badge>
              </InfoRow>
              <InfoRow label="Current login">{formatDateTime(admin.last_login_at)}</InfoRow>
              <InfoRow label="Account created">{formatDateTime(admin.created_at)}</InfoRow>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent logins</CardTitle>
            <CardDescription>Latest Super Admin sign-ins.</CardDescription>
          </CardHeader>
          <CardContent>
            {logins.recent.length === 0 ? (
              <EmptyText>No logins recorded yet.</EmptyText>
            ) : (
              <ul className="divide-y text-sm">
                {logins.recent.map((login) => (
                  <li key={`${login.created_at}-${login.ip_address}`} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{login.admin?.full_name ?? "—"}</p>
                      <p className="truncate text-xs text-muted-foreground">{login.ip_address ?? "Unknown IP"}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(login.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>The latest recorded actions on the platform.</CardDescription>
          <CardAction>
            <Link href="/activity-logs" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <HistoryIcon />
              View all
              <ArrowRightIcon />
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          {activity.recent.length === 0 ? (
            <EmptyText>No activity recorded yet.</EmptyText>
          ) : (
            <ul className="text-sm">
              {activity.recent.map((item, index) => (
                <li key={item.id}>
                  {index > 0 && <Separator />}
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <Badge variant="outline">{formatAuditAction(item.action)}</Badge>
                      <span className="truncate">{item.description ?? formatAuditModule(item.module)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {item.admin_name ? `${item.admin_name} · ` : ""}
                      {formatDateTime(item.created_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
