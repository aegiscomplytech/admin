"use client"

import { useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, FilterXIcon, HistoryIcon, RefreshCwIcon } from "lucide-react"

import { FormAlert } from "@/components/forms/form-field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuditLogs } from "@/hooks/use-dashboard"
import { SELF_SERVICE_ACTOR, formatAuditAction, formatAuditModule } from "@/lib/audit"
import { cn, formatDateTime } from "@/lib/utils"

const PAGE_SIZES = [10, 25, 50, 100]
const EMPTY_FILTERS = { action: "", module: "", start: "", end: "" }
const COLUMNS = ["Admin", "Action", "Module", "Description", "IP address", "Date & time"]

/** Native select styled like the Input component (simple, accessible, works on phones). */
function FilterSelect({ id, label, value, onChange, children }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      >
        {children}
      </select>
    </div>
  )
}

function DateFilter({ id, label, value, onChange, invalid, min, max }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Input
        id={id}
        type="date"
        value={value}
        min={min}
        max={max}
        aria-invalid={invalid || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

/** The picked dates are in the admin's own timezone; the API gets exact start/end instants. */
function toApiParams(filters, page, limit) {
  return {
    page,
    limit,
    action: filters.action,
    module: filters.module,
    start_date: filters.start ? new Date(`${filters.start}T00:00:00`).toISOString() : undefined,
    end_date: filters.end ? new Date(`${filters.end}T23:59:59.999`).toISOString() : undefined,
  }
}

function LoadingRows({ count }) {
  return Array.from({ length: Math.min(count, 10) }, (_, row) => (
    <TableRow key={row}>
      {COLUMNS.map((column) => (
        <TableCell key={column}>
          <Skeleton className="h-4 w-full min-w-16" />
        </TableCell>
      ))}
    </TableRow>
  ))
}

export default function ActivityLogsPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(PAGE_SIZES[0])

  const dateRangeInvalid = Boolean(filters.start && filters.end && filters.start > filters.end)
  const hasFilters = Object.values(filters).some(Boolean)

  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } = useAuditLogs(
    toApiParams(filters, page, limit),
    { enabled: !dateRangeInvalid }
  )

  // Any filter change starts again from page 1
  const updateFilter = (key) => (value) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setPage(1)
  }
  const clearFilters = () => {
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }

  const items = data?.items ?? []
  const pagination = data?.pagination
  const options = data?.filters ?? { actions: [], modules: [] }
  const firstRow = pagination && pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0
  const lastRow = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0
  const showLoading = isPending && !dateRangeInvalid

  return (
    // grid-cols-1 (= minmax(0, 1fr)) lets the column shrink below the table's width on phones,
    // so the table scrolls inside its own box instead of stretching the card off-screen.
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Logs</CardTitle>
          <CardDescription>History of actions performed by Super Admin accounts, newest first.</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching || dateRangeInvalid}>
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
              Refresh
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
            <FilterSelect id="filter-action" label="Action" value={filters.action} onChange={updateFilter("action")}>
              <option value="">All actions</option>
              {options.actions.map((action) => (
                <option key={action} value={action}>
                  {formatAuditAction(action)}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect id="filter-module" label="Module" value={filters.module} onChange={updateFilter("module")}>
              <option value="">All modules</option>
              {options.modules.map((module) => (
                <option key={module} value={module}>
                  {formatAuditModule(module)}
                </option>
              ))}
            </FilterSelect>
            <DateFilter
              id="filter-start"
              label="From"
              value={filters.start}
              max={filters.end || undefined}
              invalid={dateRangeInvalid}
              onChange={updateFilter("start")}
            />
            <DateFilter
              id="filter-end"
              label="To"
              value={filters.end}
              min={filters.start || undefined}
              invalid={dateRangeInvalid}
              onChange={updateFilter("end")}
            />
            <Button variant="ghost" onClick={clearFilters} disabled={!hasFilters}>
              <FilterXIcon />
              Clear
            </Button>
          </div>

          {dateRangeInvalid && <FormAlert>The &ldquo;To&rdquo; date must be on or after the &ldquo;From&rdquo; date.</FormAlert>}

          {isError && !dateRangeInvalid ? (
            <div role="alert" className="grid justify-items-center gap-3 rounded-lg border border-dashed py-12 text-center">
              <p className="font-medium">Couldn&apos;t load activity logs</p>
              <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
                Try again
              </Button>
            </div>
          ) : (
            <div
              className={cn("rounded-lg border transition-opacity", isPlaceholderData && "opacity-60")}
              aria-busy={isFetching}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    {COLUMNS.map((column) => (
                      <TableHead key={column} className="px-3">
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {showLoading && <LoadingRows count={limit} />}

                  {!showLoading && items.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={COLUMNS.length} className="py-12 text-center whitespace-normal">
                        <div className="grid justify-items-center gap-2">
                          <HistoryIcon className="size-6 text-muted-foreground" aria-hidden="true" />
                          <p className="font-medium">No activity found</p>
                          <p className="text-sm text-muted-foreground">
                            {hasFilters
                              ? "No records match these filters."
                              : "Admin activity will appear here once it is recorded."}
                          </p>
                          {hasFilters && (
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                              Clear filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {!showLoading &&
                    items.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="px-3">
                          {log.admin ? (
                            <div className="grid">
                              <span className="font-medium">{log.admin.full_name}</span>
                              <span className="text-xs text-muted-foreground">{log.admin.email}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">{SELF_SERVICE_ACTOR}</span>
                          )}
                        </TableCell>
                        <TableCell className="px-3">
                          <Badge variant="outline">{formatAuditAction(log.action)}</Badge>
                        </TableCell>
                        <TableCell className="px-3 text-muted-foreground">{formatAuditModule(log.module)}</TableCell>
                        <TableCell className="max-w-xs min-w-48 px-3 whitespace-normal">{log.description ?? "—"}</TableCell>
                        <TableCell className="px-3 font-mono text-xs">{log.ip_address ?? "—"}</TableCell>
                        <TableCell className="px-3 text-muted-foreground">{formatDateTime(log.created_at)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}

          {pagination && !isError && !dateRangeInvalid && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-muted-foreground" aria-live="polite">
                {pagination.total > 0
                  ? `Showing ${firstRow}–${lastRow} of ${pagination.total}`
                  : "No records"}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="page-size" className="text-muted-foreground">
                  Rows
                </label>
                <select
                  id="page-size"
                  value={limit}
                  onChange={(event) => {
                    setLimit(Number(event.target.value))
                    setPage(1)
                  }}
                  className="h-7 rounded-md border border-input bg-transparent px-1.5 text-sm dark:bg-input/30"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span className="px-1 text-muted-foreground">
                  Page {pagination.total_pages === 0 ? 0 : pagination.page} of {pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Previous page"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || isFetching}
                >
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Next page"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={page >= pagination.total_pages || isFetching}
                >
                  <ChevronRightIcon />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
