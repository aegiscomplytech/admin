"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2Icon, CheckIcon, CircleIcon, Loader2Icon, MailCheckIcon } from "lucide-react"

import { FormAlert, FormField } from "@/components/forms/form-field"
import { PasswordInput } from "@/components/forms/password-input"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRegisterCompany, useResendVerification } from "@/hooks/use-company"
import { COMPANY_LOGIN_PATH } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { PASSWORD_RULES, companyRegistrationSchema } from "@/lib/validations"

const EMPTY = {
  legal_name: "",
  business_email: "",
  contact_name: "",
  contact_email: "",
  password: "",
  confirm_password: "",
  phone: "",
  website: "",
  address: "",
}

/** Text fields in form order: [name, label, type, autoComplete, placeholder, optional] */
const FIELDS = [
  ["legal_name", "Company legal name", "text", "organization", "Acme Technologies Pvt Ltd"],
  ["business_email", "Business email", "email", "email", "contact@acme.com"],
  ["phone", "Phone number", "tel", "tel", "+91 98765 43210"],
  ["website", "Website", "url", "url", "acme.com", true],
  ["contact_name", "Contact person name", "text", "name", "Priya Sharma"],
  ["contact_email", "Contact person email", "email", "email", "priya@acme.com"],
]

function RegistrationSuccess({ email, emailSent }) {
  const resend = useResendVerification()

  return (
    <Card>
      <CardHeader className="text-center">
        <span className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <MailCheckIcon className="size-5" />
        </span>
        <CardTitle className="text-xl">Registration successful</CardTitle>
        <CardDescription>Thank you for registering your company.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <ol className="grid gap-3">
          <li className="rounded-lg border p-3">
            <p className="font-medium">1. Verify your email</p>
            <p className="text-muted-foreground">
              {emailSent ? (
                <>
                  We sent a verification link to <span className="font-medium text-foreground">{email}</span>. Open it to
                  confirm your email address. The link is valid for 24 hours.
                </>
              ) : (
                <>We couldn&apos;t send the verification email right now. Please use the button below to try again.</>
              )}
            </p>
          </li>
          <li className="rounded-lg border p-3">
            <p className="font-medium">2. Wait for approval</p>
            <p className="text-muted-foreground">
              After you verify your email, our team reviews your registration. You can sign in at any time to check its
              status. Company features become available once your company is approved.
            </p>
          </li>
        </ol>

        {resend.isSuccess && (
          <p role="status" className="rounded-lg bg-muted px-3 py-2 text-muted-foreground">
            {resend.data.message}
          </p>
        )}
        <FormAlert>{resend.error?.message}</FormAlert>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" onClick={() => resend.mutate(email)} disabled={resend.isPending}>
            {resend.isPending && <Loader2Icon className="animate-spin" />}
            Resend verification email
          </Button>
          <Link href={COMPANY_LOGIN_PATH} className={buttonVariants()}>
            Sign in to check status
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RegisterPage() {
  const register = useRegisterCompany()
  const [result, setResult] = useState(null)

  const {
    register: field,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(companyRegistrationSchema), defaultValues: EMPTY })
  const password = useWatch({ control, name: "password" })

  const onSubmit = ({ confirm_password: _confirm, ...values }) =>
    register.mutate(values, {
      onSuccess: (response) => setResult({ email: values.contact_email, emailSent: response.data.verification_email_sent }),
      onError: (error) => {
        // Field errors from the backend (duplicates, validation) go next to the field
        error.errors?.forEach?.(({ field: name, message }) => {
          if (name in EMPTY) setError(name, { message }, { shouldFocus: true })
        })
      },
    })

  if (result) return <RegistrationSuccess email={result.email} emailSent={result.emailSent} />

  const bannerError = register.error && !register.error.errors ? register.error.message : null

  return (
    <Card>
      <CardHeader className="text-center">
        <span className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Building2Icon className="size-5" />
        </span>
        <CardTitle className="text-xl">Register your company</CardTitle>
        <CardDescription>Create your company account. Registrations are reviewed before activation.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
          <FormAlert>{bannerError}</FormAlert>

          {FIELDS.map(([name, label, type, autoComplete, placeholder, optional]) => (
            <FormField key={name} id={name} label={optional ? `${label} (optional)` : label} error={errors[name]?.message}>
              <Input
                id={name}
                type={type}
                autoComplete={autoComplete}
                placeholder={placeholder}
                aria-invalid={!!errors[name]}
                aria-describedby={errors[name] ? `${name}-error` : undefined}
                {...field(name)}
              />
            </FormField>
          ))}

          <FormField id="address" label="Company address (optional)" error={errors.address?.message}>
            <textarea
              id="address"
              rows={2}
              autoComplete="street-address"
              aria-invalid={!!errors.address}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
              {...field("address")}
            />
          </FormField>

          <FormField id="password" label="Password" error={errors.password?.message}>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...field("password")}
            />
            <ul className="grid gap-1 text-xs" aria-label="Password requirements">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(password ?? "")
                return (
                  <li key={rule.label} className={cn("flex items-center gap-1.5", passed ? "text-foreground" : "text-muted-foreground")}>
                    {passed ? <CheckIcon className="size-3.5" /> : <CircleIcon className="size-3" />}
                    {rule.label}
                  </li>
                )
              })}
            </ul>
          </FormField>

          <FormField id="confirm_password" label="Confirm password" error={errors.confirm_password?.message}>
            <PasswordInput
              id="confirm_password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirm_password}
              aria-describedby={errors.confirm_password ? "confirm_password-error" : undefined}
              {...field("confirm_password")}
            />
          </FormField>

          <Button type="submit" size="lg" className="w-full" disabled={register.isPending}>
            {register.isPending && <Loader2Icon className="animate-spin" />}
            {register.isPending ? "Registering…" : "Register company"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link href={COMPANY_LOGIN_PATH} className="font-medium text-foreground underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
