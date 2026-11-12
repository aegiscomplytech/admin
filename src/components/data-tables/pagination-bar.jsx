"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * "Showing 1–10 of 42" + rows-per-page + previous / next.
 * `pagination`: { page, limit, total, total_pages } from the API.
 */
export function PaginationBar({ pagination, pageSizes = [10, 25, 50, 100], onPageChange, onLimitChange, disabled }) {
  if (!pagination) return null
  const { page, limit, total, total_pages: totalPages } = pagination
  const first = total > 0 ? (page - 1) * limit + 1 : 0
  const last = Math.min(page * limit, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground" aria-live="polite">
        {total > 0 ? `Showing ${first}–${last} of ${total}` : "No records"}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {onLimitChange && (
          <>
            <label htmlFor="page-size" className="text-muted-foreground">
              Rows
            </label>
            <select
              id="page-size"
              value={limit}
              onChange={(event) => onLimitChange(Number(event.target.value))}
              className="h-7 rounded-md border border-input bg-transparent px-1.5 text-sm dark:bg-input/30"
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </>
        )}
        <span className="px-1 text-muted-foreground">
          Page {totalPages === 0 ? 0 : page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1 || disabled}
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || disabled}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  )
}
