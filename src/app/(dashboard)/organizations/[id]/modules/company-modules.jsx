"use client"

import { useId, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AlertTriangleIcon, ArrowLeftIcon, Loader2Icon, RefreshCwIcon } from "lucide-react"

import { SubscriptionStatusBadge } from "@/components/billing/badges"
import { FormAlert, FormField } from "@/components/forms/form-field"
import { ModuleIcon } from "@/components/modules/module-icon"
import { OrganizationStatusBadge } from "@/components/organizations/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import { useChangeCompanyModule, useCompanyModules } from "@/hooks/use-modules"
import { endOfDayIso, formatDate, toDateInput } from "@/lib/billing"
import { cn } from "@/lib/utils"

const DENIED_LABELS = {
  organization_not_active: "Company not active",
  no_active_subscription: "No active subscription",
  module_inactive: "Module inactive",
  revoked: "Revoked",
  not_in_plan: "Not in plan",
}

const ACTION_COPY = {
  grant: {
    title: "Grant module access",
    body: "The company gets this module on top of its plan, as long as it has a valid subscription.",
    confirm: "Grant access",
    variant: "default",
  },
  revoke: {
    title: "Revoke module access",
    body: "The company loses this module, even if its plan includes it.",
    confirm: "Revoke access",
    variant: "destructive",
  },
  reset: {
    title: "Reset override",
    body: "The manual grant/revoke is removed and the plan decides access again.",
    confirm: "Reset override",
    variant: "outline",
  },
}

function AccessBadge({ module }) {
  if (module.has_access) {
    return <Badge variant="secondary">{module.source === "granted" ? "Allowed · granted" : "Allowed · plan"}</Badge>
  }
  return (
    <Badge variant={module.denied_reason === "revoked" ? "destructive" : "outline"} className={module.denied_reason !== "revoked" ? "text-muted-foreground" : undefined}>
      {DENIED_LABELS[module.denied_reason] ?? "Denied"}
    </Badge>
  )
}

function OverrideCell({ override }) {
  if (!override) return <span className="text-muted-foreground">—</span>
  return (
    <div className="grid gap-0.5 text-xs">
      <span className="flex flex-wrap items-center gap-1.5">
        <Badge variant={override.access_status === "granted" ? "secondary" : "destructive"}>
          {override.access_status === "granted" ? "Granted" : "Revoked"}
        </Badge>
        {override.is_expired && <Badge variant="outline">expired</Badge>}
      </span>
      <span className="text-muted-foreground" title={override.reason}>
        {override.reason}
      </span>
      <span className="text-muted-foreground">
        {override.expires_at ? `${override.is_expired ? "Expired" : "Until"} ${formatDate(override.expires_at)}` : "No expiry"}
        {override.granted_by ? ` · ${override.granted_by}` : ""}
      </span>
    </div>
  )
}

function OverrideDialog({ organization, target, onClose }) {
  const prefix = useId()
  const mutation = useChangeCompanyModule(organization.id)
  const [reason, setReason] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [errors, setErrors] = useState({})
  const [tomorrow] = useState(() => toDateInput(Date.now() + 86400000))
  if (!target) return null
  const { module, action } = target
  const copy = ACTION_COPY[action]

  const submit = (event) => {
    event.preventDefault()
    if (action !== "reset" && reason.trim().length < 5) {
      setErrors({ reason: "Please give a reason of at least 5 characters." })
      return
    }
    mutation.mutate(
      {
        moduleId: module.id,
        action,
        input: action === "reset" ? undefined : { reason: reason.trim(), ...(expiresAt && { expiresAt: endOfDayIso(expiresAt) }) },
      },
      {
        onSuccess: (response) => {
          toast.add({ type: "success", title: response.message, description: `${module.name} · ${organization.legal_name}` })
          onClose()
        },
        onError: (error) => setErrors(Object.fromEntries((error.errors ?? []).filter((e) => e.field).map((e) => [e.field, e.message]))),
      }
    )
  }

  return (
    <Dialog open onOpenChange={(o) => !o && !mutation.isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">
                {module.name} · {organization.legal_name}
              </span>
              <br />
              {copy.body}
            </DialogDescription>
          </DialogHeader>
          <FormAlert>{mutation.error && !mutation.error.errors ? mutation.error.message : null}</FormAlert>
          {action !== "reset" && (
            <>
              <FormField id={`${prefix}-reason`} label="Reason (required)" error={errors.reason}>
                <textarea
                  id={`${prefix}-reason`}
                  rows={3}
                  maxLength={1000}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value)
                    setErrors({})
                  }}
                  aria-invalid={!!errors.reason}
                  className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30"
                  placeholder={action === "grant" ? "Pilot access agreed with the customer" : "Module not part of the contract"}
                />
              </FormField>
              <FormField id={`${prefix}-expires`} label="Expires on (optional)" error={errors.expiresAt}>
                <Input id={`${prefix}-expires`} type="date" min={tomorrow} value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </FormField>
            </>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" disabled={mutation.isPending} />}>Cancel</DialogClose>
            <Button type="submit" variant={copy.variant} disabled={mutation.isPending}>
              {mutation.isPending && <Loader2Icon className="animate-spin" />}
              {copy.confirm}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CompanyModules() {
  const { id } = useParams()
  const { data, isPending, isError, error, isFetching, refetch } = useCompanyModules(id)
  const [target, setTarget] = useState(null)

  const back = (
    <Link href={`/organizations/${id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-self-start")}>
      <ArrowLeftIcon />
      Company details
    </Link>
  )
  if (isPending) return <div className="mx-auto grid w-full max-w-6xl gap-4">{back}<Skeleton className="h-96" /></div>
  if (isError) {
    return (
      <div className="mx-auto grid w-full max-w-6xl gap-4">
        {back}
        <Card role="alert">
          <CardHeader>
            <CardTitle>{error.status === 404 ? "Company not found" : "Couldn't load module access"}</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const { organization, subscription, modules, summary } = data
  const blocked = organization.status !== "approved" ? "The company is not approved, so it cannot use any module." : !subscription ? "The company has no valid subscription, so it cannot use any module (manual grants included)." : null

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4">
      {back}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
            {organization.legal_name}
            <OrganizationStatusBadge status={organization.status} />
          </CardTitle>
          <CardDescription data-testid="subscription-line">
            {subscription ? (
              <>
                Plan <span className="font-medium text-foreground">{subscription.plan.name}</span> ·{" "}
                <SubscriptionStatusBadge status={subscription.status} /> · {formatDate(subscription.start_date)} – {formatDate(subscription.end_date, "no end date")}
              </>
            ) : (
              "No valid subscription"
            )}
          </CardDescription>
          <CardAction>
            <Button variant="ghost" size="icon-sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-3">
          {blocked && (
            <p role="status" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
              <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
              {blocked}
            </p>
          )}
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4" aria-label="Summary">
            {[
              ["Accessible", summary.accessible],
              ["From plan", summary.from_plan],
              ["Granted", summary.granted],
              ["Revoked", summary.revoked],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border px-3 py-2">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="text-lg font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modules</CardTitle>
          <CardDescription>Access is calculated from the plan and the overrides below; a revoke always wins over the plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  {["Module", "In plan", "Override", "Access", "Actions"].map((c) => (
                    <TableHead key={c} className="px-3">
                      {c}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((m) => {
                  const activeGrant = m.override?.access_status === "granted" && !m.override.is_expired
                  const activeRevoke = m.override?.access_status === "revoked" && !m.override.is_expired
                  return (
                    <TableRow key={m.id} data-module={m.code}>
                      <TableCell className="px-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <ModuleIcon name={m.icon} />
                          </span>
                          <div className="grid">
                            <span className="font-medium">{m.name}</span>
                            <span className="font-mono text-xs text-muted-foreground">{m.code}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3">{m.in_plan ? "Yes" : <span className="text-muted-foreground">No</span>}</TableCell>
                      <TableCell className="max-w-xs px-3 whitespace-normal">
                        <OverrideCell override={m.override} />
                      </TableCell>
                      <TableCell className="px-3">
                        <AccessBadge module={m} />
                      </TableCell>
                      <TableCell className="px-3">
                        <div className="flex flex-wrap gap-1.5">
                          {!activeGrant && m.is_active && (
                            <Button size="sm" variant="outline" onClick={() => setTarget({ module: m, action: "grant" })} aria-label={`Grant ${m.name}`}>
                              Grant
                            </Button>
                          )}
                          {!activeRevoke && (
                            <Button size="sm" variant="ghost" onClick={() => setTarget({ module: m, action: "revoke" })} aria-label={`Revoke ${m.name}`}>
                              Revoke
                            </Button>
                          )}
                          {m.override && (
                            <Button size="sm" variant="ghost" onClick={() => setTarget({ module: m, action: "reset" })} aria-label={`Reset ${m.name}`}>
                              Reset
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <OverrideDialog key={target ? `${target.module.id}-${target.action}` : "none"} organization={organization} target={target} onClose={() => setTarget(null)} />
    </div>
  )
}
