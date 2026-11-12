"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2Icon, Loader2Icon, MailCheckIcon } from "lucide-react"

import { FormAlert, FormField } from "@/components/forms/form-field"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRegisterCompany } from "@/hooks/use-company"
import { COMPANY_LOGIN_PATH } from "@/lib/auth"
import { companyRegistrationSchema } from "@/lib/validations"

const EMPTY = {
  legal_name: "",
  business_email: "",
  contact_name: "",
  contact_email: "",
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

function RegistrationSuccess({ email }) {
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
        <ol className="grid gap-3" data-testid="registration-next-steps">
          <li className="rounded-lg border p-3">
            <p className="font-medium">1. Check your email</p>
            <p className="text-muted-foreground">
              We sent your <span className="font-medium text-foreground">Admin ID</span> and a{" "}
              <span className="font-medium text-foreground">temporary password</span> to{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
          </li>
          <li className="rounded-lg border p-3">
            <p className="font-medium">2. Sign in and set your password</p>
            <p className="text-muted-foreground">
              Sign in with your Admin ID (or email) and the temporary password. You will be asked to choose your own
              password straight away.
            </p>
          </li>
          <li className="rounded-lg border p-3">
            <p className="font-medium">3. Wait for approval</p>
            <p className="text-muted-foreground">
              Our team reviews your registration. You can sign in at any time to check its status. Company features become
              available once your company is approved.
            </p>
          </li>
        </ol>
        <Link href={COMPANY_LOGIN_PATH} className={buttonVariants({ size: "lg" })}>
          Go to sign in
        </Link>
        <p className="text-center text-xs text-muted-foreground">
          No email after a few minutes? Check your spam folder, or contact the Aegis support team.
        </p>
      </CardContent>
    </Card>
  )
}

export default function RegisterPage() {
  const register = useRegisterCompany()
  const [sentTo, setSentTo] = useState(null)

  const {
    register: field,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(companyRegistrationSchema), defaultValues: EMPTY })

  const onSubmit = (values) =>
    register.mutate(values, {
      onSuccess: (response) => setSentTo(response.data.credentials_sent_to ?? values.contact_email),
      onError: (error) => {
        // Field errors from the backend (duplicates, validation) go next to the field
        error.errors?.forEach?.(({ field: name, message }) => {
          if (name in EMPTY) setError(name, { message }, { shouldFocus: true })
        })
      },
    })

  if (sentTo) return <RegistrationSuccess email={sentTo} />

  const bannerError = register.error && !register.error.errors ? register.error.message : null

  return (
    <Card>
      <CardHeader className="text-center">
        <span className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Building2Icon className="size-5" />
        </span>
        <CardTitle className="text-xl">Register your company</CardTitle>
        <CardDescription>
          Your company admin login (Admin ID and temporary password) is emailed to the contact person. Registrations are
          reviewed before activation.
        </CardDescription>
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
