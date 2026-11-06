import { KeyRoundIcon, LayoutDashboardIcon, UserIcon } from "lucide-react"

/** Admin navigation. Also used by the header to show the page title. */
export const NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Profile", href: "/profile", icon: UserIcon },
  { title: "Change Password", href: "/change-password", icon: KeyRoundIcon },
]
