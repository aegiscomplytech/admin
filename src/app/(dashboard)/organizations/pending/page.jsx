"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckIcon, ClockIcon, ExternalLinkIcon, RefreshCwIcon, XIcon } from "lucide-react"

import { PaginationBar } from "@/components/data-tables/pagination-bar"
import { OrganizationActionDialog } from "@/components/organizations/organization-action-dialog"
import { EmailVerifiedBadge } from "@/components/organizations/status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrganizations } from "@/hooks/use-organizations"
import { REGISTRATION_STATUS_LABELS } from "@/lib/organizations"
import { cn, formatDateTime } from "@/lib/utils"

function Detail({ label, children }) {
  return (
    <div className="grid min-w-0 gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate">{children || "—"}</dd>
    </div>
  )
}

export default function PendingOrganizationsPage() {
  const [page, setPage] = useState(1)
  const [dialog, setDialog] = useState({ organization: null, action: null })
  const { data, isPending, isError, error, isFetching, refetch } = useOrganizations({ page, limit: 10, status: "pending" })
  const items = data?.items ?? []

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Registrations</CardTitle>
          <CardDescription>
            Companies waiting for review. A company can be approved once its owner has verified their email.
          </CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
              Refresh
            </Button>
          </CardAction>
        </CardHeader>
      </Card>

      {isPending && [0, 1, 2].map((i) => <Skeleton key={i} className="h-44" />)}

      {isError && (
        <Card role="alert">
          <CardContent className="grid justify-items-center gap-3 py-8 text-center">
            <p className="font-medium">Couldn&apos;t load pending registrations</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {!isPending && !isError && items.length === 0 && (
        <Card>
          <CardContent className="grid justify-items-center gap-2 py-12 text-center">
            <ClockIcon className="size-6 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium">No pending registrations</p>
            <p className="text-sm text-muted-foreground">New company registrations will appear here.</p>
          </CardContent>
        </Card>
      )}

      {items.map((org) => (
        <Card key={org.id} data-testid="pending-registration">
          <CardHeader>
            <CardTitle>{org.legal_name}</CardTitle>
            <CardDescription>
              Registered {formatDateTime(org.registered_at)} · {REGISTRATION_STATUS_LABELS[org.registration_status]}
            </CardDescription>
            <CardAction>
              <Link href={`/organizations/${org.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Details
                <ExternalLinkIcon />
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <section aria-label="Company details" className="grid gap-2 rounded-lg border p-3">
                <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Company</h3>
                <dl className="grid gap-2 text-sm">
                  <Detail label="Business email">{org.business_email}</Detail>
                  <Detail label="Phone">{org.business_phone}</Detail>
                </dl>
              </section>
              <section aria-label="Owner details" className="grid gap-2 rounded-lg border p-3">
                <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Owner</h3>
                <dl className="grid gap-2 text-sm">
                  <Detail label="Name">{org.owner?.full_name}</Detail>
                  <Detail label="Email">{org.owner?.email}</Detail>
                </dl>
                <EmailVerifiedBadge verified={org.owner?.email_verified} />
              </section>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {!org.owner?.email_verified && (
                <p className="mr-auto text-xs text-muted-foreground">Approval is possible after the owner verifies their email.</p>
              )}
              <Button variant="destructive" onClick={() => setDialog({ organization: org, action: "reject" })}>
                <XIcon />
                Reject
              </Button>
              <Button
                onClick={() => setDialog({ organization: org, action: "approve" })}
                disabled={!org.owner?.email_verified}
                title={org.owner?.email_verified ? undefined : "The owner has not verified their email yet"}
              >
                <CheckIcon />
                Approve
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {!isError && data?.pagination?.total > 0 && (
        <PaginationBar pagination={data.pagination} onPageChange={setPage} disabled={isFetching} />
      )}

      {dialog.organization && (
        <OrganizationActionDialog
          organization={dialog.organization}
          action={dialog.action}
          onClose={() => setDialog({ organization: null, action: null })}
        />
      )}
    </div>
  )
}
