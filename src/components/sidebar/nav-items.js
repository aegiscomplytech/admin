import {
  BlocksIcon,
  Building2Icon,
  ClockIcon,
  CreditCardIcon,
  HistoryIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  PackageIcon,
  UserIcon,
} from "lucide-react"

/**
 * Admin navigation, in sidebar order. Also used by the header to show the page title.
 * `match` (optional) marks the item active for sub-pages, e.g. a company's details page.
 */
export const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon }],
  },
  {
    label: "Company Management",
    items: [
      {
        title: "Companies",
        href: "/organizations",
        icon: Building2Icon,
        match: (pathname) => pathname === "/organizations" || /^\/organizations\/(?!pending$)[^/]+(\/modules)?$/.test(pathname),
      },
      { title: "Pending Registrations", href: "/organizations/pending", icon: ClockIcon },
    ],
  },
  {
    label: "Plans & Modules",
    items: [
      { title: "Modules", href: "/modules", icon: BlocksIcon },
      { title: "Plans", href: "/plans", icon: PackageIcon, match: (pathname) => pathname === "/plans" || pathname.startsWith("/plans/") },
      {
        title: "Subscriptions",
        href: "/subscriptions",
        icon: CreditCardIcon,
        match: (pathname) => pathname === "/subscriptions" || pathname.startsWith("/subscriptions/"),
      },
    ],
  },
  {
    label: "Monitoring",
    items: [{ title: "Activity Logs", href: "/activity-logs", icon: HistoryIcon }],
  },
  {
    label: "Account",
    items: [
      { title: "Profile", href: "/profile", icon: UserIcon },
      { title: "Change Password", href: "/change-password", icon: KeyRoundIcon },
    ],
  },
]

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items)

export function isNavItemActive(item, pathname) {
  return item.match ? item.match(pathname) : pathname === item.href
}
