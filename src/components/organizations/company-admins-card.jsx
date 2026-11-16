"use client"

import { useId, useState } from "react"
import { KeyRoundIcon, Loader2Icon, MailIcon, PowerIcon, UserPlusIcon } from "lucide-react"

import { FormAlert, FormField } from "@/components/forms/form-field"
import { EmailVerifiedBadge } from "@/components/organizations/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { useCompanyAdminAction } from "@/hooks/use-organizations"
import { cn, formatDateTime } from "@/lib/utils"

const textareaClass =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"

const STATUS_BADGE = {
  active: { label: "Active", variant: "secondary" },
  pending: { label: "Active after approval", variant: "outline" },
  inactive: { label: "Deactivated", variant: "destructive" },
}

/** Dialog texts per action on an existing admin. */
const ACTIONS = {
  deactivate: {
    title: "Deactivate this Company Admin?",
    description: "They are signed out at once and can no longer sign in to the company area. You can reactivate them later.",
    confirm: "Deactivate",
    variant: "destructive",
    reason: "optional",
  },
  activate: {
    title: "Reactivate this Company Admin?",
    description: "They can sign in to the company area again with their current password.",
    confirm: "Reactivate",
    variant: "default",
    reason: "optional",
  },
  reset: {
    title: "Reset this admin's login?",
    description:
      "A new temporary password is emailed to them (you never see it). Their current password stops working, all their sessions are signed out, and they must choose a new password at the next sign-in.",
    confirm: "Reset and email",
    variant: "destructive",
    reason: "required",
  },
}

function AddAdminDialog({ company, open, onClose }) {
  const mutation = useCompanyAdminAction()
  const [values, setValues] = useState({ full_name: "", email: "" })
  const prefix = useId()
  const fieldError = (field) => mutation.error?.errors?.find?.((e) => e.field === field)?.message
  const bannerError = mutation.error && !fieldError("full_name") && !fieldError("email") ? mutation.error.message : null

  const close = () => {
    if (mutation.isPending) return
    setValues({ full_name: "", email: "" })
    mutation.reset()
    onClose()
  }
  const submit = (event) => {
    event.preventDefault()
    mutation.mutate(
      { action: "create", id: company.id, input: { full_name: values.full_name.trim(), email: values.email.trim() } },
      {
        onSuccess: (response) => {
          toast.add({ type: "success", title: "Company Admin created", description: response.message })
          setValues({ full_name: "", email: "" })
          onClose()
        },
      }
    )
  }
  const change = (field) => (event) => setValues((v) => ({ ...v, [field]: event.target.value }))

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Create Company Admin</DialogTitle>
            <DialogDescription>
              For <span className="font-medium text-foreground">{company.legal_name}</span>. The system creates an Admin ID and a temporary password and
              emails them to this address. They must choose their own password at the first sign-in.
            </DialogDescription>
          </DialogHeader>
          <FormAlert>{bannerError}</FormAlert>
          <FormField id={`${prefix}-name`} label="Full name" error={fieldError("full_name")}>
            <Input id={`${prefix}-name`} value={values.full_name} onChange={change("full_name")} autoComplete="off" aria-invalid={!!fieldError("full_name")} />
          </FormField>
          <FormField id={`${prefix}-email`} label="Email" error={fieldError("email")}>
            <Input id={`${prefix}-email`} type="email" value={values.email} onChange={change("email")} autoComplete="off" aria-invalid={!!fieldError("email")} />
          </FormField>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" disabled={mutation.isPending} />}>Cancel</DialogClose>
            <Button type="submit" disabled={mutation.isPending || !values.full_name.trim() || !values.email.trim()}>
              {mutation.isPending ? <Loader2Icon className="animate-spin" /> : <MailIcon />}
              Create and email login
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AdminActionDialog({ company, target, onClose }) {
  const mutation = useCompanyAdminAction()
  const [reason, setReason] = useState("")
  const [reasonError, setReasonError] = useState(null)
  const config = target ? ACTIONS[target.action] : null
  const prefix = useId()

  const close = () => {
    if (mutation.isPending) return
    setReason("")
    setReasonError(null)
    mutation.reset()
    onClose()
  }
  const submit = (event) => {
    event.preventDefault()
    if (config.reason === "required" && reason.trim().length < 5) {
      setReasonError("Please give a reason of at least 5 characters.")
      return
    }
    mutation.mutate(
      { action: target.action, id: company.id, userId: target.admin.id, reason: reason.trim() || undefined },
      {
        onSuccess: (response) => {
          toast.add({ type: "success", title: response.message, description: target.admin.full_name })
          setReason("")
          onClose()
        },
        onError: (error) => setReasonError(error.errors?.find?.((e) => e.field === "reason")?.message ?? null),
      }
    )
  }

  return (
    <Dialog open={Boolean(config)} onOpenChange={(next) => !next && close()}>
      {config && (
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submit} noValidate className="grid gap-4">
            <DialogHeader>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogDescription>
                <span className="font-medium text-foreground">
                  {target.admin.full_name} ({target.admin.admin_id ?? target.admin.email})
                </span>
                <br />
                {config.description}
              </DialogDescription>
            </DialogHeader>
            <FormAlert>{mutation.error && !reasonError ? mutation.error.message : null}</FormAlert>
            <div className="grid gap-1.5">
              <label htmlFor={`${prefix}-reason`} className="text-sm font-medium">
                {config.reason === "required" ? "Reason (kept in the activity log)" : "Reason (optional, kept in the activity log)"}
              </label>
              <textarea
                id={`${prefix}-reason`}
                rows={3}
                maxLength={1000}
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value)
                  setReasonError(null)
                }}
                aria-invalid={Boolean(reasonError)}
                className={cn(textareaClass, reasonError && "border-destructive ring-3 ring-destructive/20")}
              />
              {reasonError && (
                <p role="alert" className="text-xs text-destructive">
                  {reasonError}
                </p>
              )}
            </div>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" disabled={mutation.isPending} />}>Cancel</DialogClose>
              <Button type="submit" variant={config.variant} disabled={mutation.isPending}>
                {mutation.isPending && <Loader2Icon className="animate-spin" />}
                {config.confirm}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  )
}

/**
 * Super Admin, company page: the company's Company Admins (owner first). Create one (Admin ID + temporary password
 * emailed), deactivate / reactivate, reset the login.
 */
export function CompanyAdminsCard({ company }) {
  const [adding, setAdding] = useState(false)
  const [target, setTarget] = useState(null)
  const admins = company.admins ?? []

  return (
    <Card data-testid="company-admins">
      <CardHeader>
        <CardTitle>Company Admins</CardTitle>
        <CardDescription>They sign in at /company/login with their Admin ID and manage the company&apos;s users and roles.</CardDescription>
        {company.actions.add_admin && (
          <CardAction>
            <Button size="sm" onClick={() => setAdding(true)}>
              <UserPlusIcon />
              Create Company Admin
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {admins.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground" data-testid="no-company-admins">
            No Company Admin yet. Create one so the company can sign in.
          </p>
        ) : (
          <ul className="divide-y text-sm">
            {admins.map((admin) => {
              const badge = STATUS_BADGE[admin.status] ?? STATUS_BADGE.active
              return (
                <li key={admin.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center" data-testid="company-admin-row" data-email={admin.email}>
                  <div className="grid gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{admin.full_name}</span>
                      <Badge variant="outline">{admin.role === "owner" ? "Owner" : "Admin"}</Badge>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{admin.email}</span>
                      {admin.admin_id && (
                        <span className="font-mono text-foreground" data-testid="company-admin-id">
                          {admin.admin_id}
                        </span>
                      )}
                      <EmailVerifiedBadge verified={admin.email_verified} />
                      {admin.must_change_password ? <Badge variant="outline">Temporary password</Badge> : <Badge variant="secondary">Password set</Badge>}
                      <span>Last sign-in: {formatDateTime(admin.last_login_at, "Never")}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {company.status !== "rejected" && (
                      <Button variant="outline" size="sm" onClick={() => setTarget({ action: "reset", admin })}>
                        <KeyRoundIcon />
                        Reset login
                      </Button>
                    )}
                    {admin.role !== "owner" && admin.status === "active" && (
                      <Button variant="outline" size="sm" onClick={() => setTarget({ action: "deactivate", admin })}>
                        <PowerIcon />
                        Deactivate
                      </Button>
                    )}
                    {admin.role !== "owner" && admin.status === "inactive" && (
                      <Button variant="outline" size="sm" onClick={() => setTarget({ action: "activate", admin })}>
                        <PowerIcon />
                        Reactivate
                      </Button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
      <AddAdminDialog company={company} open={adding} onClose={() => setAdding(false)} />
      <AdminActionDialog company={company} target={target} onClose={() => setTarget(null)} />
    </Card>
  )
}
