"use client"

import { useState } from "react"
import Link from "next/link"
import { BlocksIcon, PackageIcon, PencilIcon, PlusIcon, RefreshCwIcon, SearchIcon } from "lucide-react"

import { PlanStatusBadge } from "@/components/billing/badges"
import { PaginationBar } from "@/components/data-tables/pagination-bar"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { usePlans, useSetPlanStatus } from "@/hooks/use-billing"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { INTERVAL_LABELS, formatDate, formatMoney } from "@/lib/billing"
import { cn } from "@/lib/utils"

const COLUMNS = ["Plan", "Code", "Price", "Billing", "Status", "Created", "Actions"]

/** Confirmation before activating / deactivating a plan. */
function PlanStatusDialog({ plan, onClose }) {
  const mutation = useSetPlanStatus()
  if (!plan) return null
  const activate = !plan.is_active

  return (
    <Dialog open onOpenChange={(open) => !open && !mutation.isPending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{activate ? "Activate this plan?" : "Deactivate this plan?"}</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{plan.name}</span>
            <br />
            {activate
              ? "The plan can be assigned to companies again."
              : `The plan can no longer be assigned. Existing subscriptions (${plan.usage?.active_subscriptions ?? 0} active) keep it.`}
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
                { id: plan.id, isActive: activate },
                {
                  onSuccess: (response) => {
                    toast.add({ type: "success", title: response.message, description: plan.name })
                    onClose()
                  },
                }
              )
            }
          >
            {activate ? "Activate plan" : "Deactivate plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function PlansPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [statusPlan, setStatusPlan] = useState(null)
  const debouncedSearch = useDebouncedValue(search.trim())

  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } = usePlans({
    page,
    limit,
    search: debouncedSearch,
    status,
  })
  const items = data?.items ?? []
  const hasFilters = Boolean(debouncedSearch || status)

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plans</CardTitle>
          <CardDescription>Subscription plans that can be assigned to companies.</CardDescription>
          <CardAction className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            </Button>
            <Link href="/plans/create" className={buttonVariants({ size: "sm" })}>
              <PlusIcon />
              Create plan
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                aria-label="Search plans"
                placeholder="Search by plan name or code"
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
              onChange={(event) => {
                setStatus(event.target.value)
                setPage(1)
              }}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm dark:bg-input/30"
            >
              <option value="">All plans</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {isError ? (
            <div role="alert" className="grid justify-items-center gap-3 rounded-lg border border-dashed py-12 text-center">
              <p className="font-medium">Couldn&apos;t load plans</p>
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
                    Array.from({ length: 4 }, (_, i) => (
                      <TableRow key={i}>
                        {COLUMNS.map((c) => (
                          <TableCell key={c}>
                            <Skeleton className="h-4 w-full min-w-14" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  {!isPending && items.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={COLUMNS.length} className="py-12 text-center whitespace-normal">
                        <div className="grid justify-items-center gap-2">
                          <PackageIcon className="size-6 text-muted-foreground" aria-hidden="true" />
                          <p className="font-medium">No plans found</p>
                          <p className="text-sm text-muted-foreground">
                            {hasFilters ? "No plans match your search or filter." : "Create your first plan to get started."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!isPending &&
                    items.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="px-3">
                          <div className="grid">
                            <span className="font-medium">{plan.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {plan.usage?.active_subscriptions ?? 0} active subscription{plan.usage?.active_subscriptions === 1 ? "" : "s"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 font-mono text-xs">{plan.code}</TableCell>
                        <TableCell className="px-3 tabular-nums">{formatMoney(plan.price, plan.currency)}</TableCell>
                        <TableCell className="px-3 text-muted-foreground">
                          {INTERVAL_LABELS[plan.billing_interval]}
                          {plan.effective_duration_days ? ` · ${plan.effective_duration_days} days` : ""}
                        </TableCell>
                        <TableCell className="px-3">
                          <PlanStatusBadge active={plan.is_active} />
                        </TableCell>
                        <TableCell className="px-3 text-muted-foreground">{formatDate(plan.created_at)}</TableCell>
                        <TableCell className="px-3">
                          <div className="flex gap-1.5">
                            <Link
                              href={`/plans/${plan.id}/edit`}
                              className={buttonVariants({ variant: "outline", size: "sm" })}
                              aria-label={`Edit ${plan.name}`}
                            >
                              <PencilIcon />
                              Edit
                            </Link>
                            <Link
                              href={`/plans/${plan.id}/modules`}
                              className={buttonVariants({ variant: "outline", size: "sm" })}
                              aria-label={`Modules of ${plan.name}`}
                            >
                              <BlocksIcon />
                              Modules
                            </Link>
                            <Button
                              variant={plan.is_active ? "ghost" : "outline"}
                              size="sm"
                              onClick={() => setStatusPlan(plan)}
                              aria-label={`${plan.is_active ? "Deactivate" : "Activate"} ${plan.name}`}
                            >
                              {plan.is_active ? "Deactivate" : "Activate"}
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
              onLimitChange={(value) => {
                setLimit(value)
                setPage(1)
              }}
              disabled={isFetching}
            />
          )}
        </CardContent>
      </Card>

      <PlanStatusDialog plan={statusPlan} onClose={() => setStatusPlan(null)} />
    </div>
  )
}
