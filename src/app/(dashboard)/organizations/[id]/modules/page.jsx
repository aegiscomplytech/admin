import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { CompanyModules } from "./company-modules"

/** /organizations/[id]/modules: the id is only known at request time, so the client part sits in Suspense. */
export default function CompanyModulesPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-96 w-full max-w-6xl" />}>
      <CompanyModules />
    </Suspense>
  )
}
