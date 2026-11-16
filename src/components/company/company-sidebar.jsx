"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BlocksIcon,
  Building2Icon,
  CreditCardIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useCompanyLogout } from "@/hooks/use-company"
import { COMPANY_CHANGE_PASSWORD_PATH } from "@/lib/auth"

/** Company Admin navigation. Also used by the header for the page title. */
export const COMPANY_NAV = [
  { title: "Dashboard", href: "/company", icon: LayoutDashboardIcon, match: (p) => p === "/company" },
  { title: "Purchased Modules", href: "/company/modules", icon: BlocksIcon },
  { title: "Users", href: "/company/users", icon: UsersIcon, match: (p) => p === "/company/users" || p.startsWith("/company/users/") },
  { title: "Roles & Permissions", href: "/company/roles", icon: UserCogIcon, match: (p) => p === "/company/roles" || p.startsWith("/company/roles/") },
  { title: "Subscription", href: "/company/subscription", icon: CreditCardIcon },
]

export const isCompanyNavActive = (item, pathname) => (item.match ? item.match(pathname) : pathname === item.href)

export function CompanySidebar({ me }) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const logout = useCompanyLogout()
  const close = () => isMobile && setOpenMobile(false)

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/company" />} onClick={close}>
              <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2Icon />
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium">{me.organization.display_name ?? me.organization.legal_name}</span>
                <span className="truncate text-xs text-muted-foreground">Company Admin</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Company administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu data-testid="company-nav">
              {COMPANY_NAV.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton isActive={isCompanyNavActive(item, pathname)} render={<Link href={item.href} />} onClick={close}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={pathname === COMPANY_CHANGE_PASSWORD_PATH} render={<Link href={COMPANY_CHANGE_PASSWORD_PATH} />} onClick={close}>
                  <KeyRoundIcon />
                  <span>Change password</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => logout.mutate()} disabled={logout.isPending}>
                  <LogOutIcon />
                  <span>{logout.isPending ? "Signing out…" : "Sign out"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="grid px-2 py-1.5 text-xs leading-tight">
          <span className="truncate font-medium text-sidebar-foreground">{me.user.full_name}</span>
          <span className="truncate text-muted-foreground">
            {me.user.email}
            {me.user.admin_id && <span data-testid="admin-id"> · {me.user.admin_id}</span>}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
