"use client"

import Link from "next/link"
import { CircleCheckIcon, CircleXIcon, ClockIcon, UsersIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserStats } from "@/hooks/use-users"
import { cn } from "@/lib/utils"

const CARDS = [
  { key: "total", label: "Total Registered Users", icon: UsersIcon, href: "/users", tone: "text-foreground" },
  { key: "pending", label: "Pending Users", icon: ClockIcon, href: "/users/pending", tone: "text-amber-600 dark:text-amber-400" },
  { key: "approved", label: "Approved Users", icon: CircleCheckIcon, href: "/users?status=approved", tone: "text-emerald-600 dark:text-emerald-400" },
  { key: "rejected", label: "Rejected Users", icon: CircleXIcon, href: "/users?status=rejected", tone: "text-destructive" },
]

/** The four user statistics (dashboard + user management). Each card links to the matching list. */
export function UserStatsCards() {
  const { data, isPending, isError } = useUserStats()

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Registered users" data-testid="user-stats">
      {CARDS.map(({ key, label, icon: Icon, href, tone }) => (
        <Link key={key} href={href} className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <Card size="sm" className="h-full transition-colors hover:bg-muted/50">
            <CardContent className="grid gap-3">
              <div className="flex items-center justify-between gap-2 text-muted-foreground">
                <span className="text-xs font-medium">{label}</span>
                <Icon className={cn("size-4", tone)} aria-hidden="true" />
              </div>
              {isPending ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <div className="text-2xl leading-none font-semibold tabular-nums" data-stat={key}>
                  {isError ? "—" : data[key]}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </section>
  )
}
