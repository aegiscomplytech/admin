"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { PlanStatusBadge } from "@/components/billing/badges"
import { PlanForm } from "@/components/billing/plan-form"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { usePlan, useUpdatePlan } from "@/hooks/use-billing"
import { formatDate } from "@/lib/billing"
import { cn } from "@/lib/utils"

export function EditPlan() {
  const { id } = useParams()
  const router = useRouter()
  const { data: plan, isPending, isError, error } = usePlan(id)
  const updatePlan = useUpdatePlan(id)

  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-4">
      <Link href="/plans" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-self-start")}>
        <ArrowLeftIcon />
        All plans
      </Link>

      {isPending && <Skeleton className="h-96" />}
      {isError && (
        <Card role="alert">
          <CardHeader>
            <CardTitle>{error.status === 404 ? "Plan not found" : "Couldn't load this plan"}</CardTitle>
            <CardDescription>{error.status === 404 ? "The link may be wrong." : error.message}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {plan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
              Edit {plan.name}
              <PlanStatusBadge active={plan.is_active} />
            </CardTitle>
            <CardDescription>
              Created {formatDate(plan.created_at)} · used by {plan.usage?.total_subscriptions ?? 0} subscription
              {plan.usage?.total_subscriptions === 1 ? "" : "s"} ({plan.usage?.active_subscriptions ?? 0} active)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlanForm
              key={plan.updated_at}
              mode="edit"
              plan={plan}
              mutation={updatePlan}
              onCancel={() => router.push("/plans")}
              onSaved={() => {
                toast.add({ type: "success", title: "Plan updated", description: "Existing subscriptions keep their original price." })
                router.push("/plans")
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
