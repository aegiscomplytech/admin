import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { SubscriptionDetails } from "./subscription-details"

/** /subscriptions/[id]: the id is only known at request time, so the client part sits in Suspense. */
export default function SubscriptionDetailsPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-96 w-full max-w-5xl" />}>
      <SubscriptionDetails />
    </Suspense>
  )
}
