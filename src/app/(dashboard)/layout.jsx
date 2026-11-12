import { Suspense } from "react"
import { Loader2Icon } from "lucide-react"

import { AppHeader } from "@/components/header/app-header"
import { AdminAuthGuard } from "@/components/layout/admin-auth-guard"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

function ShellFallback() {
  return (
    <div className="flex min-h-svh flex-1 items-center justify-center text-muted-foreground">
      <Loader2Icon className="size-5 animate-spin" aria-label="Loading" />
    </div>
  )
}

export default function DashboardLayout({ children }) {
  return (
    // The guard, sidebar and header read the current URL (usePathname). On dynamic routes such as
    // /organizations/[id] the URL is only known at request time, so with cacheComponents this
    // part must sit inside Suspense. Static routes are unaffected.
    <Suspense fallback={<ShellFallback />}>
      <AdminAuthGuard>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            <div className="flex-1 p-4 md:p-6">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </AdminAuthGuard>
    </Suspense>
  )
}
