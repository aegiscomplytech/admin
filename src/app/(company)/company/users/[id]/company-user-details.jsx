"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeftIcon, MailIcon, PowerIcon } from "lucide-react"

import { ConfirmationDialog } from "@/components/access/confirmation-dialog"
import { AccountStatusBadge } from "@/components/company/company-badges"
import { CompanyErrorCard } from "@/components/company/company-dashboard"
import { CompanyUserForm } from "@/components/company/company-user-form"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { useCompanyUser, useResendInvitation, useUpdateCompanyUser } from "@/hooks/use-company-admin"
import { cn, formatDateTime } from "@/lib/utils"

function Row({ label, children }) {
  return (
    <div className="grid gap-0.5 py-2 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium break-words">{children || "—"}</dd>
    </div>
  )
}

/** Company Admin: one user of the company (any other id answers 404 from the server). */
export function CompanyUserDetails() {
  const { id } = useParams()
  const { data: user, isPending, isError, error, refetch } = useCompanyUser(id)
  const update = useUpdateCompanyUser()
  const statusChange = useUpdateCompanyUser()
  const resend = useResendInvitation()
  const [confirming, setConfirming] = useState(false)

  const back = (
    <Link href="/company/users" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-self-start")}>
      <ArrowLeftIcon />
      All users
    </Link>
  )
  if (isPending) {
    return (
      <div className="mx-auto grid w-full max-w-4xl gap-6" aria-busy="true">
        {back}
        <Skeleton className="h-40" />
        <Skeleton className="h-72" />
      </div>
    )
  }
  if (isError) {
    return (
      <div className="mx-auto grid w-full max-w-4xl gap-6">
        {back}
        <CompanyErrorCard
          title={error.status === 404 ? "User not found" : "Couldn't load this user"}
          error={error.status === 404 ? { message: "This user does not belong to your company, or the link is wrong." } : error}
          onRetry={error.status === 404 ? undefined : () => refetch()}
        />
      </div>
    )
  }

  const deactivate = user.is_active
  const changeStatus = () =>
    statusChange.mutate(
      { id: user.id, input: { isActive: !user.is_active } },
      {
        onSuccess: (response) => {
          toast.add({ type: "success", title: response.message, description: user.full_name })
          setConfirming(false)
        },
      }
    )

  return (
    <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6" data-testid="company-user-details">
      {back}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
            {user.full_name}
            <AccountStatusBadge status={user.account_status} />
          </CardTitle>
          <CardDescription>{user.email}</CardDescription>
          <CardAction className="flex flex-wrap justify-end gap-2">
            {user.invitation_pending && user.is_active && (
              <Button
                variant="outline"
                size="sm"
                disabled={resend.isPending}
                onClick={() =>
                  resend.mutate(user.id, {
                    onSuccess: (response) => toast.add({ type: "success", title: "Invitation sent", description: response.message }),
                    onError: (e) => toast.add({ type: "error", title: "Invitation not sent", description: e.message }),
                  })
                }
              >
                <MailIcon />
                Resend invitation
              </Button>
            )}
            <Button variant={deactivate ? "destructive" : "default"} size="sm" onClick={() => setConfirming(true)}>
              <PowerIcon />
              {deactivate ? "Deactivate" : "Activate"}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <dl className="divide-y text-sm">
            <Row label="Role">{user.role ? `${user.role.name}${user.role.is_builtin ? " (built-in)" : ""}` : "No role: no module access"}</Row>
            <Row label="Department">{user.department}</Row>
            <Row label="Designation">{user.designation}</Row>
            <Row label="Phone">{user.mobile}</Row>
            <Row label="Password">{user.invitation_pending ? `Not chosen yet (invited ${formatDateTime(user.invited_at)})` : "Set"}</Row>
            <Row label="Last sign-in">{formatDateTime(user.last_login_at, "Never")}</Row>
            <Row label="Created">{`${formatDateTime(user.created_at)}${user.created_by ? ` by ${user.created_by}` : ""}`}</Row>
            {!user.is_active && <Row label="Deactivated">{formatDateTime(user.deactivated_at)}</Row>}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit user</CardTitle>
          <CardDescription>A role change applies on the user&apos;s next action in the user app; no sign-out needed.</CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyUserForm
            key={user.updated_at}
            mode="edit"
            user={user}
            mutation={{ ...update, mutate: (input, options) => update.mutate({ id: user.id, input }, options) }}
            onSaved={(response) => toast.add({ type: "success", title: response.message, description: user.full_name })}
          />
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={confirming}
        title={deactivate ? `Deactivate ${user.full_name}?` : `Activate ${user.full_name}?`}
        description={
          deactivate
            ? "They are signed out at once and cannot sign in until you activate them again. Their data and role are kept."
            : "They can sign in to the user app again with their role's permissions."
        }
        confirmLabel={deactivate ? "Deactivate" : "Activate"}
        variant={deactivate ? "destructive" : "default"}
        pending={statusChange.isPending}
        error={statusChange.error?.message}
        onConfirm={changeStatus}
        onClose={() => {
          statusChange.reset()
          setConfirming(false)
        }}
      />
    </div>
  )
}
