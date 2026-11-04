"use client"

import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NAV_ITEMS } from "@/components/sidebar/nav-items"

export function AppHeader() {
  const pathname = usePathname()
  const title = NAV_ITEMS.find((item) => item.href === pathname)?.title ?? "Admin Panel"

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4! self-center!" />
      <h1 className="text-sm font-medium">{title}</h1>
    </header>
  )
}
