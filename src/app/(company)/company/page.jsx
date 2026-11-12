"use client"

import { CheckIcon, CircleIcon, ClockIcon, Loader2Icon, RefreshCwIcon, XIcon } from "lucide-react"

import { FormAlert } from "@/components/forms/form-field"
import { OrganizationStatusBadge } from "@/components/organizations/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ModuleIcon } from "@/components/modules/module-icon"
import { useCompanyMe, useRegistrationStatus, useResendVerification } from "@/hooks/use-company"
import { useMyModules } from "@/hooks/use-modules"
import { REGISTRATION_STATUS_LABELS } from "@/lib/organizations"
import { cn, formatDateTime } from "@/lib/utils"

/** The headline message for each registration status. */
const STATUS_MESSAGES = {
  pending_email_verification: "Please verify your email address. We sent you a link when you registered.",
  pending_approval: "Thank you! Your registration is being reviewed by our team. We will let you know once it is approved.",
  approved: "Your company account is active.",
  rejected: "Unfortunately your registration was not approved.",
  suspended: "Your company account is suspended. Company features are unavailable. Please contact support.",
  deactivated: "Your company account has been deactivated. Please contact support if you believe this is a mistake.",
}

function Step({ state, title, children }) {
  const icon = {
    done: <CheckIcon className="size-4" />,
    current: <ClockIcon className="size-4" />,
    failed: <XIcon className="size-4" />,
    todo: <CircleIcon className="size-3" />,
  }[state]
  return (
    <li className="flex gap-3" data-state={state}>
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full border",
          state === "done" && "border-primary bg-primary text-primary-foreground",
          state === "current" && "border-primary text-primary",
          state === "failed" && "border-destructive bg-destructive/10 text-destructive",
          state === "todo" && "text-muted-foreground"
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="grid gap-0.5 pt-0.5">
        <p className="font-medium">{title}</p>
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
    </li>
  )
}

/** The modules this company can use (calculated by the backend from its plan and overrides). */
function MyModules() {
  const { data, isPending, isError, error } = useMyModules()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome aboard</CardTitle>
        <CardDescription>
          {data?.subscription
            ? `Your company is approved and subscribed to ${data.subscription.plan.name}. These are your modules:`
            : "Your company is approved. Modules become available once a subscription is assigned to your company."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending && <Skeleton className="h-24" />}
        {isError && <FormAlert>{error.message}</FormAlert>}
        {data && data.modules.length === 0 && <p className="text-sm text-muted-foreground">No modules are available to your company yet.</p>}
        {data && data.modules.length > 0 && (
          <ul className="grid gap-2 sm:grid-cols-2" data-testid="my-modules">
            {data.modules.map((m) => (
              <li key={m.code} className="flex items-start gap-3 rounded-lg border p-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <ModuleIcon name={m.icon} />
                </span>
                <span className="grid gap-0.5">
                  <span className="text-sm font-medium">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.description}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default function CompanyHomePage() {
  const { data: me } = useCompanyMe()
  const { data, isPending, isError, error, refetch, isFetching } = useRegistrationStatus()
  const resend = useResendVerification()

  if (isPending) return <Skeleton className="mx-auto h-96 w-full max-w-2xl" />
  if (isError) {
    return (
      <Card className="mx-auto w-full max-w-2xl" role="alert">
        <CardHeader>
          <CardTitle>Couldn&apos;t load your registration status</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const status = data.registration_status
  const reviewDone = ["approved", "suspended", "deactivated"].includes(status)
  const reviewState = status === "rejected" ? "failed" : reviewDone ? "done" : status === "pending_approval" ? "current" : "todo"

  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
            {data.organization.legal_name}
            <OrganizationStatusBadge status={data.organization.status} />
          </CardTitle>
          <CardDescription data-testid="registration-status">{REGISTRATION_STATUS_LABELS[status]}</CardDescription>
          <CardAction>
            <Button variant="ghost" size="icon-sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh status">
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-6">
          <p className="text-sm">{STATUS_MESSAGES[status]}</p>

          <ol className="grid gap-4" aria-label="Registration progress">
            <Step state="done" title="Registration submitted">
              {formatDateTime(data.organization.registered_at)}
            </Step>
            <Step state={data.email_verified ? "done" : "current"} title="Email verified">
              {data.email_verified ? (
                "Your email address is confirmed."
              ) : (
                <div className="grid gap-2">
                  <span>
                    Open the link we sent to <span className="font-medium text-foreground">{me?.user.email}</span>.
                  </span>
                  {resend.isSuccess && <span role="status">A new verification link has been sent.</span>}
                  <FormAlert>{resend.error?.message}</FormAlert>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-self-start"
                    disabled={resend.isPending || !me}
                    onClick={() => resend.mutate(me.user.email)}
                  >
                    {resend.isPending && <Loader2Icon className="animate-spin" />}
                    Resend verification email
                  </Button>
                </div>
              )}
            </Step>
            <Step state={reviewState} title="Review by our team">
              {status === "rejected" && (
                <span>
                  Reason: <span className="font-medium text-foreground">{data.rejection_reason}</span>
                  <br />
                  You can register again with corrected information.
                </span>
              )}
              {reviewDone && `Approved on ${formatDateTime(data.organization.approved_at)}.`}
              {status === "pending_approval" && "In progress."}
              {status === "pending_email_verification" && "Starts after your email is verified."}
            </Step>
          </ol>
        </CardContent>
      </Card>

      {status === "approved" && <MyModules />}
    </div>
  )
}
