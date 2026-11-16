"use client"

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import * as service from "@/services/notifications.service"

/** The bell checks for new notifications this often (only while the tab is visible). */
export const NOTIFICATION_POLL_MS = 15_000
const PAGE_SIZE = 20

const COUNT_KEY = ["notifications", "unread-count"]
const LIST_KEY = ["notifications", "list"]

/**
 * Unread count for the bell badge, refreshed every 15 seconds on every page.
 * When the number changes, the list is marked stale so the popup shows the new items.
 * `enabled: false` while nobody is logged in (no polling, no 401s).
 */
export function useUnreadNotificationCount({ enabled = true } = {}) {
  const queryClient = useQueryClient()
  return useQuery({
    enabled,
    queryKey: COUNT_KEY,
    queryFn: async () => {
      const previous = queryClient.getQueryData(COUNT_KEY)
      const count = await service.getUnreadCount()
      if (previous !== undefined && previous !== count) queryClient.invalidateQueries({ queryKey: LIST_KEY })
      return count
    },
    refetchInterval: NOTIFICATION_POLL_MS,
    staleTime: 0,
  })
}

/** The popup's list (pages of 20, newest first). Only fetched and refreshed while the popup is open. */
export function useNotificationList({ enabled = true } = {}) {
  const queryClient = useQueryClient()
  return useInfiniteQuery({
    queryKey: LIST_KEY,
    queryFn: async ({ pageParam }) => {
      const page = await service.listNotifications({ page: pageParam, limit: PAGE_SIZE })
      queryClient.setQueryData(COUNT_KEY, page.unread_count)
      return page
    },
    initialPageParam: 1,
    getNextPageParam: ({ pagination }) => (pagination.page < pagination.total_pages ? pagination.page + 1 : undefined),
    enabled,
    staleTime: 0,
    refetchInterval: enabled ? NOTIFICATION_POLL_MS : false,
  })
}

/** Changes every cached notification that matches, in every loaded page. */
function updateCachedItems(queryClient, change) {
  queryClient.setQueryData(LIST_KEY, (data) =>
    data ? { ...data, pages: data.pages.map((page) => ({ ...page, items: change(page.items) })) } : data
  )
}

/**
 * Read / mark-all-read / delete. The screen updates immediately (optimistic), the server answer
 * then sets the real unread count; on an error the list is simply reloaded.
 */
function useNotificationMutation(mutationFn, applyOptimistic, { reloadList = false } = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] })
      applyOptimistic(queryClient, variables)
    },
    onSuccess: (data) => {
      if (typeof data?.unread_count === "number") queryClient.setQueryData(COUNT_KEY, data.unread_count)
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    onSettled: () => (reloadList ? queryClient.invalidateQueries({ queryKey: LIST_KEY }) : undefined),
  })
}

export function useMarkNotificationRead() {
  return useNotificationMutation(service.markNotificationRead, (queryClient, id) => {
    let wasUnread = false
    updateCachedItems(queryClient, (items) =>
      items.map((item) => {
        if (item.id !== id || item.is_read) return item
        wasUnread = true
        return { ...item, is_read: true }
      })
    )
    if (wasUnread) queryClient.setQueryData(COUNT_KEY, (count) => Math.max(0, (count ?? 1) - 1))
  })
}

export function useMarkAllNotificationsRead() {
  return useNotificationMutation(service.markAllNotificationsRead, (queryClient) => {
    updateCachedItems(queryClient, (items) => items.map((item) => (item.is_read ? item : { ...item, is_read: true })))
    queryClient.setQueryData(COUNT_KEY, 0)
  })
}

/** Deleting reloads the list afterwards so the pages and "Load more" stay right. */
export function useDeleteNotification() {
  return useNotificationMutation(
    service.deleteNotification,
    (queryClient, id) => {
      let wasUnread = false
      updateCachedItems(queryClient, (items) =>
        items.filter((item) => {
          if (item.id === id) wasUnread = !item.is_read
          return item.id !== id
        })
      )
      if (wasUnread) queryClient.setQueryData(COUNT_KEY, (count) => Math.max(0, (count ?? 1) - 1))
    },
    { reloadList: true }
  )
}
