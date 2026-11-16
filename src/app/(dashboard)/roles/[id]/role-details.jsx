"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftIcon, Loader2Icon, SaveIcon, Trash2Icon } from "lucide-react"

import { ConfirmationDialog } from "@/components/access/confirmation-dialog"
import { StatusBadge } from "@/components/access/status-badge"
import { ModuleIcon } from "@/components/modules/module-icon"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { useDeleteRole, usePermissions, useRole, useSetRolePermissions, useUpdateRole } from "@/hooks/use-access"
import { useModuleList } from "@/hooks/use-modules"
import { cn } from "@/lib/utils"

const ALL = "all"
const cellKey = (scope, permission) => `${scope}|${permission}`

/**
 * Rows = "All modules" + each module; columns = permissions. A tick in "All modules" covers every module.
 * Page-level grants (made through the API) are shown and kept as they are.
 */
function PermissionMatrix({ role, permissions, modules, onSave, saving }) {
  const initial = useMemo(
    () => new Set(role.permissions.filter((g) => g.scope !== "menu").map((g) => cellKey(g.scope === "all" ? ALL : g.module_id, g.permission_key))),
    [role]
  )
  const pageGrants = role.permissions.filter((g) => g.scope === "menu")
  const [cells, setCells] = useState(initial)
  const dirty = cells.size !== initial.size || [...cells].some((c) => !initial.has(c))

  const toggle = (key) =>
    setCells((s) => {
      const next = new Set(s)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  const rows = [{ id: ALL, name: "All modules", code: "Every module the company has", icon: "shield-check" }, ...modules]

  const save = () =>
    onSave([
      ...[...cells].map((key) => {
        const [scope, permission] = key.split("|")
        return scope === ALL ? { permission } : { permission, moduleId: scope }
      }),
      ...pageGrants.map((g) => ({ permission: g.permission_key, menuId: g.menu_id })),
    ])

  return (
    <div className="grid gap-3">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm" data-testid="permission-matrix">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Module</th>
              {permissions.map((p) => (
                <th key={p.permission_key} className="px-2 py-2 text-center font-medium" title={p.description}>
                  {p.permission_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.id} data-row={row.id === ALL ? "all" : row.code} className={row.id === ALL ? "bg-muted/20" : undefined}>
                <td className="px-3 py-2">
                  <span className="flex items-center gap-2">
                    <ModuleIcon name={row.icon} className="size-3.5 text-muted-foreground" />
                    <span className="grid">
                      <span className="font-medium">{row.name}</span>
                      <span className="text-xs text-muted-foreground">{row.code}</span>
                    </span>
                  </span>
                </td>
                {permissions.map((p) => {
                  const viaAll = row.id !== ALL && cells.has(cellKey(ALL, p.permission_key))
                  const key = cellKey(row.id, p.permission_key)
                  return (
                    <td key={p.permission_key} className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={viaAll || cells.has(key)}
                        disabled={viaAll || saving}
                        title={viaAll ? "Given for all modules" : undefined}
                        onChange={() => toggle(key)}
                        aria-label={`${p.permission_name} in ${row.name}`}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageGrants.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Also {pageGrants.length} page-level grant{pageGrants.length === 1 ? "" : "s"} (kept):{" "}
          {pageGrants.map((g) => `${g.permission_key} on ${g.menu_name}`).join(", ")}.
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Users need &quot;View&quot; to see a module&apos;s pages at all.</p>
        <Button onClick={save} disabled={!dirty || saving} data-testid="save-permissions">
          {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
          Save permissions
        </Button>
      </div>
    </div>
  )
}

export function RoleDetails() {
  const { id } = useParams()
  const router = useRouter()
  const { data: role, isPending, isError, error } = useRole(id)
  const permissions = usePermissions()
  const modules = useModuleList({ page: 1, limit: 100 })
  const setPermissions = useSetRolePermissions(id)
  const update = useUpdateRole(id)
  const remove = useDeleteRole()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [name, setName] = useState(null)

  const back = (
    <Link href="/roles" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-self-start")}>
      <ArrowLeftIcon />
      Roles &amp; Permissions
    </Link>
  )
  if (isPending || permissions.isPending || modules.isPending) {
    return (
      <div className="mx-auto grid w-full max-w-6xl gap-6" aria-busy="true">
        {back}
        <Skeleton className="h-28" />
        <Skeleton className="h-96" />
      </div>
    )
  }
  if (isError) {
    return (
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        {back}
        <Card role="alert">
          <CardContent className="py-10 text-center">
            <p className="font-medium">{error.status === 404 ? "Role not found" : error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const saveName = () =>
    update.mutate(
      { roleName: name.trim() },
      {
        onSuccess: () => {
          toast.add({ type: "success", title: "Role renamed" })
          setName(null)
        },
      }
    )

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6">
      {back}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
            {role.role_name}
            {role.is_system && <Badge variant="outline">System role</Badge>}
            <StatusBadge active={role.is_active} />
          </CardTitle>
          <CardDescription>
            <span className="font-mono">{role.role_key}</span> · {role.users} user{role.users === 1 ? "" : "s"}
            {role.description && ` · ${role.description}`}
          </CardDescription>
          <CardAction className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={update.isPending}
              onClick={() =>
                update.mutate(
                  { isActive: !role.is_active },
                  { onSuccess: () => toast.add({ type: "success", title: role.is_active ? "Role deactivated" : "Role activated" }) }
                )
              }
            >
              {role.is_active ? "Deactivate" : "Activate"}
            </Button>
            {!role.is_system && (
              <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2Icon />
                Delete
              </Button>
            )}
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div className="flex flex-wrap items-end gap-2">
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Role name</span>
              <Input value={name ?? role.role_name} onChange={(e) => setName(e.target.value)} className="w-72" />
            </label>
            <Button variant="outline" disabled={name === null || name.trim().length < 2 || name.trim() === role.role_name || update.isPending} onClick={saveName}>
              Rename
            </Button>
          </div>
          {!role.is_active && <p className="text-xs text-muted-foreground">An inactive role gives no permissions: its users see no module pages.</p>}
          {update.error && <p className="text-sm text-destructive">{update.error.message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>Applies inside the modules each user&apos;s company has. The backend enforces every permission.</CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionMatrix
            key={role.updated_at + role.permissions.length + role.permissions.map((g) => g.id).join()}
            role={role}
            permissions={permissions.data}
            modules={modules.data.items}
            saving={setPermissions.isPending}
            onSave={(grants) =>
              setPermissions.mutate(grants, {
                onSuccess: () => toast.add({ type: "success", title: "Permissions saved", description: role.role_name }),
                onError: (e) => toast.add({ type: "error", title: "Couldn't save permissions", description: e.message }),
              })
            }
          />
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={confirmDelete}
        title="Delete this role?"
        description={`"${role.role_name}" will be removed. Roles still given to users cannot be deleted.`}
        confirmLabel="Delete role"
        variant="destructive"
        pending={remove.isPending}
        error={remove.error?.message}
        onConfirm={() =>
          remove.mutate(id, {
            onSuccess: () => {
              toast.add({ type: "success", title: "Role deleted" })
              router.replace("/roles")
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
