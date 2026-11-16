import { Badge } from "@/components/ui/badge"

/** Active / Inactive (modules, pages, roles). */
export function StatusBadge({ active, activeLabel = "Active", inactiveLabel = "Inactive" }) {
  return active ? (
    <Badge variant="secondary">{activeLabel}</Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      {inactiveLabel}
    </Badge>
  )
}

const ACCESS = {
  active: ["Active", "secondary"],
  no_modules: ["No modules", "outline"],
  no_subscription: ["No valid subscription", "outline"],
  company_inactive: ["Company not active", "outline"],
}

/** A company's access status (Company Access list). */
export function AccessStatusBadge({ status }) {
  const [label, variant] = ACCESS[status] ?? [status, "outline"]
  return (
    <Badge variant={variant} className={variant === "outline" ? "text-muted-foreground" : undefined} data-access-status={status}>
      {label}
    </Badge>
  )
}

const SYNC = {
  success: ["Success", "secondary"],
  partial: ["Partial", "outline"],
  failed: ["Failed", "destructive"],
}

export function SyncStatusBadge({ status }) {
  const [label, variant] = SYNC[status] ?? [status, "outline"]
  return <Badge variant={variant}>{label}</Badge>
}

/** Where a registered route came from. */
export function SourceBadge({ source }) {
  return (
    <Badge variant="outline" className="text-muted-foreground">
      {source === "manifest" ? "Route manifest" : source === "seed" ? "Initial setup" : source}
    </Badge>
  )
}
