"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon, ShieldCheckIcon } from "lucide-react"

import { FormAlert, FormField } from "@/components/forms/form-field"
import { PasswordInput } from "@/components/forms/password-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCurrentAdmin, useLogin } from "@/hooks/use-auth"
import { getSafeRedirectPath } from "@/lib/auth"
import { loginSchema } from "@/lib/validations"

/** Where to go after login: the ?next= page the user was sent from, or the dashboard. */
function getRedirectPath() {
  return getSafeRedirectPath(new URLSearchParams(window.location.search).get("next"))
}

export default function LoginPage() {
  const router = useRouter()
  const { data: admin } = useCurrentAdmin()
  const login = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  // Already logged in: skip the login page
  useEffect(() => {
    if (admin) router.replace(getRedirectPath())
  }, [admin, router])

  const onSubmit = (values) => login.mutate(values)

  return (
    <Card>
      <CardHeader className="text-center">
        <span className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShieldCheckIcon className="size-5" />
        </span>
        <CardTitle className="text-xl">Super Admin Login</CardTitle>
        <CardDescription>Sign in to manage the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
          <FormAlert>{login.error?.message}</FormAlert>

          <FormField id="email" label="Email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
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
        </form>
      </CardContent>
    </Card>
  )
}
