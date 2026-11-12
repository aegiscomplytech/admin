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
import { getSafeCompanyRedirectPath } from "@/lib/auth"
import { loginSchema } from "@/lib/validations"

/** Company user login (not the Super Admin login, which is /login). */
export default function CompanyLoginPage() {
  const router = useRouter()
  const login = useCompanyLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } })

  const onSubmit = (values) =>
    login.mutate(values, {
      onSuccess: () => router.replace(getSafeCompanyRedirectPath(new URLSearchParams(window.location.search).get("next"))),
    })

  return (
    <Card>
      <CardHeader className="text-center">
        <span className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Building2Icon className="size-5" />
        </span>
        <CardTitle className="text-xl">Company sign in</CardTitle>
        <CardDescription>Sign in with the contact email you registered with</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
          <FormAlert>{login.error?.message}</FormAlert>
          <FormField id="email" label="Email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
          </FormField>
          <FormField id="password" label="Password" error={errors.password?.message}>
            <PasswordInput id="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} />
          </FormField>
          <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
            {login.isPending && <Loader2Icon className="animate-spin" />}
            {login.isPending ? "Signing in…" : "Sign in"}
          </Button>
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
