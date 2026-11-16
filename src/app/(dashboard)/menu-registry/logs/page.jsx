"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeftIcon, RefreshCwIcon } from "lucide-react"

import { SyncStatusBadge } from "@/components/access/status-badge"
import { SyncLogsTable } from "@/components/access/sync-logs-table"
import { LoadError } from "@/components/access/table-states"
import { PaginationBar } from "@/components/data-tables/pagination-bar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useSyncLog, useSyncLogs } from "@/hooks/use-access"
import { cn, formatDateTime } from "@/lib/utils"

function SyncLogDialog({ logId, onClose }) {
  const { data: log, isPending, isError, error } = useSyncLog(logId)
  return (
    <Dialog open={Boolean(logId)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Synchronisation {log && `v${log.sync_version}`} {log && <SyncStatusBadge status={log.sync_status} />}
          </DialogTitle>
          <DialogDescription>
            {log
              ? `${formatDateTime(log.synced_at)} · ${log.source === "deployment" ? "Deployment (CI/CD)" : (log.synced_by_name ?? "Super Admin")}`
              : "Loading…"}
          </DialogDescription>
        </DialogHeader>
        {isPending && <Skeleton className="h-32" />}
        {isError && <p className="text-sm text-destructive">{error.message}</p>}
        {log && (
          <div className="grid gap-3 text-sm">
            <p>
              {log.total_routes} routes: {log.created_routes} created, {log.updated_routes} updated, {log.unchanged_routes} unchanged,{" "}
              {log.failed_routes} failed.
            </p>
            {log.errors.length > 0 ? (
              <div className="max-h-80 overflow-y-auto rounded-lg border">
                <table className="w-full text-xs" data-testid="sync-errors">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="px-3 py-2 font-medium">Route</th>
                      <th className="px-3 py-2 font-medium">Problem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {log.errors.map((e, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 align-top font-mono">{e.menu_key ?? (e.index >= 0 ? `#${e.index + 1}` : "manifest")}</td>
                        <td className="px-3 py-2">{e.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">No failed routes.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function SyncLogsPage() {
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [viewing, setViewing] = useState(null)
  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } = useSyncLogs({ page, limit, status })

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6">
      <Link href="/menu-registry" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-self-start")}>
        <ArrowLeftIcon />
        Menu &amp; Route Registry
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Route synchronisation logs</CardTitle>
          <CardDescription>Every route manifest sent by a deployment: what was created, updated, and what failed.</CardDescription>
          <CardAction className="flex gap-2">
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm dark:bg-input/30"
            >
              <option value="">All statuses</option>
              <option value="success">Success</option>
              <option value="partial">Partial</option>
              <option value="failed">Failed</option>
            </select>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          {isError ? (
            <LoadError title="Couldn't load the logs" error={error} onRetry={refetch} />
          ) : (
            <div className={cn("rounded-lg border transition-opacity", isPlaceholderData && "opacity-60")}>
              <SyncLogsTable items={data?.items ?? []} isPending={isPending} onView={setViewing} />
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
      <SyncLogDialog logId={viewing} onClose={() => setViewing(null)} />
    </div>
  )
}
