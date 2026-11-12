import { Badge } from "@/components/ui/badge"
import { STATUS_BADGE, STATUS_LABELS } from "@/lib/organizations"

export function OrganizationStatusBadge({ status }) {
  return <Badge variant={STATUS_BADGE[status] ?? "outline"}>{STATUS_LABELS[status] ?? status}</Badge>
}

export function EmailVerifiedBadge({ verified }) {
  return verified ? (
    <Badge variant="secondary">Email verified</Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      Email not verified
    </Badge>
  )
}
