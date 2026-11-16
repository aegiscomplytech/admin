"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckIcon, EyeIcon, RefreshCwIcon, SearchIcon, Trash2Icon, UsersIcon, XIcon } from "lucide-react"

import { PaginationBar } from "@/components/data-tables/pagination-bar"
import { UserActionDialog } from "@/components/users/user-action-dialog"
import { UserStatusBadge } from "@/components/users/user-status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useUsers } from "@/hooks/use-users"
import { USER_STATUSES, USER_STATUS_LABELS, shortUserId } from "@/lib/users"
import { cn, formatDateTime } from "@/lib/utils"

const COLUMNS = ["User ID", "Name", "Email", "Mobile", "Registered", "Status", "Actions"]
/** Date only in the table (the full date and time show on hover and on the details page). */
const REGISTERED_DATE = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" })

/**
 * Registered users with search, status filter, pagination and row actions.
 * `fixedStatus` locks the filter (the "Pending Requests" page); `initialStatus` presets it.
 */
export function UsersTable({ title, description, fixedStatus, initialStatus = "" }) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState(fixedStatus ?? initialStatus)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pendingAction, setPendingAction] = useState(null) // { user, action }
  const debouncedSearch = useDebouncedValue(search.trim())

  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } = useUsers({
    page,
    limit,
    search: debouncedSearch,
    status,
  })
  const items = data?.items ?? []
  const counts = data?.status_counts
  const hasFilters = Boolean(debouncedSearch || (!fixedStatus && status))

  const changeStatus = (value) => {
    setStatus(value)
    setPage(1)
  }
  const clearFilters = () => {
    setSearch("")
    if (!fixedStatus) changeStatus("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            Refresh
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              aria-label="Search users"
              placeholder="Search by name or email"
              className="pl-8"
              value={search}
              maxLength={100}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
            />
          </div>
          {!fixedStatus && (
            <div role="tablist" aria-label="Filter by status" className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
              {["", ...USER_STATUSES].map((value) => {
                const label = value ? USER_STATUS_LABELS[value] : "All"
                const count = counts ? (value ? counts[value] : counts.total) : null
                return (
                  <button
                    key={value || "all"}
                    type="button"
                    role="tab"
                    aria-selected={status === value}
                    onClick={() => changeStatus(value)}
                    className={cn(
                      "rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                      status === value && "bg-background text-foreground shadow-sm"
                    )}
                  >
                    {label}
                    {count !== null && <span className="ml-1.5 text-xs tabular-nums opacity-70">{count}</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {isError ? (
          <div role="alert" className="grid justify-items-center gap-3 rounded-lg border border-dashed py-12 text-center">
            <p className="font-medium">Couldn&apos;t load users</p>
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
                        <UsersIcon className="size-6 text-muted-foreground" aria-hidden="true" />
                        <p className="font-medium">No users found</p>
                        <p className="text-sm text-muted-foreground">
                          {hasFilters
                            ? "No users match your search or filter."
                            : fixedStatus === "pending"
                              ? "There are no registration requests waiting for review."
                              : "Users appear here once they register."}
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

                {!isPending &&
                  items.map((user) => (
                    <TableRow key={user.id} data-user-email={user.email}>
                      <TableCell className="px-3 font-mono text-xs text-muted-foreground" title={user.id}>
                        {shortUserId(user.id)}
                      </TableCell>
                      <TableCell className="px-3 font-medium">
                        <Link href={`/users/${user.id}`} className="hover:underline">
                          {user.full_name}
                        </Link>
                      </TableCell>
                      <TableCell className="px-3 text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="px-3 text-muted-foreground">{user.mobile}</TableCell>
                      <TableCell className="px-3 text-muted-foreground" title={formatDateTime(user.registered_at)}>
                        {REGISTERED_DATE.format(new Date(user.registered_at))}
                      </TableCell>
                      <TableCell className="px-3">
                        <UserStatusBadge status={user.status} />
                      </TableCell>
                      <TableCell className="px-3">
                        <div className="flex gap-0.5">
                          <Link
                            href={`/users/${user.id}`}
                            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                            aria-label={`View ${user.full_name}`}
                            title="View details"
                          >
                            <EyeIcon />
                          </Link>
                          {user.actions.approve && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-emerald-700 hover:text-emerald-700 dark:text-emerald-400"
                              aria-label={`Approve ${user.full_name}`}
                              title="Approve"
                              onClick={() => setPendingAction({ user, action: "approve" })}
                            >
                              <CheckIcon />
                            </Button>
                          )}
                          {user.actions.reject && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              aria-label={`Reject ${user.full_name}`}
                              title="Reject"
                              onClick={() => setPendingAction({ user, action: "reject" })}
                            >
                              <XIcon />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive"
                            aria-label={`Delete ${user.full_name}`}
                            title="Delete"
                            onClick={() => setPendingAction({ user, action: "delete" })}
                          >
                            <Trash2Icon />
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

      <UserActionDialog user={pendingAction?.user} action={pendingAction?.action} onClose={() => setPendingAction(null)} />
    </Card>
  )
}
