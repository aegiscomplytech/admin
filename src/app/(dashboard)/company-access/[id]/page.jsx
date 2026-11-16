import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { CompanyAccessDetails } from "./company-access-details"

/**
 * /company-access/[id]: one company's modules, pages and access history.
 * useParams needs Suspense with cacheComponents.
 */
export default function CompanyAccessDetailsPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-96 w-full max-w-6xl" />}>
      <CompanyAccessDetails />
    </Suspense>
  )
}
