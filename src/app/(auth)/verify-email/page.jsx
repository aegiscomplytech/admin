"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { CircleAlertIcon, CircleCheckIcon, Loader2Icon } from "lucide-react"

import { FormAlert, FormField } from "@/components/forms/form-field"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useResendVerification } from "@/hooks/use-company"
import { COMPANY_LOGIN_PATH } from "@/lib/auth"
import { verifyEmail } from "@/services/company.service"

/** Asks for a new link when the token is invalid or expired. */
function ResendForm() {
  const resend = useResendVerification()
  const [email, setEmail] = useState("")

  return (
    <form
      className="grid gap-3"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        if (email.trim()) resend.mutate(email.trim())
      }}
    >
      <FormField id="resend-email" label="Send me a new link" error={resend.error?.errors?.[0]?.message}>
        <Input
          id="resend-email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </FormField>
      {resend.isSuccess && (
        <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          {resend.data.message}
        </p>
      )}
      <FormAlert>{resend.error && !resend.error.errors ? resend.error.message : null}</FormAlert>
      <Button type="submit" variant="outline" disabled={resend.isPending || !email.trim()}>
        {resend.isPending && <Loader2Icon className="animate-spin" />}
        Send new verification link
      </Button>
    </form>
  )
}

/**
 * /verify-email?token=... (the link from the verification email).
 * The token is sent with POST (not on a GET), so link scanners in mail programs cannot use it up.
 */
export default function VerifyEmailPage() {
  const [state, setState] = useState({ status: "verifying", message: "" })
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return // React dev mode runs effects twice; a token can only be used once
    started.current = true

    const token = new URLSearchParams(window.location.search).get("token")
    // Remove the token from the address bar and browser history
    window.history.replaceState(null, "", "/verify-email")

    const request = token
      ? verifyEmail(token)
      : Promise.reject(new Error("This verification link is invalid or has expired."))
    request
      .then((response) => setState({ status: "success", message: response.message }))
      .catch((error) => setState({ status: "error", message: error.message }))
  }, [])

  return (
    <Card>
      <CardHeader className="text-center">
        <span className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-muted">
          {state.status === "verifying" && <Loader2Icon className="size-5 animate-spin" />}
          {state.status === "success" && <CircleCheckIcon className="size-5 text-primary" />}
          {state.status === "error" && <CircleAlertIcon className="size-5 text-destructive" />}
        </span>
        <CardTitle className="text-xl">
          {state.status === "verifying" && "Verifying your email…"}
          {state.status === "success" && "Email verified"}
          {state.status === "error" && "Verification failed"}
        </CardTitle>
        {state.message && <CardDescription role="status">{state.message}</CardDescription>}
      </CardHeader>
      {state.status !== "verifying" && (
        <CardContent className="grid gap-4">
          {state.status === "error" && <ResendForm />}
          <Link href={COMPANY_LOGIN_PATH} className={buttonVariants({ variant: state.status === "success" ? "default" : "ghost" })}>
            Sign in to check your registration status
          </Link>
        </CardContent>
      )}
    </Card>
  )
}
