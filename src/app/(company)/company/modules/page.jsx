"use client"

import { BlocksIcon, RefreshCwIcon } from "lucide-react"

import { PERMISSION_LABELS } from "@/components/company/company-badges"
import { CompanyErrorCard } from "@/components/company/company-dashboard"
import { ModuleIcon } from "@/components/modules/module-icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCompanyModules } from "@/hooks/use-company-admin"
import { cn, formatDateTime } from "@/lib/utils"

/** Company Admin: the modules the company purchased (read-only; the platform assigns them). */
export default function CompanyModulesPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useCompanyModules()

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Purchased modules</CardTitle>
          <CardDescription>
            {data?.subscription
              ? `Included in your ${data.subscription.plan.name} subscription or added for your company. Your roles can only give permissions in these modules.`
              : "Modules work only while your company has a valid subscription."}
          </CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {isPending && <Skeleton className="h-48" />}
          {isError && <CompanyErrorCard title="Couldn't load your modules" error={error} onRetry={() => refetch()} />}
          {data && data.modules.length === 0 && (
            <div className="grid justify-items-center gap-2 py-10 text-center text-sm text-muted-foreground">
              <BlocksIcon className="size-6" />
              <p>Your company has not purchased any module yet. Contact the platform team.</p>
            </div>
          )}
          {data && data.modules.length > 0 && (
            <ul className="grid gap-3 md:grid-cols-2" data-testid="purchased-modules">
              {data.modules.map((m) => (
                <li key={m.id} className="grid gap-3 rounded-lg border p-4" data-module={m.code} data-status={m.status}>
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <ModuleIcon name={m.icon} />
                    </span>
                    <div className="grid flex-1 gap-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{m.name}</span>
                        <Badge variant={m.status === "active" ? "secondary" : "destructive"}>{m.status === "active" ? "Active" : "Unavailable"}</Badge>
                        {m.source === "granted" && <Badge variant="outline">Added for your company</Badge>}
                      </div>
                      {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
                      {m.unavailable_reason && <p className="text-xs text-destructive">{m.unavailable_reason}</p>}
                      {m.expires_at && <p className="text-xs text-muted-foreground">Available until {formatDateTime(m.expires_at)}</p>}
                    </div>
                  </div>
                  <div className="grid gap-1 text-xs">
                    <span className="text-muted-foreground">Permissions you can give in your roles</span>
                    <div className="flex flex-wrap gap-1">
                      {m.permissions.map((p) => (
                        <Badge key={p.key} variant="outline">
                          {PERMISSION_LABELS[p.key] ?? p.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {m.pages.length > 0 && (
                    <div className="grid gap-1 text-xs">
                      <span className="text-muted-foreground">Pages in the user app</span>
                      <span>{m.pages.map((p) => p.name).join(" · ")}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
