import Link from "next/link"
import { ArrowRightIcon, BlocksIcon, Building2Icon, ClockIcon, ListTreeIcon, ShieldCheckIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatAuditAction } from "@/lib/audit"
import { formatDateTime } from "@/lib/utils"

function Tile({ icon: Icon, label, value, hint, href }) {
  const body = (
    <Card size="sm" className="h-full">
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
  return href ? (
    <Link href={href} className="rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
      {body}
    </Link>
  ) : (
    body
  )
}

/** Dashboard: companies, modules, routes and module assignments, plus the latest access changes. */
export function ModuleAccessOverview({ data }) {
  const { companies, modules, routes } = data
  return (
    <div className="grid gap-3" data-testid="module-access-overview">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium">Companies &amp; module access</h2>
        <Link href="/company-access" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Manage company access
          <ArrowRightIcon />
        </Link>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" aria-label="Module access summary">
        <Tile icon={Building2Icon} label="Registered companies" value={companies.total} href="/organizations" />
        <Tile icon={ShieldCheckIcon} label="Active companies" value={companies.active} hint="Approved" href="/company-access" />
        <Tile icon={ClockIcon} label="Awaiting approval" value={companies.pending} href="/organizations/pending" />
        <Tile icon={BlocksIcon} label="Application modules" value={modules.total} hint={`${modules.active} active`} href="/modules" />
        <Tile
          icon={ListTreeIcon}
          label="Registered routes"
          value={routes.total}
          hint={routes.new ? `${routes.new} new this week` : routes.inactive ? `${routes.inactive} disabled` : "All enabled"}
          href="/menu-registry"
        />
        <Tile icon={ShieldCheckIcon} label="Assigned modules" value={data.assigned_modules} hint="Usable by companies now" href="/company-access" />
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Recent access changes</CardTitle>
          <CardDescription>Module assignments, page access, route synchronisations and role changes.</CardDescription>
          <CardAction>
            <Link href="/activity-logs" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              All activity
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          {data.recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No access changes yet.</p>
          ) : (
            <ul className="divide-y text-sm" data-testid="recent-access-changes">
              {data.recent.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Badge variant="outline">{formatAuditAction(entry.action)}</Badge>
                    <span className="break-words">{entry.description}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {entry.admin_name ?? "Deployment"} · {formatDateTime(entry.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
