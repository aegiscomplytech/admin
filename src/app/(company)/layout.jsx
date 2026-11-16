import { Suspense } from "react"
import { Loader2Icon } from "lucide-react"

import { CompanyArea } from "@/components/company/company-area"

function ShellFallback() {
  return (
    <div className="flex min-h-svh flex-1 items-center justify-center text-muted-foreground">
      <Loader2Icon className="size-5 animate-spin" aria-label="Loading" />
    </div>
  )
}

/**
 * Company area (/company/*). The guard and the sidebar read the current URL (usePathname); on dynamic routes
 * such as /company/users/[id] the URL is only known at request time, so with cacheComponents this part sits
 * inside Suspense (same as the Super Admin layout).
 */
export default function CompanyLayout({ children }) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <CompanyArea>{children}</CompanyArea>
    </Suspense>
  )
}
