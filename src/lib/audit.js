// Display helpers for audit log values coming from the backend (e.g. "PASSWORD_CHANGED").

const ACTION_LABELS = {
  LOGIN: "Login",
  LOGOUT: "Logout",
  PASSWORD_CHANGED: "Password changed",
  COMPANY_REGISTERED: "Company registered",
  COMPANY_EMAIL_VERIFIED: "Email verified",
  COMPANY_APPROVED: "Company approved",
  COMPANY_REJECTED: "Company rejected",
  COMPANY_SUSPENDED: "Company suspended",
  COMPANY_REACTIVATED: "Company reactivated",
  COMPANY_DEACTIVATED: "Company deactivated",
  COMPANY_PASSWORD_CHANGED: "Company password changed",
  COMPANY_CREDENTIALS_RESET: "Company login reset",
  PLAN_CREATED: "Plan created",
  PLAN_UPDATED: "Plan updated",
  PLAN_ACTIVATED: "Plan activated",
  PLAN_DEACTIVATED: "Plan deactivated",
  SUBSCRIPTION_ASSIGNED: "Subscription assigned",
  SUBSCRIPTION_PLAN_CHANGED: "Subscription plan changed",
  SUBSCRIPTION_RENEWED: "Subscription renewed",
  SUBSCRIPTION_ACTIVATED: "Subscription activated",
  SUBSCRIPTION_SUSPENDED: "Subscription suspended",
  SUBSCRIPTION_CANCELLED: "Subscription cancelled",
  MODULE_CREATED: "Module created",
  MODULE_UPDATED: "Module updated",
  MODULE_ACTIVATED: "Module activated",
  MODULE_DEACTIVATED: "Module deactivated",
  PLAN_MODULES_UPDATED: "Plan modules changed",
  MODULE_ACCESS_GRANTED: "Module access granted",
  MODULE_ACCESS_REVOKED: "Module access revoked",
  MODULE_OVERRIDE_RESET: "Module override reset",
}

const MODULE_LABELS = {
  ADMIN_AUTH: "Admin authentication",
  ORGANIZATIONS: "Company management",
  PLANS: "Plans",
  SUBSCRIPTIONS: "Subscriptions",
  MODULES: "Module catalog",
  MODULE_ACCESS: "Company module access",
}

/** Records without an admin were made by the company itself (registration, email verification). */
export const SELF_SERVICE_ACTOR = "Company (self-service)"

/** "SOME_VALUE" -> "Some value", used for values added by later modules. */
function humanize(value = "") {
  const text = value.replace(/_/g, " ").toLowerCase()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatAuditAction(action) {
  return ACTION_LABELS[action] ?? humanize(action)
}

export function formatAuditModule(module) {
  return MODULE_LABELS[module] ?? humanize(module)
}
