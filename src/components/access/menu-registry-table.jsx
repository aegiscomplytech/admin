"use client"

import { FileSearchIcon } from "lucide-react"

import { ModuleIcon } from "@/components/modules/module-icon"
import { SourceBadge, StatusBadge } from "@/components/access/status-badge"
import { EmptyRow, SkeletonRows } from "@/components/access/table-states"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDateTime } from "@/lib/utils"

const COLUMNS = ["Menu", "Module", "Route path", "Parent", "Source", "Status", "Last synchronised", "Actions"]

/** Every registered page of the company app. */
export function MenuRegistryTable({ items, isPending, onView, onToggle }) {
  return (
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
        {isPending && <SkeletonRows columns={COLUMNS.length} />}
        {!isPending && items.length === 0 && (
          <EmptyRow columns={COLUMNS.length} icon={FileSearchIcon} title="No routes found" description="Routes appear here once the company app's route manifest is synchronised." />
        )}
        {!isPending &&
          items.map((menu) => (
            <TableRow key={menu.id} data-menu-key={menu.menu_key}>
              <TableCell className="px-3 whitespace-normal">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                    <ModuleIcon name={menu.icon} className="size-3.5" />
                  </span>
                  <div className="grid min-w-0">
                    <span className="flex flex-wrap items-center gap-1.5 font-medium">
                      {menu.menu_name}
                      {menu.is_new && <Badge data-testid="new-route">New</Badge>}
                      {menu.menu_type === "group" && <Badge variant="outline">Group</Badge>}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{menu.menu_key}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-3 whitespace-normal">
                {menu.module ? (
                  <span className={menu.module.is_deleted ? "text-muted-foreground line-through" : undefined}>{menu.module.name}</span>
                ) : (
                  <Badge variant="outline">Core page</Badge>
                )}
              </TableCell>
              <TableCell className="px-3 font-mono text-xs">{menu.route_path ?? "—"}</TableCell>
              <TableCell className="px-3 text-muted-foreground">{menu.parent?.menu_name ?? "—"}</TableCell>
              <TableCell className="px-3">
                <SourceBadge source={menu.source} />
              </TableCell>
              <TableCell className="px-3">
                <StatusBadge active={menu.is_active} activeLabel="Enabled" inactiveLabel="Disabled" />
              </TableCell>
              <TableCell className="px-3 text-xs text-muted-foreground">
                {menu.last_synced_at ? (
                  <>
                    {formatDateTime(menu.last_synced_at)}
                    <span className="block">v{menu.last_sync_version}</span>
                  </>
                ) : (
                  "Never"
                )}
              </TableCell>
              <TableCell className="px-3">
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => onView(menu)} aria-label={`View ${menu.menu_name}`}>
                    View
                  </Button>
                  <Button
                    variant={menu.is_active ? "ghost" : "outline"}
                    size="sm"
                    onClick={() => onToggle(menu)}
                    aria-label={`${menu.is_active ? "Disable" : "Enable"} ${menu.menu_name}`}
                  >
                    {menu.is_active ? "Disable" : "Enable"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  )
}
