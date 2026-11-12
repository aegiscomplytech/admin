"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { PlanForm } from "@/components/billing/plan-form"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { useCreatePlan } from "@/hooks/use-billing"
import { cn } from "@/lib/utils"

export default function CreatePlanPage() {
  const router = useRouter()
  const createPlan = useCreatePlan()

  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-4">
      <Link href="/plans" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-self-start")}>
        <ArrowLeftIcon />
        All plans
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create plan</CardTitle>
          <CardDescription>The plan code cannot be changed later.</CardDescription>
        </CardHeader>
        <CardContent>
          <PlanForm
            mode="create"
            mutation={createPlan}
            onCancel={() => router.push("/plans")}
            onSaved={(response) => {
              toast.add({ type: "success", title: "Plan created", description: response.data.name })
              router.push("/plans")
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
