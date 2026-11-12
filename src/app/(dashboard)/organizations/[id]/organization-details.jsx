"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeftIcon, RefreshCwIcon } from "lucide-react"

import { OrganizationActionDialog } from "@/components/organizations/organization-action-dialog"
import { EmailVerifiedBadge, OrganizationStatusBadge } from "@/components/organizations/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrganization } from "@/hooks/use-organizations"
import { SELF_SERVICE_ACTOR, formatAuditAction } from "@/lib/audit"
import { ORGANIZATION_ACTIONS, REGISTRATION_STATUS_LABELS } from "@/lib/organizations"
import { cn, formatDateTime } from "@/lib/utils"

/** Order of the action buttons; only the ones the backend allows are shown. */
const ACTION_ORDER = ["approve", "reject", "reactivate", "suspend", "deactivate"]

function Row({ label, children }) {
  return (
    <div className="grid gap-0.5 py-2.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium break-words">{children || "—"}</dd>
    </div>
  )
}

function Section({ title, description, children }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <dl className="divide-y text-sm">{children}</dl>
      </CardContent>
    </Card>
  )
}

export function OrganizationDetails() {
  const { id } = useParams()
  const { data: org, isPending, isError, error, isFetching, refetch } = useOrganization(id)
  const [action, setAction] = useState(null)

  const back = (
    <Link href="/organizations" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-self-start")}>
      <ArrowLeftIcon />
      All companies
    </Link>
  )

  if (isPending) {
    return (
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6" aria-busy="true">
        {back}
        <Skeleton className="h-28" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6">
        {back}
        <Card role="alert">
          <CardContent className="grid justify-items-center gap-3 py-10 text-center">
            <p className="font-medium">{error.status === 404 ? "Company not found" : "Couldn't load this company"}</p>
            <p className="text-sm text-muted-foreground">
              {error.status === 404 ? "It may have been removed, or the link is wrong." : error.message}
            </p>
            {error.status !== 404 && (
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const actions = ACTION_ORDER.filter((key) => org.actions[key])
  const approveBlocked = org.actions.approve_blocked_reason

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6">
      {back}

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
            {org.legal_name}
            <OrganizationStatusBadge status={org.status} />
          </CardTitle>
          <CardDescription>{REGISTRATION_STATUS_LABELS[org.registration_status]}</CardDescription>
          <CardAction className="flex gap-2">
            <Link href={`/organizations/${org.id}/modules`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Module access
            </Link>
            <Button variant="ghost" size="icon-sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-3">
          <h3 className="text-sm font-medium">Account management</h3>
          {actions.length === 0 && !approveBlocked && (
            <p className="text-sm text-muted-foreground">
              {org.status === "rejected"
                ? "This registration was rejected. No further actions are possible; the company can register again."
                : "No actions available."}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {actions.map((key) => (
              <Button key={key} variant={ORGANIZATION_ACTIONS[key].variant} onClick={() => setAction(key)}>
                {ORGANIZATION_ACTIONS[key].label}
              </Button>
            ))}
            {approveBlocked && (
              <Button disabled title={approveBlocked}>
                Approve
              </Button>
            )}
          </div>
          {approveBlocked && <p className="text-xs text-muted-foreground">{approveBlocked}</p>}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Company information">
          <Row label="Legal name">{org.legal_name}</Row>
          <Row label="Display name">{org.display_name}</Row>
          <Row label="Registration number">{org.registration_number}</Row>
          <Row label="Business email">{org.business_email}</Row>
          <Row label="Phone">{org.business_phone}</Row>
          <Row label="Website">
            {org.website && (
              <a href={org.website} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">
                {org.website}
              </a>
            )}
          </Row>
          <Row label="Address">{org.address}</Row>
          <Row label="City / State">{[org.city, org.state].filter(Boolean).join(", ")}</Row>
          <Row label="Country / Postal code">{[org.country, org.postal_code].filter(Boolean).join(" ")}</Row>
        </Section>

        <div className="grid content-start gap-4">
          <Section title="Contact (owner)">
            <Row label="Name">{org.owner?.full_name}</Row>
            <Row label="Email">{org.owner?.email}</Row>
            <Row label="Email verification">
              {org.owner && (
                <span className="flex flex-wrap items-center gap-2">
                  <EmailVerifiedBadge verified={org.owner.email_verified} />
                  {org.owner.email_verified_at && (
                    <span className="text-xs font-normal text-muted-foreground">{formatDateTime(org.owner.email_verified_at)}</span>
                  )}
                </span>
              )}
            </Row>
            <Row label="Membership">
              {org.owner && <Badge variant="outline">{org.owner.membership_status}</Badge>}
            </Row>
            <Row label="Last login">{formatDateTime(org.owner?.last_login_at, "Never")}</Row>
          </Section>

          <Section title="Registration & approval">
            <Row label="Registered">{formatDateTime(org.registered_at)}</Row>
            <Row label="Current status">
              <OrganizationStatusBadge status={org.status} />
            </Row>
            <Row label="Approved">{formatDateTime(org.approval.approved_at, "Not approved")}</Row>
            <Row label="Approved by">
              {org.approval.approved_by && `${org.approval.approved_by.full_name} (${org.approval.approved_by.email})`}
            </Row>
            {org.status === "rejected" && <Row label="Rejection reason">{org.rejection_reason}</Row>}
            <Row label="Last updated">{formatDateTime(org.updated_at)}</Row>
          </Section>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Everything recorded for this company, newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          {org.history.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No history yet.</p>
          ) : (
            <ol className="divide-y text-sm">
              {org.history.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Badge variant="outline">{formatAuditAction(entry.action)}</Badge>
                    <span>{entry.description}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {entry.admin_name ?? SELF_SERVICE_ACTOR} · {formatDateTime(entry.created_at)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <OrganizationActionDialog organization={org} action={action} onClose={() => setAction(null)} />
    </div>
  )
}
