import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { RoleDetails } from "./role-details"

/** /roles/[id]: one role and its permission matrix. useParams needs Suspense with cacheComponents. */
export default function RoleDetailsPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-96 w-full max-w-6xl" />}>
      <RoleDetails />
    </Suspense>
  )
}
