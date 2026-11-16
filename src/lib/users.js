// Registered users (the frontend/ app): labels, colours and admin action texts.

export const USER_STATUSES = ["pending", "approved", "rejected"]

export const USER_STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
}

/** Badge variant per status (see components/ui/badge.jsx). */
export const USER_STATUS_BADGE = {
  pending: "outline",
  approved: "secondary",
  rejected: "destructive",
}

/** Short form of the UUID for tables (the full id is on the details page). */
export function shortUserId(id) {
  return id ? id.slice(0, 8).toUpperCase() : "—"
}

/** Confirmation dialog texts for each admin action. `reason`: "optional" | undefined. */
export const USER_ACTIONS = {
  approve: {
    label: "Approve",
    title: "Approve this user?",
    description: "The user will be able to log in and use their dashboard.",
    confirm: "Approve user",
    variant: "default",
    success: "User approved",
  },
  reject: {
    label: "Reject",
    title: "Reject this user?",
    description: "The user will not be able to log in. If they are logged in now, they are signed out.",
    confirm: "Reject user",
    variant: "destructive",
    reason: "optional",
    reasonLabel: "Reason (optional, kept in the activity log)",
    reasonPlaceholder: "The details could not be verified.",
    success: "User rejected",
  },
  delete: {
    label: "Delete",
    title: "Delete this user permanently?",
    description: "The account and its personal data are removed and cannot be restored. The activity log keeps a record of the deletion.",
    confirm: "Delete user",
    variant: "destructive",
    reason: "optional",
    reasonLabel: "Reason (optional, kept in the activity log)",
    reasonPlaceholder: "Duplicate account.",
    success: "User deleted",
  },
}
