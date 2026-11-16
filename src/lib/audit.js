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
  USER_REGISTERED: "User registered",
  USER_APPROVED: "User approved",
  USER_REJECTED: "User rejected",
  USER_DELETED: "User deleted",
  USER_PASSWORD_RESET: "User password reset",
  MODULE_DELETED: "Module deleted",
  COMPANY_MODULES_UPDATED: "Company modules changed",
  COMPANY_MENU_ACCESS_CHANGED: "Company page access changed",
  MENU_REGISTRY_SYNCED: "Routes synchronised",
  MENU_ACTIVATED: "Page enabled",
  MENU_DEACTIVATED: "Page disabled",
  ROLE_CREATED: "Role created",
  ROLE_UPDATED: "Role updated",
  ROLE_PERMISSIONS_UPDATED: "Role permissions changed",
  ROLE_DELETED: "Role deleted",
  USER_COMPANY_ASSIGNED: "User company / role changed",
  // Company Admin system
  MODULE_PERMISSIONS_UPDATED: "Module permissions changed",
  COMPANY_CREATED: "Company created",
  COMPANY_UPDATED: "Company details updated",
  COMPANY_ADMIN_CREATED: "Company Admin created",
  COMPANY_ADMIN_ACTIVATED: "Company Admin reactivated",
  COMPANY_ADMIN_DEACTIVATED: "Company Admin deactivated",
  COMPANY_USER_CREATED: "Company user created",
  COMPANY_USER_UPDATED: "Company user updated",
  COMPANY_USER_ACTIVATED: "Company user activated",
  COMPANY_USER_DEACTIVATED: "Company user deactivated",
  COMPANY_USER_INVITED: "Invitation sent",
  COMPANY_ROLE_CREATED: "Company role created",
  COMPANY_ROLE_UPDATED: "Company role updated",
  COMPANY_ROLE_DELETED: "Company role deleted",
  USER_INVITATION_ACCEPTED: "Invitation accepted",
}

const MODULE_LABELS = {
  ADMIN_AUTH: "Admin authentication",
  ORGANIZATIONS: "Company management",
  PLANS: "Plans",
  SUBSCRIPTIONS: "Subscriptions",
  MODULES: "Module catalog",
  MODULE_ACCESS: "Company module access",
  USER_MANAGEMENT: "User management",
  MENU_REGISTRY: "Menu & route registry",
  ROLES: "Roles & permissions",
  COMPANY_ADMINISTRATION: "Company administration",
}

/** Records without an admin were made by the company itself (registration, email verification). */
export const SELF_SERVICE_ACTOR = "Company (self-service)"

/** Who did a record without an admin: a registered user (user management) or a company. */
export function selfServiceActor(module) {
  if (module === "MENU_REGISTRY") return "Deployment (CI/CD)"
  if (module === "COMPANY_ADMINISTRATION") return "Company Admin"
  return module === "USER_MANAGEMENT" ? "User (self-service)" : SELF_SERVICE_ACTOR
}

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
