"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftIcon, RefreshCwIcon } from "lucide-react"

import { SubscriptionStatusBadge } from "@/components/billing/badges"
import { SubscriptionActionDialog } from "@/components/billing/subscription-action-dialog"
import { OrganizationStatusBadge } from "@/components/organizations/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSubscription } from "@/hooks/use-billing"
import { HISTORY_ACTION_LABELS, INTERVAL_LABELS, SUBSCRIPTION_STATUS_LABELS, formatDate, formatMoney } from "@/lib/billing"
import { cn, formatDateTime } from "@/lib/utils"

/** Buttons in display order: [action key in API "actions", dialog action, label, variant] */
const ACTIONS = [
  ["renew", "renew", "Renew", "default"],
  ["change_plan", "change-plan", "Change plan", "outline"],
  ["activate", "activate", "Activate", "outline"],
  ["suspend", "suspend", "Suspend", "destructive"],
  ["cancel", "cancel", "Cancel subscription", "destructive"],
]

function Row({ label, children }) {
  return (
    <div className="grid gap-0.5 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium break-words">{children ?? "—"}</dd>
    </div>
  )
}

function Section({ title, children, action }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent>
        <dl className="divide-y text-sm">{children}</dl>
      </CardContent>
    </Card>
  )
}

function daysLeft(endDate) {
  if (!endDate) return null
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)
}

export function SubscriptionDetails() {
  const { id } = useParams()
  const router = useRouter()
  const { data: sub, isPending, isError, error, isFetching, refetch } = useSubscription(id)
  const [action, setAction] = useState(null)

  const back = (
    <Link href="/subscriptions" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-self-start")}>
      <ArrowLeftIcon />
      All subscriptions
    </Link>
  )

  if (isPending) {
    return (
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6">
        {back}
        <Skeleton className="h-32" />
        <Skeleton className="h-72" />
      </div>
    )
  }
  if (isError) {
    return (
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6">
        {back}
        <Card role="alert">
          <CardContent className="grid justify-items-center gap-2 py-10 text-center">
            <p className="font-medium">{error.status === 404 ? "Subscription not found" : "Couldn't load this subscription"}</p>
            <p className="text-sm text-muted-foreground">{error.status === 404 ? "The link may be wrong." : error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const left = daysLeft(sub.end_date)
  const available = ACTIONS.filter(([key]) => sub.actions[key])
  const priceChanged = sub.plan.current_price !== sub.price_at_purchase

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6">
      {back}

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
            {sub.organization.legal_name}
            <SubscriptionStatusBadge status={sub.status} />
          </CardTitle>
          <CardDescription>
            {sub.plan.name} · {formatDate(sub.start_date)} – {formatDate(sub.end_date, "no end date")}
            {sub.is_effective && left !== null && ` · ${left} day${left === 1 ? "" : "s"} left`}
            {sub.status === "active" && !sub.is_effective && " · not effective (company not approved)"}
          </CardDescription>
          <CardAction>
            <Button variant="ghost" size="icon-sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-2">
          <h3 className="text-sm font-medium">Manage subscription</h3>
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No actions available for a {SUBSCRIPTION_STATUS_LABELS[sub.status].toLowerCase()} subscription
              {sub.organization.status !== "approved" ? " of a company that is not approved" : ""}.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {available.map(([key, dialogAction, label, variant]) => (
                <Button key={key} variant={variant} onClick={() => setAction(dialogAction)}>
                  {label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section
          title="Company"
          action={
            <Link href={`/organizations/${sub.organization.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
              View company
            </Link>
          }
        >
          <Row label="Name">{sub.organization.legal_name}</Row>
          <Row label="Business email">{sub.organization.business_email}</Row>
          <Row label="Phone">{sub.organization.business_phone}</Row>
          <Row label="Company status">
            <OrganizationStatusBadge status={sub.organization.status} />
          </Row>
        </Section>

        <Section title="Plan & price">
          <Row label="Plan">
            {sub.plan.name} <span className="font-mono text-xs font-normal text-muted-foreground">({sub.plan.code})</span>
            {!sub.plan.is_active && <Badge variant="outline" className="ml-2">inactive</Badge>}
          </Row>
          <Row label="Billing">{INTERVAL_LABELS[sub.plan.billing_interval]}</Row>
          <Row label="Price (at assignment)">{formatMoney(sub.price_at_purchase, sub.currency)}</Row>
          {priceChanged && (
            <Row label="Current plan price">
              <span className="font-normal text-muted-foreground">
                {formatMoney(sub.plan.current_price, sub.plan.currency)} (this subscription keeps its own price)
              </span>
            </Row>
          )}
          <Row label="Payment">
            <span className="font-normal text-muted-foreground">Not tracked: assigning a plan does not mean it was paid</span>
          </Row>
        </Section>

        <Section title="Dates & status">
          <Row label="Status">
            <SubscriptionStatusBadge status={sub.status} />
          </Row>
          <Row label="Start date">{formatDateTime(sub.start_date)}</Row>
          <Row label="End date">{formatDateTime(sub.end_date, "No end date")}</Row>
          <Row label="Counts as active now">{sub.is_effective ? "Yes" : "No"}</Row>
        </Section>

        <Section title="Assignment">
          <Row label="Assigned">{formatDateTime(sub.assignment.assigned_at)}</Row>
          <Row label="Assigned by">
            {sub.assignment.assigned_by && `${sub.assignment.assigned_by.full_name} (${sub.assignment.assigned_by.email})`}
          </Row>
          <Row label="Notes">{sub.notes}</Row>
        </Section>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription history</CardTitle>
          <CardDescription>Every change to this subscription, newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="divide-y text-sm" data-testid="subscription-history">
            {sub.history.map((h) => (
              <li key={h.id} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 py-2.5">
                <div className="grid min-w-0 gap-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{HISTORY_ACTION_LABELS[h.action] ?? h.action}</Badge>
                    {h.previous_status && h.new_status && h.previous_status !== h.new_status && (
                      <span className="text-xs text-muted-foreground">
                        {SUBSCRIPTION_STATUS_LABELS[h.previous_status]} → {SUBSCRIPTION_STATUS_LABELS[h.new_status]}
                      </span>
                    )}
                    {h.previous_plan_name && h.new_plan_name && h.previous_plan_name !== h.new_plan_name && (
                      <span className="text-xs text-muted-foreground">
                        {h.previous_plan_name} → {h.new_plan_name}
                      </span>
                    )}
                  </div>
                  {h.notes && <span className="text-muted-foreground">{h.notes}</span>}
                </div>
                <span className="text-xs text-muted-foreground">
                  {h.changed_by_name ?? "System"} · {formatDateTime(h.created_at)}
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All subscriptions of this company</CardTitle>
          <CardDescription>Old periods are never overwritten; each keeps its own plan and price.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y text-sm" data-testid="company-subscriptions">
            {sub.organization_subscriptions.map((p) => (
              <li key={p.id} className={cn("flex flex-wrap items-center justify-between gap-2 py-2.5", p.id === sub.id && "font-medium")}>
                <Link href={`/subscriptions/${p.id}`} className="hover:underline">
                  {p.plan_name} · {formatDate(p.start_date)} – {formatDate(p.end_date, "no end date")}
                  {p.id === sub.id && " (this one)"}
                </Link>
                <span className="flex items-center gap-2">
                  <span className="tabular-nums">{formatMoney(p.price_at_purchase, p.currency)}</span>
                  <SubscriptionStatusBadge status={p.status} />
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <SubscriptionActionDialog
        subscription={sub}
        action={action}
        onClose={(updated) => {
          setAction(null)
          // Change plan / renew create a new subscription: go to it
          if (updated?.id && updated.id !== sub.id) router.push(`/subscriptions/${updated.id}`)
        }}
      />
    </div>
  )
}
