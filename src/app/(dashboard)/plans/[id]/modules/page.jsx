import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { PlanModules } from "./plan-modules"

/** /plans/[id]/modules: the id is only known at request time, so the client part sits in Suspense. */
export default function PlanModulesPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-96 w-full max-w-4xl" />}>
      <PlanModules />
    </Suspense>
  )
}
