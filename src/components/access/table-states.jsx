import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"

/** Loading rows for a table with `columns` columns. */
export function SkeletonRows({ columns, rows = 5 }) {
  return Array.from({ length: rows }, (_, i) => (
    <TableRow key={i}>
      {Array.from({ length: columns }, (_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full min-w-12" />
        </TableCell>
      ))}
    </TableRow>
  ))
}

export function EmptyRow({ columns, icon: Icon, title, description }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columns} className="py-12 text-center whitespace-normal">
        <div className="grid justify-items-center gap-2">
          {Icon && <Icon className="size-6 text-muted-foreground" aria-hidden="true" />}
          <p className="font-medium">{title}</p>
          {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
        </div>
      </TableCell>
    </TableRow>
  )
}

export function LoadError({ title, error, onRetry }) {
  return (
    <div role="alert" className="grid justify-items-center gap-3 rounded-lg border border-dashed py-12 text-center">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{error?.message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
