// Labels and colours for company statuses, shared by the admin and company pages.

export const ORGANIZATION_STATUSES = ["pending", "approved", "rejected", "suspended", "deactivated"]

export const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
  deactivated: "Deactivated",
}

/** Badge variant per status (see components/ui/badge.jsx). */
export const STATUS_BADGE = {
  pending: "outline",
  approved: "secondary",
  rejected: "destructive",
  suspended: "destructive",
  deactivated: "outline",
}

export const REGISTRATION_STATUS_LABELS = {
  // The company confirms its email by signing in with the emailed Admin ID + temporary password
  pending_email_verification: "Waiting for first sign-in",
  pending_approval: "Waiting for approval",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
  deactivated: "Deactivated",
}

/** Confirmation dialog texts for each admin action. `reason`: "required" | "optional" | undefined. */
export const ORGANIZATION_ACTIONS = {
  approve: {
    label: "Approve",
    title: "Approve this company?",
    description: "The company will get access to the platform and its owner account will be activated.",
    confirm: "Approve company",
    variant: "default",
  },
  reject: {
    label: "Reject",
    title: "Reject this registration?",
    description: "The company will see that its registration was rejected, together with your reason. This cannot be undone; the company would have to register again.",
    confirm: "Reject registration",
    variant: "destructive",
    reason: "required",
    reasonLabel: "Reason (shown to the company)",
    reasonPlaceholder: "Registration information could not be verified.",
  },
  suspend: {
    label: "Suspend",
    title: "Suspend this company?",
    description: "All users of this company lose access to company features until it is reactivated.",
    confirm: "Suspend company",
    variant: "destructive",
    reason: "optional",
    reasonLabel: "Reason (optional, kept in the activity log)",
  },
  reactivate: {
    label: "Reactivate",
    title: "Reactivate this company?",
    description: "The company's users get access to company features again.",
    confirm: "Reactivate company",
    variant: "default",
    reason: "optional",
    reasonLabel: "Note (optional, kept in the activity log)",
  },
  deactivate: {
    label: "Deactivate",
    title: "Deactivate this company?",
    description: "The company account is closed and its users lose access. You can reactivate it later if needed.",
    confirm: "Deactivate company",
    variant: "destructive",
    reason: "optional",
    reasonLabel: "Reason (optional, kept in the activity log)",
  },
  reset_credentials: {
    label: "Reset login credentials",
    title: "Reset this company's login?",
    description:
      "A new temporary password is emailed to the company admin (you will not see it). The current password stops working, all of their sessions are signed out, and they must choose a new password at the next sign-in.",
    confirm: "Reset and email new password",
    variant: "outline",
    reason: "required",
    reasonLabel: "Reason (kept in the activity log)",
    reasonPlaceholder: "Company admin lost their password (requested by phone).",
  },
}
