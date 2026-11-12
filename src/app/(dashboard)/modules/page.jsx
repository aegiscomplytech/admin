"use client"

import { useId, useState } from "react"
import { BlocksIcon, Loader2Icon, PencilIcon, PlusIcon, RefreshCwIcon, SearchIcon } from "lucide-react"

import { PlanStatusBadge } from "@/components/billing/badges"
import { PaginationBar } from "@/components/data-tables/pagination-bar"
import { FormAlert, FormField } from "@/components/forms/form-field"
import { MODULE_ICONS, ModuleIcon } from "@/components/modules/module-icon"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useModuleList, useSaveModule, useSetModuleStatus } from "@/hooks/use-modules"
import { cn } from "@/lib/utils"

const COLUMNS = ["Module", "Code", "Order", "Used in", "Status", "Actions"]
const fieldClass =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"

/** Create (module = null) or edit a module. */
function ModuleFormDialog({ module, open, onClose }) {
  const prefix = useId()
  const save = useSaveModule()
  const [values, setValues] = useState(() => ({
    name: module?.name ?? "",
    code: module?.code ?? "",
    description: module?.description ?? "",
    icon: module?.icon ?? "",
    displayOrder: String(module?.display_order ?? 0),
    isActive: module?.is_active ?? true,
  }))
  const [errors, setErrors] = useState({})
  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const submit = (event) => {
    event.preventDefault()
    const next = {}
    if (values.name.trim().length < 2) next.name = "Module name must be at least 2 characters"
    if (!module && !/^[A-Za-z0-9][A-Za-z0-9_-]{1,99}$/.test(values.code.trim())) next.code = "2–100 characters: letters, numbers, _ or - (e.g. DATA_DISCOVERY)"
    if (!/^\d{1,6}$/.test(values.displayOrder)) next.displayOrder = "A whole number, 0 or more"
    setErrors(next)
    if (Object.keys(next).length) return

    const input = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      icon: values.icon || null,
      displayOrder: Number(values.displayOrder),
      isActive: values.isActive,
      ...(!module && { code: values.code.trim() }),
    }
    save.mutate(
      { id: module?.id, input },
      {
        onSuccess: (response) => {
          toast.add({ type: "success", title: module ? "Module updated" : "Module created", description: response.data.name })
          onClose()
        },
        onError: (error) => setErrors(Object.fromEntries((error.errors ?? []).filter((e) => e.field).map((e) => [e.field, e.message]))),
      }
    )
  }
  const fid = (name) => `${prefix}-${name}`
  const bannerError = save.error && !save.error.errors ? save.error.message : null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !save.isPending && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{module ? `Edit ${module.name}` : "Create module"}</DialogTitle>
            <DialogDescription>
              {module ? "The module code cannot be changed." : "Modules are added to plans; companies get them through their subscription."}
            </DialogDescription>
          </DialogHeader>
          <FormAlert>{bannerError}</FormAlert>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField id={fid("name")} label="Module name" error={errors.name}>
              <Input id={fid("name")} value={values.name} onChange={set("name")} placeholder="Consent Management" aria-invalid={!!errors.name} />
            </FormField>
            <FormField id={fid("code")} label="Module code" error={errors.code}>
              <Input
                id={fid("code")}
                className="uppercase"
                value={values.code}
                onChange={set("code")}
                disabled={Boolean(module)}
                placeholder="CONSENT_MANAGEMENT"
                aria-invalid={!!errors.code}
              />
            </FormField>
          </div>
          <FormField id={fid("description")} label="Description (optional)" error={errors.description}>
            <textarea id={fid("description")} rows={2} className={fieldClass} value={values.description} onChange={set("description")} />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField id={fid("icon")} label="Icon" error={errors.icon}>
              <div className="flex items-center gap-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border">
                  <ModuleIcon name={values.icon} />
                </span>
                <select id={fid("icon")} className={cn(fieldClass, "h-8 py-0")} value={values.icon} onChange={set("icon")}>
                  <option value="">Default</option>
                  {Object.keys(MODULE_ICONS).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </FormField>
            <FormField id={fid("order")} label="Display order" error={errors.displayOrder}>
              <Input id={fid("order")} inputMode="numeric" value={values.displayOrder} onChange={set("displayOrder")} aria-invalid={!!errors.displayOrder} />
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-primary" checked={values.isActive} onChange={set("isActive")} />
            Active (inactive modules are unavailable to every company)
          </label>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" disabled={save.isPending} />}>Cancel</DialogClose>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2Icon className="animate-spin" />}
              {module ? "Save changes" : "Create module"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function StatusDialog({ module, onClose }) {
  const mutation = useSetModuleStatus()
  if (!module) return null
  const activate = !module.is_active
  return (
    <Dialog open onOpenChange={(o) => !o && !mutation.isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{activate ? "Activate this module?" : "Deactivate this module?"}</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{module.name}</span>
            <br />
            {activate
              ? "Companies whose plan (or a grant) includes it get access again."
              : `No company can use it until it is activated again, even if their plan includes it (used in ${module.usage.plans} plan${module.usage.plans === 1 ? "" : "s"}).`}
          </DialogDescription>
        </DialogHeader>
        {mutation.error && <p className="text-sm text-destructive">{mutation.error.message}</p>}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={mutation.isPending} />}>Cancel</DialogClose>
          <Button
            variant={activate ? "default" : "destructive"}
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate(
                { id: module.id, isActive: activate },
                {
                  onSuccess: (response) => {
                    toast.add({ type: "success", title: response.message, description: module.name })
                    onClose()
                  },
                }
              )
            }
          >
            {activate ? "Activate module" : "Deactivate module"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ModulesPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [editing, setEditing] = useState(undefined) // undefined = closed, null = create, object = edit
  const [statusModule, setStatusModule] = useState(null)
  const debounced = useDebouncedValue(search.trim())
  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } = useModuleList({ page, limit, search: debounced, status })
  const items = data?.items ?? []

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Modules</CardTitle>
          <CardDescription>The DPDP modules of the platform. Add them to plans to give companies access.</CardDescription>
          <CardAction className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            </Button>
            <Button size="sm" onClick={() => setEditing(null)}>
              <PlusIcon />
              Create module
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                aria-label="Search modules"
                placeholder="Search by module name or code"
                className="pl-8"
                value={search}
                maxLength={100}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm dark:bg-input/30"
            >
              <option value="">All modules</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {isError ? (
            <div role="alert" className="grid justify-items-center gap-3 rounded-lg border border-dashed py-12 text-center">
              <p className="font-medium">Couldn&apos;t load modules</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : (
            <div className={cn("rounded-lg border transition-opacity", isPlaceholderData && "opacity-60")}>
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
                  {isPending &&
                    Array.from({ length: 5 }, (_, i) => (
                      <TableRow key={i}>
                        {COLUMNS.map((c) => (
                          <TableCell key={c}>
                            <Skeleton className="h-4 w-full min-w-12" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  {!isPending && items.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={COLUMNS.length} className="py-12 text-center whitespace-normal">
                        <div className="grid justify-items-center gap-2">
                          <BlocksIcon className="size-6 text-muted-foreground" aria-hidden="true" />
                          <p className="font-medium">No modules found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!isPending &&
                    items.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="max-w-sm px-3 whitespace-normal">
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <ModuleIcon name={m.icon} />
                            </span>
                            <div className="grid min-w-0">
                              <span className="font-medium">{m.name}</span>
                              {m.description && <span className="line-clamp-2 text-xs text-muted-foreground">{m.description}</span>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 font-mono text-xs">{m.code}</TableCell>
                        <TableCell className="px-3 tabular-nums">{m.display_order}</TableCell>
                        <TableCell className="px-3 text-muted-foreground">
                          {m.usage.plans} plan{m.usage.plans === 1 ? "" : "s"}
                        </TableCell>
                        <TableCell className="px-3">
                          <PlanStatusBadge active={m.is_active} />
                        </TableCell>
                        <TableCell className="px-3">
                          <div className="flex gap-1.5">
                            <Button variant="outline" size="sm" onClick={() => setEditing(m)} aria-label={`Edit ${m.name}`}>
                              <PencilIcon />
                              Edit
                            </Button>
                            <Button
                              variant={m.is_active ? "ghost" : "outline"}
                              size="sm"
                              onClick={() => setStatusModule(m)}
                              aria-label={`${m.is_active ? "Deactivate" : "Activate"} ${m.name}`}
                            >
                              {m.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
          {!isError && (
            <PaginationBar
              pagination={data?.pagination}
              onPageChange={setPage}
              onLimitChange={(v) => {
                setLimit(v)
                setPage(1)
              }}
              disabled={isFetching}
            />
          )}
        </CardContent>
      </Card>

      {editing !== undefined && <ModuleFormDialog key={editing?.id ?? "new"} module={editing} open onClose={() => setEditing(undefined)} />}
      <StatusDialog module={statusModule} onClose={() => setStatusModule(null)} />
    </div>
  )
}
