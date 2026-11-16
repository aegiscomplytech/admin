"use client"

import { UsersTable } from "@/components/users/users-table"

/** /users/pending — registration requests waiting for a decision. */
export default function PendingUsersPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6">
      <UsersTable
        title="Pending Requests"
        description="New registrations waiting for review. Approved users can log in; rejected users cannot."
        fixedStatus="pending"
      />
    </div>
  )
}
