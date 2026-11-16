"use client"

import { useState } from "react"
import { RefreshCwIcon } from "lucide-react"

import { CompanyTable } from "@/components/access/company-table"
import { SearchAndFilter } from "@/components/access/search-and-filter"
import { LoadError } from "@/components/access/table-states"
import { PaginationBar } from "@/components/data-tables/pagination-bar"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCompanyAccessList } from "@/hooks/use-access"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useModuleList } from "@/hooks/use-modules"
import { cn } from "@/lib/utils"

export default function CompanyAccessPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [access, setAccess] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const debounced = useDebouncedValue(search.trim())
  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } = useCompanyAccessList({ page, limit, search: debounced, status, access })
  const modules = useModuleList({ page: 1, limit: 1, status: "active" })
  const reset = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Company Access</CardTitle>
          <CardDescription>
            Choose which modules each company can use. Every company uses the same application; its menu shows only its modules.
          </CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <SearchAndFilter
            search={search}
            onSearch={reset(setSearch)}
            placeholder="Search by company name or email"
            filters={[
              {
                label: "Filter by company status",
                value: status,
                onChange: reset(setStatus),
                options: [
                  { value: "", label: "Any company status" },
                  { value: "approved", label: "Approved" },
                  { value: "pending", label: "Pending" },
                  { value: "suspended", label: "Suspended" },
                  { value: "deactivated", label: "Deactivated" },
                  { value: "rejected", label: "Rejected" },
                ],
              },
              {
                label: "Filter by access",
                value: access,
                onChange: reset(setAccess),
                options: [
                  { value: "", label: "Any access" },
                  { value: "active", label: "Active" },
                  { value: "no_modules", label: "No modules" },
                  { value: "no_subscription", label: "No valid subscription" },
                  { value: "company_inactive", label: "Company not active" },
                ],
              },
            ]}
          />
          {isError ? (
            <LoadError title="Couldn't load companies" error={error} onRetry={refetch} />
          ) : (
            <div className={cn("rounded-lg border transition-opacity", isPlaceholderData && "opacity-60")}>
              <CompanyTable items={data?.items ?? []} isPending={isPending} totalModules={modules.data?.pagination.total} />
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
    </div>
  )
}
