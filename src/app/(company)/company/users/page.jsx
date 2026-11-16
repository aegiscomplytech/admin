"use client"

import { useState } from "react"
import Link from "next/link"
import { EyeIcon, RefreshCwIcon, SearchIcon, UserPlusIcon, UsersIcon } from "lucide-react"

import { AccountStatusBadge } from "@/components/company/company-badges"
import { CompanyErrorCard } from "@/components/company/company-dashboard"
import { PaginationBar } from "@/components/data-tables/pagination-bar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useCompanyRoles, useCompanyUsers } from "@/hooks/use-company-admin"
import { cn, formatDateTime } from "@/lib/utils"

const TABS = [
  { value: "", label: "All", count: "total" },
  { value: "active", label: "Active", count: "active" },
  { value: "invited", label: "Invited", count: "invited" },
  { value: "inactive", label: "Inactive", count: "inactive" },
]
const COLUMNS = ["User", "Department / designation", "Role", "Status", "Last sign-in", ""]
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"

/** Company Admin: the company's users (only this company's, filtered by the server). */
export default function CompanyUsersPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [roleId, setRoleId] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const debouncedSearch = useDebouncedValue(search.trim())
  const roles = useCompanyRoles()
  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } = useCompanyUsers({ page, limit, search: debouncedSearch, status, roleId })
  const items = data?.items ?? []
  const filtered = Boolean(debouncedSearch || status || roleId)

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Users</CardTitle>
          <CardDescription>Your company&apos;s employees. They sign in to the Aegis user app and see only what their role allows.</CardDescription>
          <CardAction className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            </Button>
            <Link href="/company/users/new" className={buttonVariants({ size: "sm" })}>
              <UserPlusIcon />
              Add user
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filter by status">
            {TABS.map((tab) => (
              <Button
                key={tab.value}
                role="tab"
                aria-selected={status === tab.value}
                variant={status === tab.value ? "secondary" : "ghost"}
                size="sm"
                onClick={() => {
                  setStatus(tab.value)
                  setPage(1)
                }}
              >
                {tab.label}
                {data && <span className="text-muted-foreground tabular-nums">{data.totals[tab.count]}</span>}
              </Button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                aria-label="Search users"
                placeholder="Search by name, email, department or designation"
                className="pl-8"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
              />
            </div>
            <select
              aria-label="Filter by role"
              className={selectClass}
              value={roleId}
              onChange={(event) => {
                setRoleId(event.target.value)
                setPage(1)
              }}
            >
              <option value="">All roles</option>
              {roles.data?.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {isError ? (
            <CompanyErrorCard title="Couldn't load the users" error={error} onRetry={() => refetch()} />
          ) : (
            <div className={cn("overflow-x-auto rounded-lg border", isPlaceholderData && "opacity-60")}>
              <Table>
                <TableHeader>
                  <TableRow>
                    {COLUMNS.map((c) => (
                      <TableHead key={c}>{c}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending &&
                    Array.from({ length: 4 }, (_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={COLUMNS.length}>
                          <Skeleton className="h-8" />
                        </TableCell>
                      </TableRow>
                    ))}
                  {!isPending && items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={COLUMNS.length}>
                        <div className="grid justify-items-center gap-2 py-10 text-center text-muted-foreground">
                          <UsersIcon className="size-6" />
                          <p>{filtered ? "No users match these filters." : "No users yet. Add your first user."}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {items.map((user) => (
                    <TableRow key={user.id} data-testid="company-user-row" data-email={user.email}>
                      <TableCell>
                        <div className="grid">
                          <span className="font-medium">{user.full_name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{[user.department, user.designation].filter(Boolean).join(" · ") || "—"}</TableCell>
                      <TableCell className="text-sm">{user.role?.name ?? <span className="text-muted-foreground">No role</span>}</TableCell>
                      <TableCell>
                        <AccountStatusBadge status={user.account_status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDateTime(user.last_login_at, "Never")}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/company/users/${user.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })} aria-label={`Open ${user.full_name}`}>
                          <EyeIcon />
                          Open
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {data && data.pagination.total > 0 && (
            <PaginationBar
              pagination={data.pagination}
              pageSizes={[20, 50, 100]}
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
