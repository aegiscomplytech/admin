"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftIcon, Trash2Icon } from "lucide-react"

import { ConfirmationDialog } from "@/components/access/confirmation-dialog"
import { PERMISSION_LABELS, RoleKindBadge } from "@/components/company/company-badges"
import { CompanyErrorCard } from "@/components/company/company-dashboard"
import { RoleEditor } from "@/components/company/role-editor"
import { ModuleIcon } from "@/components/modules/module-icon"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { useCompanyRole, useDeleteCompanyRole, useUpdateCompanyRole } from "@/hooks/use-company-admin"
import { cn, formatDateTime } from "@/lib/utils"

/** What a role allows in each of the company's modules (read-only; built-in roles are shown this way). */
function EffectivePermissions({ role }) {
  if (role.modules.length === 0) return <p className="py-4 text-center text-sm text-muted-foreground">No permissions in your company&apos;s modules.</p>
  return (
    <ul className="grid gap-2 md:grid-cols-2" data-testid="role-effective-permissions">
      {role.modules.map((m) => (
        <li key={m.id} className="grid gap-2 rounded-lg border p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ModuleIcon name={m.icon} />
            {m.name}
            {!m.usable && <Badge variant="outline">Unavailable now</Badge>}
          </div>
          <div className="flex flex-wrap gap-1">
            {m.permissions.map((p) => (
              <Badge key={p.key} variant="secondary">
                {PERMISSION_LABELS[p.key] ?? p.name}
              </Badge>
            ))}
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Company Admin: one role. Custom roles are edited here; built-in roles are read-only. */
export function CompanyRoleDetails() {
  const { id } = useParams()
  const router = useRouter()
  const { data: role, isPending, isError, error, refetch } = useCompanyRole(id)
  const update = useUpdateCompanyRole()
  const remove = useDeleteCompanyRole()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const back = (
    <Link href="/company/roles" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-self-start")}>
      <ArrowLeftIcon />
      All roles
    </Link>
  )
  if (isPending) {
    return (
      <div className="mx-auto grid w-full max-w-5xl gap-6" aria-busy="true">
        {back}
        <Skeleton className="h-96" />
      </div>
    )
  }
  if (isError) {
    return (
      <div className="mx-auto grid w-full max-w-5xl gap-6">
        {back}
        <CompanyErrorCard
          title={error.status === 404 ? "Role not found" : "Couldn't load this role"}
          error={error.status === 404 ? { message: "This role does not belong to your company, or it was deleted." } : error}
          onRetry={error.status === 404 ? undefined : () => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6" data-testid="company-role-details">
      {back}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
            {role.name}
            <RoleKindBadge builtIn={role.is_builtin} />
            {!role.is_active && <Badge variant="destructive">Inactive</Badge>}
          </CardTitle>
          <CardDescription>
            {role.users} user{role.users === 1 ? "" : "s"} · {role.is_builtin ? "provided by the platform" : `created ${formatDateTime(role.created_at)}${role.created_by ? ` by ${role.created_by}` : ""}`}
          </CardDescription>
          {!role.is_builtin && (
            <CardAction>
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2Icon />
                Delete role
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent className="grid gap-3">
          {role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
          <h3 className="text-sm font-medium">What this role allows</h3>
          <EffectivePermissions role={role} />
        </CardContent>
      </Card>

      {!role.is_builtin && (
        <Card>
          <CardHeader>
            <CardTitle>Edit role</CardTitle>
            <CardDescription>Changes apply to every user with this role on their next action in the user app.</CardDescription>
          </CardHeader>
          <CardContent>
            <RoleEditor
              key={role.updated_at}
              mode="edit"
              role={role}
              mutation={{ ...update, mutate: (input, options) => update.mutate({ id: role.id, input }, options) }}
              onSaved={(response) => toast.add({ type: "success", title: response.message, description: response.data.name })}
            />
          </CardContent>
        </Card>
      )}

      <ConfirmationDialog
        open={confirmDelete}
        title={`Delete the role "${role.name}"?`}
        description={role.users > 0 ? `It is given to ${role.users} user(s): give them another role first.` : "Nobody has this role. It cannot be undone."}
        confirmLabel="Delete role"
        variant="destructive"
        pending={remove.isPending}
        error={remove.error?.message}
        onConfirm={() =>
          remove.mutate(role.id, {
            onSuccess: () => {
              toast.add({ type: "success", title: "Role deleted", description: role.name })
              router.push("/company/roles")
            },
          })
        }
        onClose={() => {
          remove.reset()
          setConfirmDelete(false)
        }}
      />
    </div>
  )
}
