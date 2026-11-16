import { apiClient } from "@/lib/api-client"

// The logged-in admin's own notifications (backend: /api/v1/admin/notifications).
// The backend takes the recipient from the admin session; nothing here can choose it.
const BASE = "/v1/admin/notifications"

/** { items, unread_count, pagination } — newest first. */
export async function listNotifications({ page = 1, limit = 20 } = {}) {
  const search = new URLSearchParams({ page: String(page), limit: String(limit) })
  return (await apiClient(`${BASE}?${search}`)).data
}

/** The number on the bell. */
export async function getUnreadCount() {
  return (await apiClient(`${BASE}/unread-count`)).data.unread_count
}

/** { notification, unread_count } */
export async function markNotificationRead(id) {
  return (await apiClient(`${BASE}/${encodeURIComponent(id)}/read`, { method: "PATCH" })).data
}

/** { marked_read, unread_count } */
export async function markAllNotificationsRead() {
  return (await apiClient(`${BASE}/mark-all-read`, { method: "PATCH" })).data
}

/** { unread_count } */
export async function deleteNotification(id) {
  return (await apiClient(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" })).data
}
