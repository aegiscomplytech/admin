import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { UserDetails } from "./user-details"

/**
 * /users/[id]. The id is only known at request time, so the client component that reads it
 * (useParams) sits inside Suspense, as required with cacheComponents.
 */
export default function UserDetailsPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-96 w-full max-w-5xl" />}>
      <UserDetails />
    </Suspense>
  )
}
