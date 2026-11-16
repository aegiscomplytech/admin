"use client"

import { useSearchParams } from "next/navigation"

import { UserStatsCards } from "@/components/users/user-stats-cards"
import { UsersTable } from "@/components/users/users-table"
import { USER_STATUSES } from "@/lib/users"

export function AllUsers() {
  const requested = useSearchParams().get("status")
  const initialStatus = USER_STATUSES.includes(requested) ? requested : ""

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6">
      <UserStatsCards />
      <UsersTable
        // A new ?status= (e.g. clicking another statistics card) starts a fresh filter
        key={initialStatus}
        title="Users"
        description="Everyone who registered in the user app, newest first. Approve, reject or delete accounts here."
        initialStatus={initialStatus}
      />
    </div>
  )
}
