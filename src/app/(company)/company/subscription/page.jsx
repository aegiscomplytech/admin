"use client"

import { CreditCardIcon, RefreshCwIcon } from "lucide-react"

import { CompanyErrorCard } from "@/components/company/company-dashboard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCompanySubscription } from "@/hooks/use-company-admin"
import { formatMoney } from "@/lib/billing"
import { cn, formatDateTime } from "@/lib/utils"

const INTERVALS = { monthly: "Monthly", quarterly: "Quarterly", yearly: "Yearly", one_time: "One-time" }

function Row({ label, children }) {
  return (
    <div className="grid gap-0.5 py-2 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{children ?? "—"}</dd>
    </div>
  )
}

/** Company Admin: the company's subscription, read-only (the platform manages it). */
export default function CompanySubscriptionPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useCompanySubscription()
  const current = data?.current

  return (
    <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6">
      <Card data-testid="company-subscription">
        <CardHeader>
          <CardTitle className="text-lg">Subscription</CardTitle>
          <CardDescription>Read-only. To change your plan or renew, contact the platform team.</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
              <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {isPending && <Skeleton className="h-40" />}
          {isError && <CompanyErrorCard title="Couldn't load your subscription" error={error} onRetry={() => refetch()} />}
          {data && !current && (
            <div className="grid justify-items-center gap-2 py-8 text-center text-sm text-muted-foreground">
              <CreditCardIcon className="size-6" />
              <p>Your company has no current subscription, so its modules are not available.</p>
            </div>
          )}
          {current && (
            <dl className="divide-y text-sm">
              <Row label="Plan">{current.plan.name}</Row>
              <Row label="Status">
                <Badge variant={current.valid_now ? "secondary" : "destructive"} data-testid="subscription-status">
                  {current.valid_now ? "Active" : current.status}
                </Badge>
              </Row>
              <Row label="Billing">{INTERVALS[current.plan.billing_interval] ?? current.plan.billing_interval}</Row>
              <Row label="Price">{formatMoney(current.price, current.currency)}</Row>
              <Row label="Start date">{formatDateTime(current.start_date)}</Row>
              <Row label="Expiry date">{current.end_date ? formatDateTime(current.end_date) : "No end date"}</Row>
              {current.days_left !== null && <Row label="Days left">{current.days_left}</Row>}
            </dl>
          )}
        </CardContent>
      </Card>

      {data && data.history.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.history.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.plan.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{s.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{formatDateTime(s.start_date)}</TableCell>
                      <TableCell className="text-xs">{s.end_date ? formatDateTime(s.end_date) : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
