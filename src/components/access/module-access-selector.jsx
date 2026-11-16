"use client"

import { useMemo, useState } from "react"
import { ChevronDownIcon, ChevronRightIcon, Loader2Icon, SaveIcon } from "lucide-react"

import { ModuleIcon } from "@/components/modules/module-icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, toDateInput } from "@/lib/billing"
import { cn } from "@/lib/utils"

/** Where the company's access to a module comes from, as a short label. */
function SourceLabel({ module }) {
  if (!module.is_active) return <Badge variant="outline" className="text-muted-foreground">Module inactive</Badge>
  if (module.override?.access_status === "revoked" && !module.override.is_expired) return <Badge variant="destructive">Removed from plan</Badge>
  if (module.assigned && module.in_company_plan) return <Badge variant="secondary">From plan</Badge>
  if (module.assigned) return <Badge variant="secondary">Assigned</Badge>
  if (module.override?.is_expired) return <Badge variant="outline" className="text-muted-foreground">Expired</Badge>
  return null
}

/**
 * Checkbox list of every module: checked = the company has it. Select all / deselect all, optional expiry
 * per module (modules not in the plan), page visibility per module, and SAVE MODULE ACCESS, which sends
 * the selected modules to PUT /companies/:id/modules (the company gets exactly those).
 */
export function ModuleAccessSelector({ modules, saving, onSave, onTogglePage, pageBusy }) {
  const initial = useMemo(() => new Set(modules.filter((m) => m.assigned).map((m) => m.id)), [modules])
  const initialExpiry = useMemo(
    () => Object.fromEntries(modules.map((m) => [m.id, m.assigned && m.override?.access_status === "granted" && m.override.expires_at ? toDateInput(new Date(m.override.expires_at)) : ""])),
    [modules]
  )
  const [selected, setSelected] = useState(initial)
  const [expiry, setExpiry] = useState(initialExpiry)
  const [open, setOpen] = useState(() => new Set())
  const [tomorrow] = useState(() => toDateInput(Date.now() + 86400000))

  const selectable = modules.filter((m) => m.is_active)
  const added = selectable.filter((m) => selected.has(m.id) && !initial.has(m.id))
  const removed = modules.filter((m) => initial.has(m.id) && !selected.has(m.id))
  const expiryChanged = modules.some((m) => selected.has(m.id) && !m.in_company_plan && (expiry[m.id] ?? "") !== (initialExpiry[m.id] ?? ""))
  const dirty = added.length > 0 || removed.length > 0 || expiryChanged

  const toggle = (id) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const toggleOpen = (id) =>
    setOpen((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const save = () =>
    onSave({
      selection: [...selected].filter((id) => selectable.some((m) => m.id === id)),
      // Only send an expiry when it changed: "" -> no expiry (null), a date -> until the end of that day
      expiries: Object.fromEntries(
        [...selected].filter((id) => (expiry[id] ?? "") !== (initialExpiry[id] ?? "")).map((id) => [id, expiry[id] || null])
      ),
      added,
      removed,
    })

  return (
    <div className="grid gap-3" data-testid="module-access-selector">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground" data-testid="selected-count">
          {selected.size} of {selectable.length} modules selected
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelected(new Set(selectable.map((m) => m.id)))} disabled={saving}>
            Select all
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelected(new Set())} disabled={saving}>
            Deselect all
          </Button>
        </div>
      </div>

      <ul className="divide-y rounded-lg border">
        {modules.map((m) => {
          const checked = selected.has(m.id)
          const pagesOpen = open.has(m.id)
          return (
            <li key={m.id} className={cn("grid gap-2 px-3 py-2.5", !m.is_active && "opacity-60")} data-module-code={m.code}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="size-4 shrink-0 accent-primary"
                    checked={checked}
                    disabled={!m.is_active || saving}
                    onChange={() => toggle(m.id)}
                    aria-label={m.name}
                  />
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                    <ModuleIcon name={m.icon} className="size-3.5" />
                  </span>
                  <span className="grid min-w-0">
                    <span className="font-medium">{m.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{m.code}</span>
                  </span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <SourceLabel module={m} />
                  {m.in_company_plan && <Badge variant="outline">In plan</Badge>}
                  {m.has_access ? (
                    <Badge variant="secondary" data-testid="usable-now">Usable now</Badge>
                  ) : (
                    m.assigned && <Badge variant="outline" className="text-muted-foreground">Not usable now</Badge>
                  )}
                  {checked && !m.in_company_plan && m.is_active && (
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      Until
                      <input
                        type="date"
                        min={tomorrow}
                        value={expiry[m.id] ?? ""}
                        onChange={(e) => setExpiry((x) => ({ ...x, [m.id]: e.target.value }))}
                        disabled={saving}
                        aria-label={`Access to ${m.name} until`}
                        className="h-7 rounded-md border border-input bg-transparent px-1.5 text-xs dark:bg-input/30"
                      />
                    </label>
                  )}
                  {m.pages.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => toggleOpen(m.id)} aria-expanded={pagesOpen} aria-label={`Pages of ${m.name}`}>
                      {pagesOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                      {m.pages.length} page{m.pages.length === 1 ? "" : "s"}
                    </Button>
                  )}
                </div>
              </div>
              {m.override?.expires_at && !m.override.is_expired && m.override.access_status === "granted" && (
                <p className="pl-7 text-xs text-muted-foreground">Assigned until {formatDate(m.override.expires_at)}</p>
              )}
              {pagesOpen && (
                <ul className="ml-7 grid gap-1 border-l pl-3" data-testid="module-pages">
                  {m.pages.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 text-xs" data-menu-key={p.menu_key}>
                      <span className={cn(!p.is_active && "text-muted-foreground line-through")}>
                        {p.parent_key && "↳ "}
                        {p.menu_name} <span className="font-mono text-muted-foreground">{p.route_path}</span>
                        {!p.is_active && " (disabled for everyone)"}
                      </span>
                      <Button
                        variant={p.enabled_for_company ? "ghost" : "outline"}
                        size="sm"
                        disabled={pageBusy}
                        onClick={() => onTogglePage(p)}
                        aria-label={`${p.enabled_for_company ? "Hide" : "Show"} ${p.menu_name} for this company`}
                      >
                        {p.enabled_for_company ? "Visible · Hide" : "Hidden · Show"}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {dirty ? `${added.length} to add, ${removed.length} to remove${expiryChanged ? ", expiry changed" : ""}.` : "No unsaved changes."}
        </p>
        <Button onClick={save} disabled={!dirty || saving} data-testid="save-module-access">
          {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
          SAVE MODULE ACCESS
        </Button>
      </div>
    </div>
  )
}
