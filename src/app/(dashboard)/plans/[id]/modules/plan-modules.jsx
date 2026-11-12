"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeftIcon, Loader2Icon } from "lucide-react"

import { PlanStatusBadge } from "@/components/billing/badges"
import { FormAlert } from "@/components/forms/form-field"
import { ModuleIcon } from "@/components/modules/module-icon"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { usePlanModuleSummary, usePlanModules, useSavePlanModules } from "@/hooks/use-modules"
import { INTERVAL_LABELS, formatMoney } from "@/lib/billing"
import { cn } from "@/lib/utils"

export function PlanModules() {
  const { id } = useParams()
  const { data, isPending, isError, error } = usePlanModules(id)
  const { data: summary } = usePlanModuleSummary(id)
  const save = useSavePlanModules(id)
  // null = untouched (show what is saved); a Set once the admin changes something
  const [selected, setSelected] = useState(null)

  const back = (
    <Link href="/plans" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-self-start")}>
      <ArrowLeftIcon />
      All plans
    </Link>
  )
  if (isPending) return <div className="mx-auto grid w-full max-w-4xl gap-4">{back}<Skeleton className="h-96" /></div>
  if (isError) {
    return (
      <div className="mx-auto grid w-full max-w-4xl gap-4">
        {back}
        <Card role="alert">
          <CardHeader>
            <CardTitle>{error.status === 404 ? "Plan not found" : "Couldn't load this plan"}</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const saved = new Set(data.modules.filter((m) => m.included).map((m) => m.id))
  const current = selected ?? saved
  const dirty = selected !== null && (selected.size !== saved.size || [...selected].some((x) => !saved.has(x)))
  const toggle = (moduleId) => {
    const next = new Set(current)
    if (next.has(moduleId)) next.delete(moduleId)
    else next.add(moduleId)
    setSelected(next)
  }

  const onSave = () =>
    save.mutate([...current], {
      onSuccess: () => {
        toast.add({ type: "success", title: "Plan modules saved", description: "Companies on this plan get the change immediately." })
        setSelected(null)
      },
    })

  return (
    <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4">
      {back}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
            {data.plan.name} modules
            <PlanStatusBadge active={data.plan.is_active} />
          </CardTitle>
          <CardDescription>
            <span className="font-mono">{data.plan.code}</span> · {formatMoney(data.plan.price, data.plan.currency)}{" "}
            {INTERVAL_LABELS[data.plan.billing_interval]?.toLowerCase()}
            {summary && ` · ${summary.companies_with_access} compan${summary.companies_with_access === 1 ? "y" : "ies"} currently on this plan`}
          </CardDescription>
          <CardAction className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set(data.modules.map((m) => m.id)))}>
              Select all
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FormAlert>{save.error?.message}</FormAlert>
          <ul className="grid gap-2 sm:grid-cols-2" aria-label="Modules">
            {data.modules.map((m) => {
              const checked = current.has(m.id)
              return (
                <li key={m.id}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
                      checked && "border-primary/40 bg-muted/40"
                    )}
                  >
                    <input type="checkbox" className="mt-1 size-4 accent-primary" checked={checked} onChange={() => toggle(m.id)} aria-label={m.name} />
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <ModuleIcon name={m.icon} />
                    </span>
                    <span className="grid min-w-0 gap-0.5">
                      <span className="flex flex-wrap items-center gap-1.5 font-medium">
                        {m.name}
                        {!m.is_active && <Badge variant="outline">inactive</Badge>}
                      </span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">{m.description}</span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {current.size} of {data.modules.length} modules selected{dirty ? " · unsaved changes" : ""}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" disabled={!dirty || save.isPending} onClick={() => setSelected(null)}>
                Discard
              </Button>
              <Button disabled={!dirty || save.isPending} onClick={onSave}>
                {save.isPending && <Loader2Icon className="animate-spin" />}
                Save configuration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
