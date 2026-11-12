"use client"

import { useState } from "react"
import Link from "next/link"
import { Building2Icon, EyeIcon, RefreshCwIcon, SearchIcon } from "lucide-react"

import { PaginationBar } from "@/components/data-tables/pagination-bar"
import { OrganizationStatusBadge } from "@/components/organizations/status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useOrganizations } from "@/hooks/use-organizations"
import { ORGANIZATION_STATUSES, STATUS_LABELS } from "@/lib/organizations"
import { cn, formatDateTime } from "@/lib/utils"

const COLUMNS = ["Company", "Business email", "Registered", "Status", "Owner", "Actions"]

export default function OrganizationsPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const debouncedSearch = useDebouncedValue(search.trim())

  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } = useOrganizations({
    page,
    limit,
    search: debouncedSearch,
    status,
  })
  const items = data?.items ?? []
  const counts = data?.status_counts ?? {}
  const allCount = Object.values(counts).reduce((sum, n) => sum + n, 0)
  const hasFilters = Boolean(debouncedSearch || status)

  const changeStatus = (value) => {
    setStatus(value)
    setPage(1)
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Companies</CardTitle>
          <CardDescription>All companies registered on the platform, newest first.</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
              Refresh
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                aria-label="Search companies"
                placeholder="Search by company name or business email"
                className="pl-8"
                value={search}
                maxLength={100}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
              />
            </div>
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(event) => changeStatus(event.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="">All statuses{data ? ` (${allCount})` : ""}</option>
              {ORGANIZATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                  {data ? ` (${counts[s] ?? 0})` : ""}
                </option>
              ))}
            </select>
          </div>

          {isError ? (
            <div role="alert" className="grid justify-items-center gap-3 rounded-lg border border-dashed py-12 text-center">
              <p className="font-medium">Couldn&apos;t load companies</p>
              <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : (
            <div className={cn("rounded-lg border transition-opacity", isPlaceholderData && "opacity-60")} aria-busy={isFetching}>
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
                            <Skeleton className="h-4 w-full min-w-16" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}

                  {!isPending && items.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={COLUMNS.length} className="py-12 text-center whitespace-normal">
                        <div className="grid justify-items-center gap-2">
                          <Building2Icon className="size-6 text-muted-foreground" aria-hidden="true" />
                          <p className="font-medium">No companies found</p>
                          <p className="text-sm text-muted-foreground">
                            {hasFilters ? "No companies match your search or filter." : "Companies appear here once they register."}
                          </p>
                          {hasFilters && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearch("")
                                changeStatus("")
                              }}
                            >
                              Clear filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {!isPending &&
                    items.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="px-3 font-medium">
                          <Link href={`/organizations/${org.id}`} className="hover:underline">
                            {org.legal_name}
                          </Link>
                        </TableCell>
                        <TableCell className="px-3 text-muted-foreground">{org.business_email}</TableCell>
                        <TableCell className="px-3 text-muted-foreground">{formatDateTime(org.registered_at)}</TableCell>
                        <TableCell className="px-3">
                          <OrganizationStatusBadge status={org.status} />
                        </TableCell>
                        <TableCell className="px-3">
                          {org.owner ? (
                            <div className="grid">
                              <span>{org.owner.full_name}</span>
                              <span className="text-xs text-muted-foreground">{org.owner.email}</span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="px-3">
                          <Link
                            href={`/organizations/${org.id}`}
                            className={buttonVariants({ variant: "outline", size: "sm" })}
                            aria-label={`View ${org.legal_name}`}
                          >
                            <EyeIcon />
                            View
                          </Link>
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
              onLimitChange={(value) => {
                setLimit(value)
                setPage(1)
              }}
              disabled={isFetching}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
