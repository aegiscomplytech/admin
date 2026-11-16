import { Badge } from "@/components/ui/badge"

const ACCOUNT_STATUS = {
  active: { label: "Active", variant: "secondary" },
  invited: { label: "Invited", variant: "outline" },
  inactive: { label: "Inactive", variant: "destructive" },
  awaiting_platform_approval: { label: "Awaiting approval", variant: "outline" },
  rejected: { label: "Rejected", variant: "destructive" },
}

/** A company user's account status (from the API's account_status). */
export function AccountStatusBadge({ status }) {
  const config = ACCOUNT_STATUS[status] ?? { label: status, variant: "outline" }
  return (
    <Badge variant={config.variant} data-status={status}>
      {config.label}
    </Badge>
  )
}

/** Built-in (platform) role or a custom role of this company. */
export function RoleKindBadge({ builtIn }) {
  return <Badge variant="outline">{builtIn ? "Built-in" : "Custom"}</Badge>
}

/** view -> View, … (falls back to the key). */
export const PERMISSION_LABELS = { view: "View", create: "Create", edit: "Edit", delete: "Delete", export: "Export", approve: "Approve" }
