export { cn } from "cn"

const dateTimeFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
})

/** Formats an ISO date string for display, or returns the fallback if empty. */
export function formatDateTime(value, fallback = "—") {
  return value ? dateTimeFormat.format(new Date(value)) : fallback
}
