"use client"

import { useRouter } from "next/navigation"
import {
  BellIcon,
  BellOffIcon,
  Building2Icon,
  CalendarX2Icon,
  CheckCheckIcon,
  Loader2Icon,
  MailWarningIcon,
  Trash2Icon,
  UserPenIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationList,
} from "@/hooks/use-notifications"
import { formatDateTime } from "@/lib/utils"
import { cn } from "cn"

const TYPE_ICONS = {
  USER_REGISTERED: UserPlusIcon,
  USER_PROFILE_UPDATED: UserPenIcon,
  COMPANY_REGISTERED: Building2Icon,
  SUBSCRIPTIONS_EXPIRED: CalendarX2Icon,
  APPROVAL_EMAIL_FAILED: MailWarningIcon,
}

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

/** "just now", "5 minutes ago", "yesterday"… (the exact date and time is shown next to it). */
export function timeAgo(value) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000)
  if (Math.abs(seconds) < 60) return "just now"
  const minutes = Math.round(seconds / 60)
  if (Math.abs(minutes) < 60) return relativeTime.format(minutes, "minute")
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return relativeTime.format(hours, "hour")
  const days = Math.round(hours / 24)
  if (Math.abs(days) < 7) return relativeTime.format(days, "day")
  return null
}

/** Only paths inside this app are followed ("/users/pending"); never another website. */
function isInternalPath(url) {
  return typeof url === "string" && url.startsWith("/") && !url.startsWith("//")
}

function NotificationItem({ notification, onOpen, onDelete, deleting }) {
  const Icon = TYPE_ICONS[notification.type] ?? BellIcon
  const ago = timeAgo(notification.created_at)
  const unread = !notification.is_read

  return (
    <li
      className={cn(
        "group/notification relative flex items-start gap-1 border-b transition-colors last:border-b-0",
        unread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/60",
        deleting && "opacity-50"
      )}
      data-notification-id={notification.id}
      data-unread={unread ? "true" : "false"}
    >
      <button
        type="button"
        onClick={() => onOpen(notification)}
        className="flex min-w-0 flex-1 items-start gap-3 py-3 pr-1 pl-4 text-left outline-none focus-visible:bg-muted"
      >
        <span
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
            unread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}
          aria-hidden
        >
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className={cn("truncate text-sm", unread ? "font-semibold" : "font-medium")} data-slot="notification-title">
              {notification.title}
            </span>
            {unread && (
              <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" data-slot="unread-dot" />
            )}
          </span>
          <span className="mt-0.5 line-clamp-3 block text-xs leading-relaxed text-muted-foreground" data-slot="notification-message">
            {notification.message}
          </span>
          <time
            dateTime={notification.created_at}
            className="mt-1 block text-[11px] text-muted-foreground/80"
            data-slot="notification-time"
          >
            {ago ? `${ago} · ` : ""}
            {formatDateTime(notification.created_at)}
          </time>
        </span>
      </button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="mt-2 mr-2 text-muted-foreground opacity-100 hover:text-destructive sm:opacity-0 sm:group-hover/notification:opacity-100 sm:focus-visible:opacity-100"
        aria-label={`Delete notification: ${notification.title}`}
        disabled={deleting}
        onClick={() => onDelete(notification.id)}
      >
        <Trash2Icon />
      </Button>
    </li>
  )
}

/**
 * The popup content: header (title, unread count, "Mark all as read", close), then the list.
 * Clicking a notification marks it as read and opens the page it is about.
 */
export function NotificationPopup({ unreadCount, onClose }) {
  const router = useRouter()
  const list = useNotificationList()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()
  const remove = useDeleteNotification()

  const items = list.data?.pages.flatMap((page) => page.items) ?? []

  function open(notification) {
    if (!notification.is_read) markRead.mutate(notification.id)
    onClose()
    if (isInternalPath(notification.redirect_url)) router.push(notification.redirect_url)
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      data-testid="notification-popup"
      data-fetching={list.isFetching ? "true" : "false"}
    >
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold">
            Notifications
            {/* Cached items are shown at once; this spins while the newest ones are being fetched */}
            {list.isFetching && !list.isPending && (
              <Loader2Icon className="size-3 animate-spin text-muted-foreground" aria-label="Refreshing notifications" />
            )}
          </h2>
          <p className="text-xs text-muted-foreground" data-testid="notification-unread-summary">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={unreadCount === 0 || markAll.isPending}
          onClick={() => markAll.mutate()}
          data-testid="notification-mark-all"
        >
          <CheckCheckIcon />
          Mark all as read
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Close notifications" onClick={onClose}>
          <XIcon />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {list.isPending ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground" role="status">
            <Loader2Icon className="size-4 animate-spin" aria-hidden />
            Loading notifications…
          </div>
        ) : list.isError && items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center text-sm text-muted-foreground">
            <span>{list.error?.message ?? "Notifications could not be loaded."}</span>
            <Button variant="outline" size="sm" onClick={() => list.refetch()}>
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center" data-testid="notification-empty">
            <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <BellOffIcon className="size-5" aria-hidden />
            </span>
            <p className="text-sm font-medium">No notifications available</p>
            <p className="text-xs text-muted-foreground">New registrations and system events will appear here.</p>
          </div>
        ) : (
          <>
            <ul aria-label="Notifications">
              {items.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onOpen={open}
                  onDelete={(id) => remove.mutate(id)}
                  deleting={remove.isPending && remove.variables === notification.id}
                />
              ))}
            </ul>
            {list.hasNextPage && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  disabled={list.isFetchingNextPage}
                  onClick={() => list.fetchNextPage()}
                >
                  {list.isFetchingNextPage && <Loader2Icon className="animate-spin" />}
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
