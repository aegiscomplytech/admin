import { Badge } from "@/components/ui/badge"
import { USER_STATUS_BADGE, USER_STATUS_LABELS } from "@/lib/users"

export function UserStatusBadge({ status }) {
  return (
    <Badge variant={USER_STATUS_BADGE[status] ?? "outline"} data-status={status}>
      {USER_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
