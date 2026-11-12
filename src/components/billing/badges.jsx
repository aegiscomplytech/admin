import { Badge } from "@/components/ui/badge"
import { SUBSCRIPTION_STATUS_BADGE, SUBSCRIPTION_STATUS_LABELS } from "@/lib/billing"

export function PlanStatusBadge({ active }) {
  return active ? <Badge variant="secondary">Active</Badge> : <Badge variant="outline">Inactive</Badge>
}

export function SubscriptionStatusBadge({ status }) {
  return <Badge variant={SUBSCRIPTION_STATUS_BADGE[status] ?? "outline"}>{SUBSCRIPTION_STATUS_LABELS[status] ?? status}</Badge>
}
