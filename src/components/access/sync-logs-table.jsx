"use client"

import { HistoryIcon } from "lucide-react"

import { SyncStatusBadge } from "@/components/access/status-badge"
import { EmptyRow, SkeletonRows } from "@/components/access/table-states"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDateTime } from "@/lib/utils"

const COLUMNS = ["Sync version", "Total routes", "Created", "Updated", "Unchanged", "Failed", "Synced by", "Sync date", "Status", ""]

/** Route manifest synchronisations, newest first. */
export function SyncLogsTable({ items, isPending, onView }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {COLUMNS.map((c) => (
            <TableHead key={c || "actions"} className="px-3">
              {c}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isPending && <SkeletonRows columns={COLUMNS.length} />}
        {!isPending && items.length === 0 && (
          <EmptyRow columns={COLUMNS.length} icon={HistoryIcon} title="No synchronisations yet" description="Each deployment of the company app that runs routes:sync appears here." />
        )}
        {!isPending &&
          items.map((log) => (
            <TableRow key={log.id} data-sync-status={log.sync_status}>
              <TableCell className="px-3 font-mono text-xs">v{log.sync_version}</TableCell>
              <TableCell className="px-3 tabular-nums">{log.total_routes}</TableCell>
              <TableCell className="px-3 tabular-nums">{log.created_routes}</TableCell>
              <TableCell className="px-3 tabular-nums">{log.updated_routes}</TableCell>
              <TableCell className="px-3 tabular-nums text-muted-foreground">{log.unchanged_routes}</TableCell>
              <TableCell className={log.failed_routes ? "px-3 font-medium text-destructive tabular-nums" : "px-3 tabular-nums"}>{log.failed_routes}</TableCell>
              <TableCell className="px-3 text-xs whitespace-normal">
                {log.source === "deployment" ? "Deployment (CI/CD)" : (log.synced_by_name ?? "Super Admin")}
              </TableCell>
              <TableCell className="px-3 text-xs text-muted-foreground">{formatDateTime(log.synced_at)}</TableCell>
              <TableCell className="px-3">
                <SyncStatusBadge status={log.sync_status} />
              </TableCell>
              <TableCell className="px-3">
                <Button variant="outline" size="sm" onClick={() => onView(log.id)}>
                  Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  )
}
