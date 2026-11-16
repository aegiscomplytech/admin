"use client"

import { useId, useState } from "react"
import { Loader2Icon } from "lucide-react"

import { FormAlert, FormField } from "@/components/forms/form-field"
import { ModuleIcon } from "@/components/modules/module-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { usePermissionCatalog } from "@/hooks/use-company-admin"

const textareaClass =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"

/** Short module label for permission names: "View Data Discovery". */
const permissionLabel = (permission, module) => `${permission.name} ${module.name}`

/**
 * Create / edit a custom role. The permission grid is built ONLY from the server's catalog: the modules the company
 * purchased and can use right now, each with the permissions it offers. The server checks the selection again.
 */
export function RoleEditor({ mode, role, mutation, onSaved, onCancel }) {
  const prefix = useId()
  const catalog = usePermissionCatalog()
  const [name, setName] = useState(role?.name ?? "")
  const [description, setDescription] = useState(role?.description ?? "")
  const [isActive, setIsActive] = useState(role?.is_active ?? true)
  const [selected, setSelected] = useState(() => new Set(role?.permission_ids ?? []))
  const [errors, setErrors] = useState({})

  const modules = catalog.data?.modules ?? []
  const offeredIds = new Set(modules.flatMap((m) => m.permissions.map((p) => p.id)))
  // Grants on modules the company no longer has: not shown, removed when the role is saved
  const stale = [...selected].filter((id) => catalog.data && !offeredIds.has(id))

  const toggle = (id) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const toggleModule = (module, on) =>
    setSelected((current) => {
      const next = new Set(current)
      for (const p of module.permissions) {
        if (on) next.add(p.id)
        else next.delete(p.id)
      }
      return next
    })

  const submit = (event) => {
    event.preventDefault()
    if (name.trim().length < 2) {
      setErrors({ roleName: "Role name must be at least 2 characters" })
      return
    }
    const permissionIds = [...selected].filter((id) => offeredIds.has(id))
    const body = {
      roleName: name.trim(),
      description: description.trim() || null,
      permissionIds,
      ...(mode === "edit" && { isActive }),
    }
    mutation.mutate(body, {
      onSuccess: onSaved,
      onError: (error) => setErrors(Object.fromEntries((error.errors ?? []).filter((e) => e.field).map((e) => [e.field, e.message]))),
    })
  }

  const permissionErrors = Object.entries(errors).filter(([field]) => field.startsWith("permissionIds"))
  const bannerError = mutation.error && !errors.roleName && !permissionErrors.length ? mutation.error.message : null

  return (
    <form onSubmit={submit} noValidate className="grid gap-5" data-testid="role-editor">
      <FormAlert>{bannerError}</FormAlert>
      {permissionErrors.length > 0 && (
        <FormAlert>
          <p className="font-medium">{mutation.error?.message}</p>
          <ul className="list-disc pl-4">
            {permissionErrors.map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </FormAlert>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={`${prefix}-name`} label="Role name" error={errors.roleName}>
          <Input
            id={`${prefix}-name`}
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setErrors((e) => ({ ...e, roleName: undefined }))
            }}
            placeholder="HR Manager"
            aria-invalid={!!errors.roleName}
          />
        </FormField>
        {mode === "edit" && (
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input type="checkbox" className="size-4 accent-primary" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            Active (an inactive role gives its users no permissions)
          </label>
        )}
      </div>
      <FormField id={`${prefix}-description`} label="Description (optional)" error={errors.description}>
        <textarea id={`${prefix}-description`} rows={2} className={textareaClass} value={description} onChange={(event) => setDescription(event.target.value)} />
      </FormField>

      <section className="grid gap-3" aria-labelledby={`${prefix}-perms`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 id={`${prefix}-perms`} className="text-sm font-medium">
            Permissions
          </h3>
          <span className="text-xs text-muted-foreground" data-testid="selected-count">
            {[...selected].filter((id) => offeredIds.has(id)).length} selected
          </span>
        </div>
        <p className="text-xs text-muted-foreground">Only the modules your company purchased are listed. A user also needs View to open a module.</p>
        {catalog.isPending && <Skeleton className="h-40" />}
        {catalog.isError && <FormAlert>{catalog.error.message}</FormAlert>}
        {catalog.data?.notice && <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">{catalog.data.notice}</p>}
        {stale.length > 0 && (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            {stale.length} permission{stale.length === 1 ? "" : "s"} of this role belong to modules your company no longer has; saving removes them.
          </p>
        )}
        <div className="grid gap-3 md:grid-cols-2" data-testid="permission-matrix">
          {modules.map((module) => {
            const count = module.permissions.filter((p) => selected.has(p.id)).length
            const all = count === module.permissions.length
            return (
              <fieldset key={module.id} className="grid gap-2 rounded-lg border p-3" data-module={module.code}>
                <legend className="sr-only">{module.name}</legend>
                <div className="flex items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                    <ModuleIcon name={module.icon} />
                  </span>
                  <span className="flex-1 text-sm font-medium">{module.name}</span>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      className="size-3.5 accent-primary"
                      checked={all}
                      ref={(el) => {
                        if (el) el.indeterminate = count > 0 && !all
                      }}
                      onChange={(event) => toggleModule(module, event.target.checked)}
                      aria-label={`All permissions in ${module.name}`}
                    />
                    All
                  </label>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 pl-9">
                  {module.permissions.map((permission) => (
                    <label key={permission.id} className="flex items-center gap-2 text-sm" title={permission.description ?? undefined}>
                      <input
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={selected.has(permission.id)}
                        onChange={() => toggle(permission.id)}
                        aria-label={permissionLabel(permission, module)}
                        data-permission={`${module.code}.${permission.key}`}
                      />
                      {permission.name}
                    </label>
                  ))}
                </div>
              </fieldset>
            )
          })}
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={mutation.isPending || catalog.isPending}>
          {mutation.isPending && <Loader2Icon className="animate-spin" />}
          {mode === "create" ? "Create role" : "Save role"}
        </Button>
      </div>
    </form>
  )
}
