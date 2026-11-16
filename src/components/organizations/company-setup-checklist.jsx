"use client"

import Link from "next/link"
import { CheckIcon, CircleIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCompanyAccess } from "@/hooks/use-access"
import { cn, formatDateTime } from "@/lib/utils"

function Step({ done, title, children, action }) {
  return (
    <li className="flex gap-3" data-done={done}>
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full border",
          done ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground"
        )}
        aria-hidden="true"
      >
        {done ? <CheckIcon className="size-4" /> : <CircleIcon className="size-3" />}
      </span>
      <div className="grid flex-1 gap-1 pt-0.5 sm:grid-cols-[1fr_auto] sm:items-start">
        <div className="grid gap-0.5">
          <p className="font-medium">{title}</p>
          <div className="text-sm text-muted-foreground">{children}</div>
        </div>
        {action}
      </div>
    </li>
  )
}

/**
 * Super Admin, company page: the onboarding steps of a company (modules, subscription, Company Admin), each with
 * its current state from the database and a link to the page that does it.
 */
export function CompanySetupChecklist({ company }) {
  const { data: access, isPending } = useCompanyAccess(company.id)
  const activeAdmins = (company.admins ?? []).filter((a) => a.status === "active")
  const signedIn = activeAdmins.some((a) => !a.must_change_password)

  if (isPending) return <Skeleton className="h-48" />

  const assigned = access?.summary.assigned ?? 0
  const subscription = access?.subscription

  return (
    <Card data-testid="company-setup">
      <CardHeader>
        <CardTitle>Company setup</CardTitle>
        <CardDescription>What the company needs before its admin and users can work.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-4">
          <Step
            done={assigned > 0}
            title="Purchased modules"
            action={
              <Link href={`/company-access/${company.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Choose modules
              </Link>
            }
          >
            {assigned > 0 ? `${assigned} module${assigned === 1 ? "" : "s"} assigned.` : "No module assigned yet."}
          </Step>
          <Step
            done={Boolean(subscription?.is_valid)}
            title="Subscription"
            action={
              <Link href={subscription ? `/subscriptions/${subscription.id}` : "/subscriptions/assign"} className={buttonVariants({ variant: "outline", size: "sm" })}>
                {subscription ? "View subscription" : "Assign subscription"}
              </Link>
            }
          >
            {subscription
              ? `${subscription.plan.name}: ${subscription.is_valid ? "valid" : subscription.status}${subscription.end_date ? ` until ${formatDateTime(subscription.end_date)}` : ""}.`
              : "No subscription yet: modules work only with a valid subscription."}
          </Step>
          <Step done={activeAdmins.length > 0} title="Company Admin">
            {activeAdmins.length === 0
              ? "Create a Company Admin below; the login is emailed to them."
              : signedIn
                ? `${activeAdmins.length} active admin${activeAdmins.length === 1 ? "" : "s"}; signed in and chose a password.`
                : "Created; waiting for the first sign-in with the emailed temporary password."}
          </Step>
        </ol>
      </CardContent>
    </Card>
  )
}
