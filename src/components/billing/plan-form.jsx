"use client"

import { useId } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"

import { FormAlert, FormField } from "@/components/forms/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BILLING_INTERVALS, DEFAULT_DURATION_DAYS, INTERVAL_LABELS, formatMoney } from "@/lib/billing"
import { planFormSchema } from "@/lib/validations"

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD"]

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 dark:bg-input/30"
const textareaClass =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"

/** Form values -> API body. Edit mode never sends code or currency (they cannot change). */
function toPayload(values, mode) {
  const body = {
    name: values.name,
    description: values.description || null,
    price: values.price,
    billingInterval: values.billingInterval,
    durationDays: values.durationDays === "" ? null : Number(values.durationDays),
    isActive: values.isActive,
  }
  return mode === "create" ? { ...body, code: values.code, currency: values.currency } : body
}

/**
 * Create / edit plan form.
 * `mutation`: a react-query mutation taking the API body. `onSaved(response)` runs on success.
 */
export function PlanForm({ mode, plan, mutation, onSaved, onCancel }) {
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: plan?.name ?? "",
      code: plan?.code ?? "",
      description: plan?.description ?? "",
      price: plan?.price ?? "",
      currency: plan?.currency ?? "INR",
      billingInterval: plan?.billing_interval ?? "yearly",
      durationDays: plan?.duration_days ? String(plan.duration_days) : "",
      isActive: plan?.is_active ?? true,
    },
  })
  const [interval, price, currency] = useWatch({ control, name: ["billingInterval", "price", "currency"] })
  const defaultDays = DEFAULT_DURATION_DAYS[interval]

  const onSubmit = (values) =>
    mutation.mutate(toPayload(values, mode), {
      onSuccess: onSaved,
      onError: (error) =>
        error.errors?.forEach?.(({ field, message }) => {
          if (field) setError(field, { message }, { shouldFocus: true })
        }),
    })

  const bannerError = mutation.error && !mutation.error.errors ? mutation.error.message : null
  // Unique ids: Next.js keeps visited pages mounted (hidden), so the create and edit forms can both
  // be in the page at once; plain ids like "price" would then collide and labels could point to the wrong field.
  const prefix = useId()
  const fid = (name) => `${prefix}-${name}`
  const fieldProps = (name) => ({
    id: fid(name),
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${fid(name)}-error` : undefined,
    ...register(name),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
      <FormAlert>{bannerError}</FormAlert>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={fid("name")} label="Plan name" error={errors.name?.message}>
          <Input placeholder="Professional" {...fieldProps("name")} />
        </FormField>
        <FormField id={fid("code")} label="Plan code" error={errors.code?.message}>
          <Input
            placeholder="PROFESSIONAL"
            className="uppercase"
            disabled={mode === "edit"}
            title={mode === "edit" ? "The code cannot be changed" : undefined}
            {...fieldProps("code")}
          />
        </FormField>
      </div>

      <FormField id={fid("description")} label="Description (optional)" error={errors.description?.message}>
        <textarea rows={3} className={textareaClass} placeholder="What this plan includes" {...fieldProps("description")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <FormField id={fid("price")} label="Price" error={errors.price?.message}>
          <Input inputMode="decimal" placeholder="9999" {...fieldProps("price")} />
        </FormField>
        <FormField id={fid("currency")} label="Currency" error={errors.currency?.message}>
          <select className={selectClass} disabled={mode === "edit"} {...fieldProps("currency")}>
            {[...new Set([...CURRENCIES, plan?.currency].filter(Boolean))].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={fid("billingInterval")} label="Billing interval" error={errors.billingInterval?.message}>
          <select className={selectClass} {...fieldProps("billingInterval")}>
            {BILLING_INTERVALS.map((i) => (
              <option key={i} value={i}>
                {INTERVAL_LABELS[i]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id={fid("durationDays")} label="Duration in days (optional)" error={errors.durationDays?.message}>
          <Input inputMode="numeric" placeholder={defaultDays ? `Default: ${defaultDays}` : "Default: no end date"} {...fieldProps("durationDays")} />
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-primary" {...register("isActive")} />
        Active (can be assigned to companies)
      </label>

      {/^\d{1,10}(\.\d{1,2})?$/.test(price ?? "") && (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          Companies will be charged <span className="font-medium text-foreground">{formatMoney(price, currency)}</span>{" "}
          {INTERVAL_LABELS[interval]?.toLowerCase()}.
          {mode === "edit" && " Changing the price does not change existing subscriptions; they keep the price they were assigned at."}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={mutation.isPending || (mode === "edit" && !isDirty)}>
          {mutation.isPending && <Loader2Icon className="animate-spin" />}
          {mode === "create" ? "Create plan" : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
