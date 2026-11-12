import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { EditPlan } from "./edit-plan"

/** /plans/[id]/edit: the id is only known at request time, so the client part sits in Suspense. */
export default function EditPlanPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-96 w-full max-w-2xl" />}>
      <EditPlan />
    </Suspense>
  )
}
