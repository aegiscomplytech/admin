"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, Loader2Icon, SearchIcon } from "lucide-react"

import { FormAlert, FormField } from "@/components/forms/form-field"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { toast } from "@/components/ui/toast"
import { useAssignSubscription, usePlans } from "@/hooks/use-billing"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useOrganizations } from "@/hooks/use-organizations"
import {
  INTERVAL_LABELS,
  describeDuration,
  endOfDayIso,
  formatDate,
  formatMoney,
  periodEndDate,
  planDurationDays,
  startOfDayIso,
  todayInput,
} from "@/lib/billing"
import { cn } from "@/lib/utils"

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30"

function SummaryRow({ label, children }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 py-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  )
}

export default function AssignSubscriptionPage() {
  const router = useRouter()
  const assign = useAssignSubscription()

  const [companySearch, setCompanySearch] = useState("")
  const [organizationId, setOrganizationId] = useState("")
  const [planId, setPlanId] = useState("")
  const [startDate, setStartDate] = useState(todayInput)
  const [endDate, setEndDate] = useState("")
  const [endTouched, setEndTouched] = useState(false)
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState({})
  const [confirming, setConfirming] = useState(false)

  // Only approved companies can get a subscription; only active plans can be assigned
  const search = useDebouncedValue(companySearch.trim())
  const companies = useOrganizations({ page: 1, limit: 20, status: "approved", search })
  const plans = usePlans({ page: 1, limit: 100, status: "active" })

  const company = companies.data?.items?.find((c) => c.id === organizationId) ?? null
  const plan = plans.data?.items?.find((p) => p.id === planId) ?? null
  const days = planDurationDays(plan)
  // End date follows the plan length until the admin edits it
  const effectiveEnd = endTouched ? endDate : periodEndDate(startDate, days)

  // A field's error disappears as soon as the admin changes that field
  const clearError = (field) => setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))

  const validate = () => {
    const next = {}
    if (!organizationId) next.organizationId = "Select a company"
    if (!planId) next.planId = "Select a plan"
    if (!startDate) next.startDate = "Choose a start date"
    if (effectiveEnd && startDate && effectiveEnd < startDate) next.endDate = "End date must be on or after the start date"
    if (effectiveEnd && effectiveEnd < todayInput()) next.endDate = "End date must be in the future"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = () =>
    assign.mutate(
      {
        organizationId,
        planId,
        startDate: startOfDayIso(startDate),
        ...(effectiveEnd && { endDate: endOfDayIso(effectiveEnd) }),
        ...(notes.trim() && { notes: notes.trim() }),
      },
      {
        onSuccess: (response) => {
          toast.add({ type: "success", title: "Subscription assigned", description: `${plan.name} → ${company.legal_name}` })
          router.push(`/subscriptions/${response.data.id}`)
        },
        onError: (error) => {
          setConfirming(false)
          const fieldErrors = Object.fromEntries((error.errors ?? []).filter((e) => e.field).map((e) => [e.field, e.message]))
          setErrors(fieldErrors)
        },
      }
    )

  const bannerError = assign.error && !assign.error.errors ? assign.error.message : null

  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4">
      <Link href="/subscriptions" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-self-start")}>
        <ArrowLeftIcon />
        All subscriptions
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assign subscription</CardTitle>
          <CardDescription>Give an approved company a plan. This records the plan price; it does not charge the company.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            noValidate
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              if (validate()) setConfirming(true)
            }}
          >
            <FormAlert>{bannerError}</FormAlert>

            <FormField id="organizationId" label="Company (approved companies only)" error={errors.organizationId}>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  aria-label="Search approved companies"
                  placeholder="Type to search companies"
                  className="pl-8"
                  value={companySearch}
                  onChange={(event) => setCompanySearch(event.target.value)}
                />
              </div>
              <select
                id="organizationId"
                className={selectClass}
                value={organizationId}
                aria-invalid={!!errors.organizationId}
                onChange={(event) => {
                  setOrganizationId(event.target.value)
                  clearError("organizationId")
                }}
              >
                <option value="">
                  {companies.isPending ? "Loading…" : companies.data?.items?.length ? "Select a company" : "No approved companies found"}
                </option>
                {companies.data?.items?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.legal_name} ({c.business_email})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="planId" label="Plan (active plans only)" error={errors.planId}>
              <select
                id="planId"
                className={selectClass}
                value={planId}
                aria-invalid={!!errors.planId}
                onChange={(event) => {
                  setPlanId(event.target.value)
                  clearError("planId")
                }}
              >
                <option value="">{plans.isPending ? "Loading…" : "Select a plan"}</option>
                {plans.data?.items?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {formatMoney(p.price, p.currency)} {INTERVAL_LABELS[p.billing_interval].toLowerCase()}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="startDate" label="Start date" error={errors.startDate}>
                <Input id="startDate" type="date" value={startDate} aria-invalid={!!errors.startDate} onChange={(e) => {
                  setStartDate(e.target.value)
                  clearError("startDate")
                }} />
              </FormField>
              <FormField id="endDate" label={days ? `End date (plan length: ${days} days)` : "End date (optional)"} error={errors.endDate}>
                <Input
                  id="endDate"
                  type="date"
                  value={effectiveEnd}
                  min={startDate}
                  aria-invalid={!!errors.endDate}
                  onChange={(e) => {
                    setEndTouched(true)
                    setEndDate(e.target.value)
                    clearError("endDate")
                  }}
                />
              </FormField>
            </div>

            <FormField id="notes" label="Notes (optional)">
              <textarea
                id="notes"
                rows={2}
                maxLength={1000}
                value={notes}
                placeholder="Annual subscription"
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              />
            </FormField>

            {plan && (
              <section aria-label="Selected plan" className="rounded-lg border bg-muted/40 p-3 text-sm" data-testid="plan-summary">
                <p className="mb-1 font-medium">Selected plan</p>
                <dl className="divide-y">
                  <SummaryRow label="Plan">
                    {plan.name} <span className="font-mono text-xs text-muted-foreground">({plan.code})</span>
                  </SummaryRow>
                  <SummaryRow label="Price">{formatMoney(plan.price, plan.currency)}</SummaryRow>
                  <SummaryRow label="Billing">
                    {INTERVAL_LABELS[plan.billing_interval]} · {describeDuration(plan)}
                  </SummaryRow>
                  <SummaryRow label="Period">
                    {formatDate(startDate && `${startDate}T00:00:00`)} – {effectiveEnd ? formatDate(`${effectiveEnd}T00:00:00`) : "no end date"}
                  </SummaryRow>
                </dl>
              </section>
            )}

            <div className="flex justify-end gap-2">
              <Link href="/subscriptions" className={buttonVariants({ variant: "outline" })}>
                Cancel
              </Link>
              <Button type="submit">Review &amp; assign</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={confirming} onOpenChange={(open) => !open && !assign.isPending && setConfirming(false)}>
        {confirming && company && plan && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign this subscription?</DialogTitle>
              <DialogDescription>Please check the details. The price is saved with the subscription and won&apos;t change if the plan price changes later.</DialogDescription>
            </DialogHeader>
            <dl className="divide-y text-sm">
              <SummaryRow label="Company">{company.legal_name}</SummaryRow>
              <SummaryRow label="Plan">{plan.name}</SummaryRow>
              <SummaryRow label="Price">{formatMoney(plan.price, plan.currency)}</SummaryRow>
              <SummaryRow label="Start">{formatDate(`${startDate}T00:00:00`)}</SummaryRow>
              <SummaryRow label="End">{effectiveEnd ? formatDate(`${effectiveEnd}T00:00:00`) : "No end date"}</SummaryRow>
            </dl>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" disabled={assign.isPending} />}>Back</DialogClose>
              <Button onClick={submit} disabled={assign.isPending}>
                {assign.isPending && <Loader2Icon className="animate-spin" />}
                Confirm &amp; assign
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
