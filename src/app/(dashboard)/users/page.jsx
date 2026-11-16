import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { AllUsers } from "./all-users"

/** /users — all registered users. ?status= presets the filter (the dashboard cards link here). */
export default function UsersPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-96 w-full max-w-6xl" />}>
      <AllUsers />
    </Suspense>
  )
}
