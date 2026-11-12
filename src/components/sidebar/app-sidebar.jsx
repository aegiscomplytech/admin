"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronsUpDownIcon, KeyRoundIcon, LogOutIcon, ShieldCheckIcon, UserIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { NAV_GROUPS, isNavItemActive } from "@/components/sidebar/nav-items"
import { useCurrentAdmin, useLogout } from "@/hooks/use-auth"
import { formatRole } from "@/lib/auth"

function getInitials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("")
}

function UserMenu() {
  const { data: admin } = useCurrentAdmin()
  const logout = useLogout()
  const { isMobile } = useSidebar()

  if (!admin) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-xs font-medium text-sidebar-primary-foreground">
          {getInitials(admin.full_name)}
        </span>
        <span className="grid flex-1 text-left leading-tight">
          <span className="truncate font-medium">{admin.full_name}</span>
          <span className="truncate text-xs text-muted-foreground">{admin.email}</span>
        </span>
        <ChevronsUpDownIcon className="ml-auto" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side={isMobile ? "bottom" : "right"} align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{formatRole(admin.role)}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/profile" />}>
          <UserIcon />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/change-password" />}>
          <KeyRoundIcon />
          Change Password
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          <LogOutIcon />
          {logout.isPending ? "Logging out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const logout = useLogout()

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <ShieldCheckIcon />
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium">Admin Panel</span>
                <span className="truncate text-xs text-muted-foreground">Super Admin</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group, index) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isNavItemActive(item, pathname)}
                      render={<Link href={item.href} />}
                      // Close the slide-out menu after picking a page on phones
                      onClick={() => isMobile && setOpenMobile(false)}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {index === NAV_GROUPS.length - 1 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => logout.mutate()} disabled={logout.isPending}>
                      <LogOutIcon />
                      <span>{logout.isPending ? "Logging out…" : "Logout"}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
