import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { CompanyRoleDetails } from "./company-role-details"

/** /company/roles/[id]: the id is only known at request time, so the component reading it sits inside Suspense. */
export default function CompanyRolePage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-96 w-full max-w-5xl" />}>
      <CompanyRoleDetails />
    </Suspense>
  )
}
