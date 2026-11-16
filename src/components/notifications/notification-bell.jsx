"use client"

import { useState } from "react"
import { Popover } from "@base-ui/react/popover"
import { BellIcon } from "lucide-react"

import { NotificationPopup } from "@/components/notifications/notification-popup"
import { Button } from "@/components/ui/button"
import { useCurrentAdmin } from "@/hooks/use-auth"
import { useUnreadNotificationCount } from "@/hooks/use-notifications"

/**
 * Bell in the top bar of every admin page (it lives in the shared AppHeader).
 * The badge shows the unread count (hidden at 0) and refreshes every 15 seconds; clicking opens the
 * popup, which closes on outside click, Escape, the close button, or when a notification is opened.
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false)
  // Only poll while someone is logged in. Next.js keeps visited pages mounted (hidden) after
  // logout, so without this a hidden header would keep asking and get 401s.
  const { data: me } = useCurrentAdmin()
  const { data: unreadCount = 0 } = useUnreadNotificationCount({ enabled: Boolean(me) })
  if (!me) return null

  const label = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        render={<Button variant="ghost" size="icon" className="relative" aria-label={label} data-testid="notification-bell" />}
      >
        <BellIcon className={unreadCount > 0 ? "text-foreground" : "text-muted-foreground"} />
        {unreadCount > 0 && (
          <span
            key={unreadCount}
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-white ring-2 ring-background duration-200 animate-in zoom-in-50"
            aria-hidden
            data-testid="notification-badge"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={8} collisionPadding={8} className="isolate z-50 outline-none">
          <Popover.Popup
            aria-label="Notifications"
            className="flex max-h-[min(34rem,var(--available-height))] w-[min(24rem,calc(100vw-1rem))] origin-(--transform-origin) flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-150 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-open:slide-in-from-top-2 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          >
            <NotificationPopup unreadCount={unreadCount} onClose={() => setOpen(false)} />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
