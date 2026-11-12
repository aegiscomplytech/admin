"use client"

import { useState } from "react"
import Link from "next/link"
import { CreditCardIcon, EyeIcon, PlusIcon, RefreshCwIcon, SearchIcon } from "lucide-react"

import { SubscriptionStatusBadge } from "@/components/billing/badges"
import { PaginationBar } from "@/components/data-tables/pagination-bar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePlans, useSubscriptions } from "@/hooks/use-billing"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { SUBSCRIPTION_STATUSES, SUBSCRIPTION_STATUS_LABELS, formatDate, formatMoney } from "@/lib/billing"
import { cn } from "@/lib/utils"

const COLUMNS = ["Company", "Plan", "Start date", "Expiry date", "Price", "Status", ""]
const selectClass = "h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm dark:bg-input/30"

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("")
  const [planId, setPlanId] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const debouncedSearch = useDebouncedValue(search.trim())

  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } = useSubscriptions({
    page,
    limit,
    search: debouncedSearch,
    planId,
    status,
  })
  const { data: plans } = usePlans({ page: 1, limit: 100 })
  const items = data?.items ?? []
  const counts = data?.status_counts ?? {}
  const hasFilters = Boolean(debouncedSearch || planId || status)
  const filter = (setter) => (event) => {
    setter(event.target.value)
    setPage(1)
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscriptions</CardTitle>
          <CardDescription>
            Company subscriptions, newest first. Expired subscriptions are updated automatically. Payments are not tracked here.
          </CardDescription>
          <CardAction className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            </Button>
            <Link href="/subscriptions/assign" className={buttonVariants({ size: "sm" })}>
              <PlusIcon />
              Assign subscription
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_14rem_12rem]">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                aria-label="Search companies"
                placeholder="Search by company name or email"
                className="pl-8"
                value={search}
                maxLength={100}
                onChange={filter(setSearch)}
              />
            </div>
            <select aria-label="Filter by plan" value={planId} onChange={filter(setPlanId)} className={selectClass}>
              <option value="">All plans</option>
              {plans?.items?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.is_active ? "" : " (inactive)"}
                </option>
              ))}
            </select>
            <select aria-label="Filter by status" value={status} onChange={filter(setStatus)} className={selectClass}>
              <option value="">All statuses</option>
              {SUBSCRIPTION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {SUBSCRIPTION_STATUS_LABELS[s]}
                  {data ? ` (${counts[s] ?? 0})` : ""}
                </option>
              ))}
            </select>
          </div>

          {isError ? (
            <div role="alert" className="grid justify-items-center gap-3 rounded-lg border border-dashed py-12 text-center">
              <p className="font-medium">Couldn&apos;t load subscriptions</p>
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
                    {COLUMNS.map((c, i) => (
                      <TableHead key={i} className="px-3">
                        {c}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending &&
                    Array.from({ length: 5 }, (_, i) => (
                      <TableRow key={i}>
                        {COLUMNS.map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full min-w-14" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  {!isPending && items.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={COLUMNS.length} className="py-12 text-center whitespace-normal">
                        <div className="grid justify-items-center gap-2">
                          <CreditCardIcon className="size-6 text-muted-foreground" aria-hidden="true" />
                          <p className="font-medium">No subscriptions found</p>
                          <p className="text-sm text-muted-foreground">
                            {hasFilters ? "No subscriptions match your search or filters." : "Assign a plan to an approved company to get started."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!isPending &&
                    items.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="px-3">
                          <Link href={`/subscriptions/${s.id}`} className="font-medium hover:underline">
                            {s.organization.legal_name}
                          </Link>
                          <div className="text-xs text-muted-foreground">{s.organization.business_email}</div>
                        </TableCell>
                        <TableCell className="px-3">{s.plan.name}</TableCell>
                        <TableCell className="px-3 text-muted-foreground">{formatDate(s.start_date)}</TableCell>
                        <TableCell className="px-3 text-muted-foreground">{formatDate(s.end_date, "No end date")}</TableCell>
                        <TableCell className="px-3 tabular-nums">{formatMoney(s.price_at_purchase, s.currency)}</TableCell>
                        <TableCell className="px-3">
                          <SubscriptionStatusBadge status={s.status} />
                        </TableCell>
                        <TableCell className="px-3">
                          <Link
                            href={`/subscriptions/${s.id}`}
                            className={buttonVariants({ variant: "outline", size: "sm" })}
                            aria-label={`View subscription of ${s.organization.legal_name}`}
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
