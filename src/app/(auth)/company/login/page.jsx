"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2Icon, Loader2Icon } from "lucide-react"

import { FormAlert, FormField } from "@/components/forms/form-field"
import { PasswordInput } from "@/components/forms/password-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCompanyLogin } from "@/hooks/use-company"
import { COMPANY_CHANGE_PASSWORD_PATH, getSafeCompanyRedirectPath } from "@/lib/auth"
import { companyLoginSchema } from "@/lib/validations"

/** Company admin login with the Admin ID (or email) from the welcome email. Not the Super Admin login (/login). */
export default function CompanyLoginPage() {
  const router = useRouter()
  const login = useCompanyLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(companyLoginSchema), defaultValues: { identifier: "", password: "" } })

  const onSubmit = (values) =>
    login.mutate(values, {
      onSuccess: (response) => {
        // A temporary password must be replaced before anything else
        if (response.data?.must_change_password) return router.replace(COMPANY_CHANGE_PASSWORD_PATH)
        router.replace(getSafeCompanyRedirectPath(new URLSearchParams(window.location.search).get("next")))
      },
    })

  return (
    <Card>
      <CardHeader className="text-center">
        <span className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Building2Icon className="size-5" />
        </span>
        <CardTitle className="text-xl">Company sign in</CardTitle>
        <CardDescription>Use the Admin ID and password from your welcome email</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
          <FormAlert>{login.error?.message}</FormAlert>
          <FormField id="identifier" label="Admin ID or email" error={errors.identifier?.message}>
            <Input
              id="identifier"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="AEG-123456"
              aria-invalid={!!errors.identifier}
              aria-describedby={errors.identifier ? "identifier-error" : undefined}
              {...register("identifier")}
            />
          </FormField>
          <FormField id="password" label="Password" error={errors.password?.message}>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
          </FormField>
          <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
            {login.isPending && <Loader2Icon className="animate-spin" />}
            {login.isPending ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Lost your login details? Contact the Aegis support team to reset them.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            New company?{" "}
            <Link href="/register" className="font-medium text-foreground underline underline-offset-2">
              Register here
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
