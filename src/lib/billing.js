// Labels and helpers for plans and subscriptions (Module 4).

export const BILLING_INTERVALS = ["monthly", "quarterly", "yearly", "one_time"]

export const INTERVAL_LABELS = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  one_time: "One-time",
}

/** Same defaults as the backend (plans.service.ts) when a plan has no duration. */
export const DEFAULT_DURATION_DAYS = { monthly: 30, quarterly: 90, yearly: 365, one_time: null }

export const SUBSCRIPTION_STATUSES = ["active", "pending", "suspended", "expired", "cancelled"]

export const SUBSCRIPTION_STATUS_LABELS = {
  pending: "Scheduled",
  active: "Active",
  suspended: "Suspended",
  expired: "Expired",
  cancelled: "Cancelled",
}

export const SUBSCRIPTION_STATUS_BADGE = {
  pending: "outline",
  active: "secondary",
  suspended: "destructive",
  expired: "outline",
  cancelled: "destructive",
}

/** subscription_history.action -> readable label */
export const HISTORY_ACTION_LABELS = {
  ASSIGNED: "Assigned",
  PLAN_CHANGED: "Plan changed",
  PLAN_CHANGE_SCHEDULED: "Plan change scheduled",
  REPLACED: "Replaced by new plan",
  RENEWED: "Renewal",
  RENEWAL_CREATED: "Renewed",
  ACTIVATED: "Activated",
  SUSPENDED: "Suspended",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
  STARTED: "Started",
}

const formatters = new Map()

/** "9999.00", "INR" -> "₹9,999.00" */
export function formatMoney(amount, currency = "INR") {
  if (amount === null || amount === undefined || amount === "") return "—"
  if (!formatters.has(currency)) {
    try {
      formatters.set(currency, new Intl.NumberFormat("en-IN", { style: "currency", currency }))
    } catch {
      formatters.set(currency, { format: (n) => `${currency} ${n.toFixed(2)}` })
    }
  }
  return formatters.get(currency).format(Number(amount))
}

const dateFormat = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" })

/** Date only, e.g. "6 Nov 2026". */
export function formatDate(value, fallback = "—") {
  return value ? dateFormat.format(new Date(value)) : fallback
}

/** Days a new subscription to this plan lasts (null = no end date). */
export function planDurationDays(plan) {
  if (!plan) return null
  return plan.duration_days ?? DEFAULT_DURATION_DAYS[plan.billing_interval] ?? null
}

export function describeDuration(plan) {
  const days = planDurationDays(plan)
  return days === null ? "No end date" : `${days} day${days === 1 ? "" : "s"}`
}

// ---------- <input type="date"> helpers (dates are in the admin's own timezone) ----------

/** Date -> "YYYY-MM-DD" (local). */
export function toDateInput(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** "YYYY-MM-DD" -> ISO string at local 00:00 (a start date). */
export function startOfDayIso(value) {
  return new Date(`${value}T00:00:00`).toISOString()
}

/** "YYYY-MM-DD" -> ISO string at local 23:59:59.999 (an inclusive end date). */
export function endOfDayIso(value) {
  return new Date(`${value}T23:59:59.999`).toISOString()
}

/** Last day of a period that starts on `startValue` and lasts `days` days ("YYYY-MM-DD"). */
export function periodEndDate(startValue, days) {
  if (!startValue || !days) return ""
  const d = new Date(`${startValue}T00:00:00`)
  d.setDate(d.getDate() + days - 1)
  return toDateInput(d)
}

export const todayInput = () => toDateInput(new Date())
