"use client"

import { useId, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { KeyRoundIcon, Loader2Icon, PlusIcon, RefreshCwIcon } from "lucide-react"

import { StatusBadge } from "@/components/access/status-badge"
import { EmptyRow, LoadError, SkeletonRows } from "@/components/access/table-states"
import { FormAlert, FormField } from "@/components/forms/form-field"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import { useCreateRole, useRoles } from "@/hooks/use-access"
import { cn } from "@/lib/utils"

const COLUMNS = ["Role", "Key", "Users", "Grants", "Status", "Actions"]

function CreateRoleDialog({ open, onClose }) {
  const prefix = useId()
  const create = useCreateRole()
  const [values, setValues] = useState({ roleName: "", roleKey: "", description: "" })
  const [errors, setErrors] = useState({})
  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }))
    setErrors((x) => ({ ...x, [key]: undefined }))
  }
  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (values.roleName.trim().length < 2) next.roleName = "At least 2 characters"
    if (!/^[a-z][a-z0-9_]{1,49}$/.test(values.roleKey.trim().toLowerCase())) next.roleKey = "2–50 lowercase letters, numbers or _ (e.g. dpo)"
    setErrors(next)
    if (Object.keys(next).length) return
    create.mutate(
      { roleName: values.roleName.trim(), roleKey: values.roleKey.trim().toLowerCase(), description: values.description.trim() || null },
      {
        onSuccess: (response) => {
          toast.add({ type: "success", title: "Role created", description: `${response.data.role_name}: now choose its permissions.` })
          onClose(response.data.id)
        },
        onError: (error) => setErrors(Object.fromEntries((error.errors ?? []).filter((x) => x.field).map((x) => [x.field, x.message]))),
      }
    )
  }
  return (
    <Dialog open={open} onOpenChange={(o) => !o && !create.isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Create role</DialogTitle>
            <DialogDescription>A role groups permissions. Give it to users of the company app on their user page.</DialogDescription>
          </DialogHeader>
          <FormAlert>{create.error && !create.error.errors ? create.error.message : null}</FormAlert>
          <FormField id={`${prefix}-name`} label="Role name" error={errors.roleName}>
            <Input id={`${prefix}-name`} value={values.roleName} onChange={set("roleName")} placeholder="Data Protection Officer" aria-invalid={!!errors.roleName} />
          </FormField>
          <FormField id={`${prefix}-key`} label="Role key" error={errors.roleKey}>
            <Input id={`${prefix}-key`} value={values.roleKey} onChange={set("roleKey")} placeholder="dpo" aria-invalid={!!errors.roleKey} />
          </FormField>
          <FormField id={`${prefix}-desc`} label="Description (optional)" error={errors.description}>
            <Input id={`${prefix}-desc`} value={values.description} onChange={set("description")} />
          </FormField>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" disabled={create.isPending} />}>Cancel</DialogClose>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2Icon className="animate-spin" />}
              Create role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function RolesPage() {
  const { data: roles, isPending, isError, error, isFetching, refetch } = useRoles()
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Roles &amp; Permissions</CardTitle>
          <CardDescription>
            Built-in roles every company can give to its users: what they may do inside their company&apos;s modules (view, create, edit,
            delete, export, approve). A role never opens a module the company does not have. Each company&apos;s Company Admins also create
            their own roles, limited to the modules their company purchased.
          </CardDescription>
          <CardAction className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            </Button>
            <Button size="sm" onClick={() => setCreating(true)}>
              <PlusIcon />
              Create role
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {isError ? (
            <LoadError title="Couldn't load roles" error={error} onRetry={refetch} />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {COLUMNS.map((c) => (
                      <TableHead key={c} className="px-3">
                        {c}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending && <SkeletonRows columns={COLUMNS.length} rows={3} />}
                  {!isPending && roles.length === 0 && <EmptyRow columns={COLUMNS.length} icon={KeyRoundIcon} title="No roles yet" />}
                  {!isPending &&
                    roles.map((role) => (
                      <TableRow key={role.id} data-role-key={role.role_key}>
                        <TableCell className="max-w-sm px-3 whitespace-normal">
                          <div className="grid">
                            <span className="flex items-center gap-1.5 font-medium">
                              {role.role_name}
                              {role.is_system && <Badge variant="outline">System</Badge>}
                            </span>
                            {role.description && <span className="text-xs text-muted-foreground">{role.description}</span>}
                          </div>
                        </TableCell>
                        <TableCell className="px-3 font-mono text-xs">{role.role_key}</TableCell>
                        <TableCell className="px-3 tabular-nums">{role.users}</TableCell>
                        <TableCell className="px-3 tabular-nums">{role.grants}</TableCell>
                        <TableCell className="px-3">
                          <StatusBadge active={role.is_active} />
                        </TableCell>
                        <TableCell className="px-3">
                          <Link href={`/roles/${role.id}`} className={buttonVariants({ variant: "outline", size: "sm" })} aria-label={`Permissions of ${role.role_name}`}>
                            Permissions
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {creating && (
        <CreateRoleDialog
          open
          onClose={(newId) => {
            setCreating(false)
            if (newId) router.push(`/roles/${newId}`)
          }}
        />
      )}
    </div>
  )
}
