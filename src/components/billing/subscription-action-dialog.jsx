"use client"

import { useState } from "react"
import { Loader2Icon } from "lucide-react"

import { FormAlert, FormField } from "@/components/forms/form-field"
import { Button } from "@/components/ui/button"
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
import { usePlans, useSubscriptionAction } from "@/hooks/use-billing"
import {
  endOfDayIso,
  formatDate,
  formatMoney,
  periodEndDate,
  planDurationDays,
  startOfDayIso,
  toDateInput,
  todayInput,
} from "@/lib/billing"

const STATUS_COPY = {
  activate: {
    title: "Activate this subscription?",
    body: "The subscription becomes active. A scheduled subscription starts today.",
    confirm: "Activate",
    status: "active",
    variant: "default",
  },
  suspend: {
    title: "Suspend this subscription?",
    body: "The subscription stays on record but no longer counts as active until it is reactivated.",
    confirm: "Suspend",
    status: "suspended",
    variant: "destructive",
  },
  cancel: {
    title: "Cancel this subscription?",
    body: "This cannot be undone. The company would need a new subscription afterwards.",
    confirm: "Cancel subscription",
    status: "cancelled",
    variant: "destructive",
  },
}

const textareaClass =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
const selectClass = "h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm dark:bg-input/30"

function NotesField({ value, onChange }) {
  return (
    <FormField id="action-notes" label="Notes (optional, kept in the history)">
      <textarea id="action-notes" rows={2} maxLength={1000} className={textareaClass} value={value} onChange={(e) => onChange(e.target.value)} />
    </FormField>
  )
}

/**
 * One dialog for every subscription action.
 * `action`: "activate" | "suspend" | "cancel" | "change-plan" | "renew" | null (closed).
 */
export function SubscriptionActionDialog({ subscription, action, onClose }) {
  const mutation = useSubscriptionAction()
  const plans = usePlans({ page: 1, limit: 100, status: "active" })
  const [notes, setNotes] = useState("")
  const [planId, setPlanId] = useState("")
  const [when, setWhen] = useState("now")
  const [effectiveDate, setEffectiveDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [error, setError] = useState(null)
  // Earliest date for a scheduled plan change (computed once, not on every render)
  const [tomorrow] = useState(() => toDateInput(Date.now() + 86400000))

  const close = () => {
    if (mutation.isPending) return
    mutation.reset()
    setNotes("")
    setPlanId("")
    setWhen("now")
    setEffectiveDate("")
    setEndDate("")
    setError(null)
    onClose()
  }

  if (!action) return null

  const run = (apiAction, input, successTitle) =>
    mutation.mutate(
      { id: subscription.id, action: apiAction, input },
      {
        onSuccess: (response) => {
          toast.add({ type: "success", title: successTitle ?? response.message })
          close()
          onClose(response.data)
        },
        onError: (e) => setError(e.errors?.[0]?.message ?? e.message),
      }
    )

  const trimmedNotes = notes.trim() || undefined
  let title, description, body, confirm, onConfirm, variant = "default"

  if (STATUS_COPY[action]) {
    const copy = STATUS_COPY[action]
    ;({ title, confirm, variant } = copy)
    description = copy.body
    body = <NotesField value={notes} onChange={setNotes} />
    onConfirm = () => run("status", { status: copy.status, notes: trimmedNotes })
  }

  if (action === "change-plan") {
    const newPlan = plans.data?.items?.find((p) => p.id === planId)
    const startInput = when === "now" ? todayInput() : effectiveDate
    const defaultEnd = periodEndDate(startInput, planDurationDays(newPlan))
    title = "Change plan"
    description = `Currently on ${subscription.plan.name}. A new subscription is created on the new plan at its current price; the current one is kept in the history.`
    body = (
      <div className="grid gap-3">
        <FormField id="new-plan" label="New plan">
          <select id="new-plan" className={selectClass} value={planId} onChange={(e) => setPlanId(e.target.value)}>
            <option value="">Select a plan</option>
            {plans.data?.items
              ?.filter((p) => p.id !== subscription.plan.id)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {formatMoney(p.price, p.currency)}
                </option>
              ))}
          </select>
        </FormField>
        <fieldset className="grid gap-1.5 text-sm">
          <legend className="mb-1 font-medium">Effective</legend>
          <label className="flex items-center gap-2">
            <input type="radio" name="when" value="now" checked={when === "now"} onChange={() => setWhen("now")} /> Immediately
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="when" value="date" checked={when === "date"} onChange={() => setWhen("date")} /> On a later date
          </label>
          {when === "date" && (
            <Input
              type="date"
              aria-label="Effective date"
              value={effectiveDate}
              min={tomorrow}
              max={subscription.end_date ? toDateInput(new Date(subscription.end_date).getTime() - 86400000) : undefined}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          )}
        </fieldset>
        <FormField id="change-end" label="New end date (optional)">
          <Input id="change-end" type="date" value={endDate || defaultEnd} min={startInput} onChange={(e) => setEndDate(e.target.value)} />
        </FormField>
        {newPlan && (
          <p className="rounded-lg bg-muted px-3 py-2 text-muted-foreground">
            New price: <span className="font-medium text-foreground">{formatMoney(newPlan.price, newPlan.currency)}</span>
          </p>
        )}
        <NotesField value={notes} onChange={setNotes} />
      </div>
    )
    confirm = "Change plan"
    onConfirm = () => {
      if (!planId) return setError("Select a new plan.")
      if (when === "date" && !effectiveDate) return setError("Choose the effective date.")
      const end = endDate || defaultEnd
      run("change-plan", {
        planId,
        ...(when === "date" && { effectiveDate: startOfDayIso(effectiveDate) }),
        ...(end && { endDate: endOfDayIso(end) }),
        notes: trimmedNotes,
      })
    }
  }

  if (action === "renew") {
    const days = planDurationDays(subscription.plan)
    const start = subscription.status === "active" && subscription.end_date ? new Date(subscription.end_date) : new Date()
    const defaultEnd = days ? new Date(start.getTime() + days * 86400000) : null
    title = "Renew subscription"
    description =
      subscription.status === "active"
        ? `A new period on ${subscription.plan.name} is scheduled to start when the current one ends.`
        : `A new period on ${subscription.plan.name} starts today.`
    body = (
      <div className="grid gap-3">
        <dl className="grid gap-1 rounded-lg bg-muted px-3 py-2">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">New period starts</dt>
            <dd className="font-medium">{formatDate(start)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Price (current plan price)</dt>
            <dd className="font-medium">{formatMoney(subscription.plan.current_price, subscription.plan.currency)}</dd>
          </div>
        </dl>
        <FormField id="renew-end" label={days ? `End date (default: ${days} days later)` : "End date (optional)"}>
          <Input
            id="renew-end"
            type="date"
            value={endDate || (defaultEnd ? toDateInput(defaultEnd) : "")}
            min={toDateInput(start)}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </FormField>
        <NotesField value={notes} onChange={setNotes} />
      </div>
    )
    confirm = "Renew"
    // Without a custom end date the backend uses the exact plan length
    onConfirm = () => run("renew", { ...(endDate && { endDate: endOfDayIso(endDate) }), notes: trimmedNotes })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{subscription.organization.legal_name}</span>
            <br />
            {description}
          </DialogDescription>
        </DialogHeader>
        <FormAlert>{error}</FormAlert>
        <div className="text-sm">{body}</div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={mutation.isPending} />}>Close</DialogClose>
          <Button variant={variant} onClick={onConfirm} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2Icon className="animate-spin" />}
            {confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
