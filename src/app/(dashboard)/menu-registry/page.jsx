"use client"

import { useState } from "react"
import Link from "next/link"
import { HistoryIcon, InfoIcon, RefreshCwIcon } from "lucide-react"

import { ConfirmationDialog } from "@/components/access/confirmation-dialog"
import { MenuRegistryTable } from "@/components/access/menu-registry-table"
import { SearchAndFilter } from "@/components/access/search-and-filter"
import { SourceBadge, StatusBadge } from "@/components/access/status-badge"
import { LoadError } from "@/components/access/table-states"
import { PaginationBar } from "@/components/data-tables/pagination-bar"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { useMenu, useMenus, useSetMenuActive } from "@/hooks/use-access"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useModuleList } from "@/hooks/use-modules"
import { cn, formatDateTime } from "@/lib/utils"

function Row({ label, children }) {
  return (
    <div className="grid gap-0.5 py-2 sm:grid-cols-[9rem_1fr] sm:gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium break-words">{children ?? "—"}</dd>
    </div>
  )
}

function MenuDetails({ menuId, onClose, onToggle }) {
  const { data: menu, isPending, isError, error } = useMenu(menuId)
  return (
    <Sheet open={Boolean(menuId)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{menu?.menu_name ?? "Route details"}</SheetTitle>
          <SheetDescription>{menu ? <span className="font-mono">{menu.menu_key}</span> : "Loading…"}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4 pb-6 text-sm">
          {isPending && <Skeleton className="h-60" />}
          {isError && <p className="text-destructive">{error.message}</p>}
          {menu && (
            <>
              <dl className="divide-y" data-testid="menu-details">
                <Row label="Status">
                  <StatusBadge active={menu.is_active} activeLabel="Enabled" inactiveLabel="Disabled" />
                </Row>
                <Row label="Module">{menu.module ? `${menu.module.name} (${menu.module.code})` : "Core page (every user)"}</Row>
                <Row label="Route path">{menu.route_path && <span className="font-mono text-xs">{menu.route_path}</span>}</Row>
                <Row label="Type">{menu.menu_type === "group" ? "Group" : "Page"}</Row>
                <Row label="Parent">{menu.parent && `${menu.parent.menu_name} (${menu.parent.menu_key})`}</Row>
                <Row label="Icon">{menu.icon}</Row>
                <Row label="Display order">{menu.display_order}</Row>
                <Row label="Source">
                  <SourceBadge source={menu.source} />
                </Row>
                <Row label="Registered">{formatDateTime(menu.created_at)}</Row>
                <Row label="Last synchronised">{menu.last_synced_at ? `${formatDateTime(menu.last_synced_at)} (v${menu.last_sync_version})` : "Never"}</Row>
              </dl>
              <div className="grid gap-1.5">
                <h3 className="font-medium">Sub-pages</h3>
                {menu.children.length ? (
                  <ul className="grid gap-1 text-xs">
                    {menu.children.map((c) => (
                      <li key={c.id} className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5">
                        <span>
                          {c.menu_name} <span className="font-mono text-muted-foreground">{c.route_path}</span>
                        </span>
                        <StatusBadge active={c.is_active} activeLabel="Enabled" inactiveLabel="Disabled" />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">None</p>
                )}
              </div>
              <div className="grid gap-1.5">
                <h3 className="font-medium">Hidden for these companies</h3>
                {menu.restricted_for.length ? (
                  <ul className="grid gap-1 text-xs">
                    {menu.restricted_for.map((c) => (
                      <li key={c.id}>
                        <Link href={`/company-access/${c.id}`} className="underline-offset-4 hover:underline">
                          {c.legal_name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">None: every company with the module sees it.</p>
                )}
              </div>
              <Button variant={menu.is_active ? "destructive" : "default"} onClick={() => onToggle(menu)}>
                {menu.is_active ? "Disable for every company" : "Enable this page"}
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function MenuRegistryPage() {
  const [search, setSearch] = useState("")
  const [moduleFilter, setModuleFilter] = useState("")
  const [status, setStatus] = useState("")
  const [source, setSource] = useState("")
  const [onlyNew, setOnlyNew] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(25)
  const [viewing, setViewing] = useState(null)
  const [toggling, setToggling] = useState(null)
  const debounced = useDebouncedValue(search.trim())
  const params = { page, limit, search: debounced, module: moduleFilter, status, source, new: onlyNew }
  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } = useMenus(params)
  const modules = useModuleList({ page: 1, limit: 100 })
  const toggle = useSetMenuActive()
  const reset = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const confirmToggle = () =>
    toggle.mutate(
      { id: toggling.id, isActive: !toggling.is_active },
      {
        onSuccess: (response) => {
          toast.add({ type: "success", title: response.message, description: toggling.menu_name })
          setToggling(null)
        },
      }
    )

  const summary = data?.summary
  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Menu &amp; Route Registry</CardTitle>
          <CardDescription>Every page of the company app, registered from its route manifest. Disable a page to hide it from every company.</CardDescription>
          <CardAction className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            </Button>
            <Link href="/menu-registry/logs" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <HistoryIcon />
              Sync logs
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <div className="flex items-start gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            <InfoIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <p>
              Routes are registered by the company app&apos;s deployment (<span className="font-mono">npm run routes:sync</span> with the deployment
              token), never by company users. New routes start <strong>disabled</strong>: enable them here when they are ready. Registering a route
              never gives a company access; that is decided in Company Access.
            </p>
          </div>

          {summary && (
            <div className="flex flex-wrap gap-2 text-xs" data-testid="registry-summary">
              <Badge variant="outline">{summary.total} routes</Badge>
              <Badge variant="secondary">{summary.active} enabled</Badge>
              <Badge variant="outline">{summary.inactive} disabled</Badge>
              <button type="button" onClick={() => reset(setOnlyNew)(onlyNew === "true" ? "" : "true")}>
                <Badge variant={onlyNew === "true" ? "default" : "outline"}>{summary.new} new this week</Badge>
              </button>
            </div>
          )}

          <SearchAndFilter
            search={search}
            onSearch={reset(setSearch)}
            placeholder="Search by name, key or path"
            filters={[
              {
                label: "Filter by module",
                value: moduleFilter,
                onChange: reset(setModuleFilter),
                options: [
                  { value: "", label: "All modules" },
                  { value: "core", label: "Core pages" },
                  ...(modules.data?.items ?? []).map((m) => ({ value: m.id, label: m.name })),
                ],
              },
              {
                label: "Filter by status",
                value: status,
                onChange: reset(setStatus),
                options: [
                  { value: "", label: "Any status" },
                  { value: "active", label: "Enabled" },
                  { value: "inactive", label: "Disabled" },
                ],
              },
              {
                label: "Filter by source",
                value: source,
                onChange: reset(setSource),
                options: [
                  { value: "", label: "Any source" },
                  { value: "manifest", label: "Route manifest" },
                  { value: "seed", label: "Initial setup" },
                ],
              },
            ]}
          />

          {isError ? (
            <LoadError title="Couldn't load the registry" error={error} onRetry={refetch} />
          ) : (
            <div className={cn("rounded-lg border transition-opacity", isPlaceholderData && "opacity-60")}>
              <MenuRegistryTable items={data?.items ?? []} isPending={isPending} onView={(m) => setViewing(m.id)} onToggle={setToggling} />
            </div>
          )}
          {!isError && (
            <PaginationBar
              pagination={data?.pagination}
              pageSizes={[25, 50, 100, 200]}
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

      <MenuDetails menuId={viewing} onClose={() => setViewing(null)} onToggle={setToggling} />
      <ConfirmationDialog
        open={Boolean(toggling)}
        title={toggling?.is_active ? "Disable this page?" : "Enable this page?"}
        description={
          toggling && (
            <>
              <span className="font-medium text-foreground">
                {toggling.menu_name} <span className="font-mono text-xs">{toggling.route_path}</span>
              </span>
              <br />
              {toggling.is_active
                ? "No company will see or open it (and its sub-pages) until it is enabled again."
                : "Companies that have its module will see it in their menu."}
            </>
          )
        }
        confirmLabel={toggling?.is_active ? "Disable page" : "Enable page"}
        variant={toggling?.is_active ? "destructive" : "default"}
        pending={toggle.isPending}
        error={toggle.error?.message}
        onConfirm={confirmToggle}
        onClose={() => {
          toggle.reset()
          setToggling(null)
        }}
      />
    </div>
  )
}
