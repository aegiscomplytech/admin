"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftIcon, CheckIcon, RefreshCwIcon, Trash2Icon, XIcon } from "lucide-react"

import { CompanyAssignmentCard } from "@/components/users/company-assignment-card"
import { UserActionDialog } from "@/components/users/user-action-dialog"
import { UserStatusBadge } from "@/components/users/user-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@/hooks/use-users"
import { formatAuditAction, selfServiceActor } from "@/lib/audit"
import { cn, formatDateTime } from "@/lib/utils"

function Row({ label, children }) {
  return (
    <div className="grid gap-0.5 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium break-words">{children || "—"}</dd>
    </div>
  )
}

export function UserDetails() {
  const { id } = useParams()
  const router = useRouter()
  const { data: user, isPending, isError, error, isFetching, refetch } = useUser(id)
  const [action, setAction] = useState(null)

  const back = (
    <Link href="/users" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-self-start")}>
      <ArrowLeftIcon />
      All users
    </Link>
  )

  if (isPending) {
    return (
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6" aria-busy="true">
        {back}
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6">
        {back}
        <Card role="alert">
          <CardContent className="grid justify-items-center gap-3 py-10 text-center">
            <p className="font-medium">{error.status === 404 ? "User not found" : "Couldn't load this user"}</p>
            <p className="text-sm text-muted-foreground">
              {error.status === 404 ? "The account may have been deleted, or the link is wrong." : error.message}
            </p>
            {error.status !== 404 && (
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6">
      {back}

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
            {user.full_name}
            <UserStatusBadge status={user.status} />
          </CardTitle>
          <CardDescription>{user.email}</CardDescription>
          <CardAction>
            <Button variant="ghost" size="icon-sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-3">
          <h3 className="text-sm font-medium">Review</h3>
          <div className="flex flex-wrap gap-2">
            {user.actions.approve && (
              <Button onClick={() => setAction("approve")}>
                <CheckIcon />
                Approve
              </Button>
            )}
            {user.actions.reject && (
              <Button variant="destructive" onClick={() => setAction("reject")}>
                <XIcon />
                Reject
              </Button>
            )}
            <Button variant="outline" onClick={() => setAction("delete")}>
              <Trash2Icon />
              Delete
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {user.status === "pending" && "This user cannot log in until you approve the registration."}
            {user.status === "approved" && "This user can log in. Rejecting signs them out immediately."}
            {user.status === "rejected" && "This user cannot log in. You can still approve them later."}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y text-sm" data-testid="user-info">
              <Row label="User ID">
                <span className="font-mono text-xs">{user.id}</span>
              </Row>
              <Row label="Full name">{user.full_name}</Row>
              <Row label="Email">{user.email}</Row>
              <Row label="Mobile">{user.mobile}</Row>
              <Row label="Registered">{formatDateTime(user.registered_at)}</Row>
              <Row label="Last login">{formatDateTime(user.last_login_at, "Never")}</Row>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y text-sm">
              <Row label="Status">
                <UserStatusBadge status={user.status} />
              </Row>
              <Row label="Reviewed">{formatDateTime(user.reviewed_at, "Not reviewed yet")}</Row>
              <Row label="Reviewed by">{user.reviewed_by && `${user.reviewed_by.full_name} (${user.reviewed_by.email})`}</Row>
              {user.status === "rejected" && <Row label="Reason">{user.rejection_reason}</Row>}
              <Row label="Last updated">{formatDateTime(user.updated_at)}</Row>
            </dl>
          </CardContent>
        </Card>
      </div>

      <CompanyAssignmentCard user={user} />

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Everything recorded for this user, newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          {user.history.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No history yet.</p>
          ) : (
            <ol className="divide-y text-sm">
              {user.history.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Badge variant="outline">{formatAuditAction(entry.action)}</Badge>
                    <span>{entry.description}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {entry.admin_name ?? selfServiceActor("USER_MANAGEMENT")} · {formatDateTime(entry.created_at)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <UserActionDialog
        user={action ? user : null}
        action={action}
        onClose={(done) => {
          setAction(null)
          if (done === "delete") router.replace("/users")
        }}
      />
    </div>
  )
}
