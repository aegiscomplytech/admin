"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeftIcon, RefreshCwIcon } from "lucide-react"

import { CompanyAccessSummary } from "@/components/access/company-access-summary"
import { ConfirmationDialog } from "@/components/access/confirmation-dialog"
import { ModuleAccessSelector } from "@/components/access/module-access-selector"
import { PaginationBar } from "@/components/data-tables/pagination-bar"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { useAccessHistory, useCompanyAccess, useSaveCompanyModules, useSetCompanyMenu } from "@/hooks/use-access"
import { formatAuditAction } from "@/lib/audit"
import { endOfDayIso } from "@/lib/billing"
import { cn, formatDateTime } from "@/lib/utils"

function AccessHistory({ companyId }) {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const { data, isPending, isFetching } = useAccessHistory(companyId, { page, limit })
  return (
    <Card>
      <CardHeader>
        <CardTitle>Access history</CardTitle>
        <CardDescription>Every change to this company&apos;s modules and pages, newest first.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {isPending ? (
          <Skeleton className="h-32" />
        ) : data.items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No changes yet.</p>
        ) : (
          <ol className="divide-y text-sm" data-testid="access-history">
            {data.items.map((entry) => (
              <li key={entry.id} className="grid gap-1 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Badge variant="outline">{formatAuditAction(entry.action)}</Badge>
                    <span className="break-words">{entry.description}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {entry.admin?.full_name ?? "System"} · {formatDateTime(entry.created_at)}
                  </span>
                </div>
                {(entry.added.length > 0 || entry.removed.length > 0) && (
                  <div className="flex flex-wrap gap-1 text-xs">
                    {entry.added.map((code) => (
                      <Badge key={`+${code}`} variant="secondary">
                        + {code}
                      </Badge>
                    ))}
                    {entry.removed.map((code) => (
                      <Badge key={`-${code}`} variant="destructive">
                        − {code}
                      </Badge>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
        {data && data.pagination.total > 10 && (
          <PaginationBar
            pagination={data.pagination}
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
  )
}

export function CompanyAccessDetails() {
  const { id } = useParams()
  const { data, isPending, isError, error, isFetching, refetch } = useCompanyAccess(id)
  const save = useSaveCompanyModules(id)
  const setMenu = useSetCompanyMenu(id)
  const [pendingSave, setPendingSave] = useState(null) // waiting for the "remove access" confirmation
  const [pageTarget, setPageTarget] = useState(null)

  const back = (
    <Link href="/company-access" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-self-start")}>
      <ArrowLeftIcon />
      Company Access
    </Link>
  )

  if (isPending) {
    return (
      <div className="mx-auto grid w-full max-w-6xl gap-6" aria-busy="true">
        {back}
        <Skeleton className="h-40" />
        <Skeleton className="h-96" />
      </div>
    )
  }
  if (isError) {
    return (
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        {back}
        <Card role="alert">
          <CardContent className="grid justify-items-center gap-3 py-10 text-center">
            <p className="font-medium">{error.status === 404 ? "Company not found" : "Couldn't load this company"}</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const submit = ({ selection, expiries }) =>
    save.mutate(
      {
        modules: selection.map((moduleId) =>
          moduleId in expiries ? { module: moduleId, expiresAt: expiries[moduleId] ? endOfDayIso(expiries[moduleId]) : null } : moduleId
        ),
      },
      {
        onSuccess: (response) => {
          toast.add({ type: "success", title: "Module access saved", description: response.message })
          setPendingSave(null)
        },
        onError: (e) => {
          if (!pendingSave) toast.add({ type: "error", title: "Couldn't save module access", description: e.message })
        },
      }
    )

  const onSave = (change) => (change.removed.length ? setPendingSave(change) : submit(change))

  const togglePage = () =>
    setMenu.mutate(
      { menuId: pageTarget.id, isEnabled: !pageTarget.enabled_for_company },
      {
        onSuccess: (response) => {
          toast.add({ type: "success", title: response.message, description: pageTarget.menu_name })
          setPageTarget(null)
        },
      }
    )

  // Re-initialise the selector whenever the saved access changes
  const selectorKey = data.modules.map((m) => `${m.id}:${m.assigned}:${m.override?.expires_at ?? ""}:${m.pages.map((p) => p.enabled_for_company).join("")}`).join("|")

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6">
      {back}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Company: {data.company.legal_name}</CardTitle>
          <CardDescription>
            <Link href={`/organizations/${data.company.id}`} className="underline-offset-4 hover:underline">
              Company details
            </Link>
          </CardDescription>
          <CardAction>
            <Button variant="ghost" size="icon-sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <CompanyAccessSummary data={data} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available modules</CardTitle>
          <CardDescription>
            Tick exactly the modules this company should have, then save. Modules in its plan are ticked by default; unticking one removes it
            for this company only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ModuleAccessSelector key={selectorKey} modules={data.modules} saving={save.isPending} onSave={onSave} onTogglePage={setPageTarget} pageBusy={setMenu.isPending} />
        </CardContent>
      </Card>

      <AccessHistory companyId={id} />

      <ConfirmationDialog
        open={Boolean(pendingSave)}
        title="Remove module access?"
        description={
          pendingSave && (
            <>
              <span className="font-medium text-foreground">{data.company.legal_name}</span> will lose access to:
              <ul className="mt-2 list-disc pl-5 text-foreground">
                {pendingSave.removed.map((m) => (
                  <li key={m.id}>{m.name}</li>
                ))}
              </ul>
              <span className="mt-2 block">Its users can no longer open these modules, from their very next request.</span>
            </>
          )
        }
        confirmLabel="Remove and save"
        variant="destructive"
        pending={save.isPending}
        error={save.error?.message}
        onConfirm={() => submit(pendingSave)}
        onClose={() => {
          save.reset()
          setPendingSave(null)
        }}
      />
      <ConfirmationDialog
        open={Boolean(pageTarget)}
        title={pageTarget?.enabled_for_company ? "Hide this page for the company?" : "Show this page again?"}
        description={
          pageTarget &&
          (pageTarget.enabled_for_company
            ? `"${pageTarget.menu_name}" (and its sub-pages) will not be available to ${data.company.legal_name}, even though it has the module.`
            : `"${pageTarget.menu_name}" will be available to ${data.company.legal_name} again (if it has the module).`)
        }
        confirmLabel={pageTarget?.enabled_for_company ? "Hide page" : "Show page"}
        variant={pageTarget?.enabled_for_company ? "destructive" : "default"}
        pending={setMenu.isPending}
        error={setMenu.error?.message}
        onConfirm={togglePage}
        onClose={() => {
          setMenu.reset()
          setPageTarget(null)
        }}
      />
    </div>
  )
}
