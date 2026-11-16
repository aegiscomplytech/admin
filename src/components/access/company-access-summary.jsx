import { AlertTriangleIcon } from "lucide-react"

import { SubscriptionStatusBadge } from "@/components/billing/badges"
import { OrganizationStatusBadge } from "@/components/organizations/status-badge"
import { formatDate } from "@/lib/billing"
import { formatDateTime } from "@/lib/utils"

function Item({ label, children }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium break-words">{children ?? "—"}</dd>
    </div>
  )
}

/** Company, subscription and access figures at the top of the access page. */
export function CompanyAccessSummary({ data }) {
  const { company, subscription, summary, last_modified: lastModified } = data
  const usable = company.status === "approved" && subscription?.is_valid
  return (
    <div className="grid gap-4">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="company-access-summary">
        <Item label="Company status">
          <OrganizationStatusBadge status={company.status} />
        </Item>
        <Item label="Subscription">
          {subscription ? (
            <span className="flex flex-wrap items-center gap-1.5">
              {subscription.plan.name}
              <SubscriptionStatusBadge status={subscription.is_valid ? "active" : subscription.status === "active" ? "expired" : subscription.status} />
              {subscription.end_date && <span className="text-xs font-normal text-muted-foreground">until {formatDate(subscription.end_date)}</span>}
            </span>
          ) : (
            "No subscription"
          )}
        </Item>
        <Item label="Modules">
          <span data-testid="summary-assigned">{summary.assigned}</span> assigned · {summary.accessible} usable now · {summary.total} in catalog
        </Item>
        <Item label="Users in the company app">{company.users}</Item>
        <Item label="Business email">{company.business_email}</Item>
        <Item label="Hidden pages">{summary.restricted_pages}</Item>
        <Item label="Last modified">{lastModified ? formatDateTime(lastModified.at) : "Never"}</Item>
        <Item label="Last modified by">{lastModified?.by ? `${lastModified.by.full_name}` : "—"}</Item>
      </dl>
      {!usable && (
        <p role="status" className="flex items-start gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground" data-testid="access-warning">
          <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {company.status !== "approved"
            ? "This company is not approved/active: it cannot use any module until it is. You can still prepare its modules."
            : "This company has no valid subscription: it cannot use any module until a subscription is active. You can still prepare its modules."}
        </p>
      )}
    </div>
  )
}
