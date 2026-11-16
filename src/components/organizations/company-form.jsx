"use client"

import { useId } from "react"
import { useForm } from "react-hook-form"
import { Loader2Icon } from "lucide-react"

import { FormAlert, FormField } from "@/components/forms/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const textareaClass =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"

/** Every field of a company (same names as the API). */
const FIELDS = ["legal_name", "display_name", "business_email", "business_phone", "website", "registration_number", "address", "city", "state", "country", "postal_code"]

function toDefaults(company) {
  return Object.fromEntries(FIELDS.map((field) => [field, company?.[field] ?? (field === "country" && !company ? "India" : "")]))
}

/**
 * Create / edit company form. Validation is done by the backend; its field errors are shown under the fields.
 * Create sends every filled field; edit sends only what changed ("" clears an optional field).
 * `mutation` takes the API body; `onSaved(response)` runs on success.
 */
export function CompanyForm({ mode, company, mutation, onSaved, onCancel }) {
  const defaults = toDefaults(company)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty, dirtyFields },
  } = useForm({ defaultValues: defaults })

  const onSubmit = (values) => {
    const body =
      mode === "create"
        ? Object.fromEntries(Object.entries(values).filter(([, value]) => String(value).trim() !== ""))
        : Object.fromEntries(Object.keys(dirtyFields).map((field) => [field, values[field]]))
    mutation.mutate(body, {
      onSuccess: onSaved,
      onError: (error) =>
        error.errors?.forEach?.(({ field, message }) => {
          if (FIELDS.includes(field)) setError(field, { message }, { shouldFocus: true })
        }),
    })
  }

  const fieldErrors = mutation.error?.errors?.some?.((e) => FIELDS.includes(e.field))
  const bannerError = mutation.error && !fieldErrors ? mutation.error.message : null
  // Unique ids: hidden pages stay mounted (Next.js), so the create and edit forms can exist at the same time
  const prefix = useId()
  const fid = (name) => `${prefix}-${name}`
  const fieldProps = (name, options) => ({
    id: fid(name),
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${fid(name)}-error` : undefined,
    ...register(name, options),
  })
  const field = (name, label, props = {}) => (
    <FormField id={fid(name)} label={label} error={errors[name]?.message}>
      <Input {...props} {...fieldProps(name)} />
    </FormField>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4" data-testid="company-form">
      <FormAlert>{bannerError}</FormAlert>

      <div className="grid gap-4 sm:grid-cols-2">
        {field("legal_name", "Legal name", { placeholder: "ABC Technologies Pvt Ltd", autoComplete: "organization" })}
        {field("display_name", "Display name (optional)", { placeholder: "Same as the legal name" })}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("business_email", "Business email", { type: "email", placeholder: "contact@abc.example", autoComplete: "email" })}
        {field("business_phone", "Phone (optional)", { type: "tel", placeholder: "+91 98765 43210", autoComplete: "tel" })}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("website", "Website (optional)", { placeholder: "abc.example" })}
        {field("registration_number", "Registration number (optional)", { placeholder: "CIN / GSTIN" })}
      </div>
      <FormField id={fid("address")} label="Address (optional)" error={errors.address?.message}>
        <textarea rows={2} className={textareaClass} {...fieldProps("address")} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-4">
        {field("city", "City")}
        {field("state", "State")}
        {field("country", "Country")}
        {field("postal_code", "Postal code")}
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={mutation.isPending || (mode === "edit" && !isDirty)}>
          {mutation.isPending && <Loader2Icon className="animate-spin" />}
          {mode === "create" ? "Create company" : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
