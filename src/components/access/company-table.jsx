"use client"

import Link from "next/link"
import { Building2Icon, ShieldCheckIcon } from "lucide-react"

import { AccessStatusBadge } from "@/components/access/status-badge"
import { EmptyRow, SkeletonRows } from "@/components/access/table-states"
import { SubscriptionStatusBadge } from "@/components/billing/badges"
import { OrganizationStatusBadge } from "@/components/organizations/status-badge"
import { buttonVariants } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/billing"
import { formatDateTime } from "@/lib/utils"

const COLUMNS = ["Company", "Company email", "Subscription", "Assigned modules", "Access status", "Last change", "Actions"]

/** Registered companies with their module access (Company Access list). */
export function CompanyTable({ items, isPending, totalModules }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {COLUMNS.map((c) => (
            <TableHead key={c} className="px-3">
              {c}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isPending && <SkeletonRows columns={COLUMNS.length} />}
        {!isPending && items.length === 0 && <EmptyRow columns={COLUMNS.length} icon={Building2Icon} title="No companies found" />}
        {!isPending &&
          items.map((c) => (
            <TableRow key={c.id} data-company-id={c.id}>
              <TableCell className="max-w-xs px-3 whitespace-normal">
                <div className="grid">
                  <span className="font-medium">{c.legal_name}</span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <OrganizationStatusBadge status={c.status} />
                    {c.display_name && c.display_name !== c.legal_name && c.display_name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-3 text-xs">{c.business_email}</TableCell>
              <TableCell className="px-3 whitespace-normal">
                {c.subscription ? (
                  <div className="grid gap-0.5 text-xs">
                    <span className="font-medium">{c.subscription.plan.name}</span>
                    <span className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
                      <SubscriptionStatusBadge status={c.subscription.is_valid ? "active" : c.subscription.status === "active" ? "expired" : c.subscription.status} />
                      {c.subscription.end_date && `until ${formatDate(c.subscription.end_date)}`}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">No subscription</span>
                )}
              </TableCell>
              <TableCell className="px-3 tabular-nums" data-testid="assigned-count">
                {c.assigned_modules}
                {totalModules ? <span className="text-muted-foreground"> / {totalModules}</span> : null}
              </TableCell>
              <TableCell className="px-3">
                <AccessStatusBadge status={c.access_status} />
              </TableCell>
              <TableCell className="px-3 text-xs text-muted-foreground">{formatDateTime(c.access_modified_at, "—")}</TableCell>
              <TableCell className="px-3">
                <Link href={`/company-access/${c.id}`} className={buttonVariants({ variant: "outline", size: "sm" })} aria-label={`Manage access of ${c.legal_name}`}>
                  <ShieldCheckIcon />
                  Access Management
                </Link>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  )
}
