"use client"

import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const selectClass = "h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm dark:bg-input/30"

/**
 * A search box plus any number of dropdown filters.
 * filters: [{ label, value, onChange, options: [{ value, label }] }] (value "" = all)
 */
export function SearchAndFilter({ search, onSearch, placeholder = "Search", filters = [] }) {
  return (
    <div className={cn("grid gap-3", filters.length && "sm:grid-cols-[1fr_repeat(var(--filters),minmax(0,11rem))]")} style={{ "--filters": filters.length }}>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label={placeholder}
          placeholder={placeholder}
          className="pl-8"
          value={search}
          maxLength={100}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      {filters.map((filter) => (
        <select key={filter.label} aria-label={filter.label} value={filter.value} onChange={(e) => filter.onChange(e.target.value)} className={selectClass}>
          {filter.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  )
}
