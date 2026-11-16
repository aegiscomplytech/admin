"use client"

import Link from "next/link"

import { SourceBadge, StatusBadge } from "@/components/access/status-badge"
import { ModuleIcon } from "@/components/modules/module-icon"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useModuleDetails } from "@/hooks/use-access"
import { formatDateTime } from "@/lib/utils"

/** A module's details and the pages registered inside it (menu registry). */
export function ModuleDetailsSheet({ moduleId, onClose }) {
  const { data: module, isPending, isError, error } = useModuleDetails(moduleId)
  return (
    <Sheet open={Boolean(moduleId)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {module && <ModuleIcon name={module.icon} />}
            {module?.name ?? "Module"}
          </SheetTitle>
          <SheetDescription>{module ? <span className="font-mono">{module.code}</span> : "Loading…"}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4 pb-6 text-sm">
          {isPending && <Skeleton className="h-60" />}
          {isError && <p className="text-destructive">{error.message}</p>}
          {module && (
            <>
              {module.description && <p className="text-muted-foreground">{module.description}</p>}
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Status</dt>
                  <dd>{module.is_deleted ? "Deleted" : <StatusBadge active={module.is_active} />}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Used in plans</dt>
                  <dd className="font-medium">{module.usage.plans}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Company assignments</dt>
                  <dd className="font-medium">{module.usage.company_overrides}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Updated</dt>
                  <dd className="font-medium">{formatDateTime(module.updated_at)}</dd>
                </div>
              </dl>
              <div className="grid gap-2">
                <h3 className="font-medium">Permissions it offers</h3>
                <p className="text-xs text-muted-foreground">What Company Admins can give in their roles for this module.</p>
                <div className="flex flex-wrap gap-1.5" data-testid="module-offered-permissions">
                  {(module.permissions ?? []).map((key) => (
                    <Badge key={key} variant="secondary">
                      {key}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <h3 className="font-medium">Registered pages ({module.pages.length})</h3>
                {module.pages.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No pages registered for this module yet. They appear when the company app&apos;s route manifest lists them.</p>
                ) : (
                  <ul className="grid gap-1.5" data-testid="module-pages-list">
                    {module.pages.map((p) => (
                      <li key={p.id} className="grid gap-1 rounded-md border px-2.5 py-2 text-xs">
                        <span className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium">
                            {p.parent_key && "↳ "}
                            {p.menu_name}
                          </span>
                          <StatusBadge active={p.is_active} activeLabel="Enabled" inactiveLabel="Disabled" />
                        </span>
                        <span className="flex flex-wrap items-center gap-2 text-muted-foreground">
                          <span className="font-mono">{p.route_path ?? p.menu_key}</span>
                          <SourceBadge source={p.source} />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link href="/menu-registry" className="text-xs underline-offset-4 hover:underline">
                  Manage pages in the Menu Registry
                </Link>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
