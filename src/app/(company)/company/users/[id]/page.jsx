import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { CompanyUserDetails } from "./company-user-details"

/** /company/users/[id]: the id is only known at request time, so the component reading it sits inside Suspense. */
export default function CompanyUserPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-96 w-full max-w-4xl" />}>
      <CompanyUserDetails />
    </Suspense>
  )
}
