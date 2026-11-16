"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { useAssignUserCompany, useCompanyAccessList, useRoles } from "@/hooks/use-access"

const selectClass = "h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm dark:bg-input/30"

/**
 * Which company a user of the company app works for, and their role there. The company decides the
 * modules; the role decides what the user may do in them. Saved on the server; the user's menu follows.
 */
export function CompanyAssignmentCard({ user }) {
  const companies = useCompanyAccessList({ page: 1, limit: 100, status: "approved" })
  const roles = useRoles()
  const assign = useAssignUserCompany()
  const [companyId, setCompanyId] = useState(user.company?.id ?? "")
  const [roleId, setRoleId] = useState(user.role?.id ?? "")

  const unchanged = companyId === (user.company?.id ?? "") && roleId === (user.role?.id ?? "")
  const options = companies.data?.items ?? []
  // Keep the current company in the list even if it is no longer approved
  const companyOptions = user.company && !options.some((c) => c.id === user.company.id) ? [{ id: user.company.id, legal_name: user.company.legal_name }, ...options] : options

  const save = () =>
    assign.mutate(
      { userId: user.id, companyId: companyId || null, roleId: companyId && roleId ? roleId : null },
      { onSuccess: (response) => toast.add({ type: "success", title: "Company access saved", description: response.message }) }
    )

  return (
    <Card data-testid="company-assignment">
      <CardHeader>
        <CardTitle>Company &amp; role</CardTitle>
        <CardDescription>The company this user works for in the company app, and what their role allows there.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground">Now:</span>
          {user.company ? (
            <Link href={`/company-access/${user.company.id}`} className="font-medium underline-offset-4 hover:underline">
              {user.company.legal_name}
            </Link>
          ) : (
            <span className="font-medium">No company</span>
          )}
          {user.role ? <Badge variant={user.role.is_active ? "secondary" : "outline"}>{user.role.name}</Badge> : user.company && <Badge variant="outline">No role</Badge>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-muted-foreground">Company</span>
            <select
              className={selectClass}
              value={companyId}
              onChange={(e) => {
                setCompanyId(e.target.value)
                if (!e.target.value) setRoleId("")
              }}
              disabled={companies.isPending || assign.isPending}
              aria-label="Company"
            >
              <option value="">No company</option>
              {companyOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.legal_name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-muted-foreground">Role</span>
            <select className={selectClass} value={roleId} onChange={(e) => setRoleId(e.target.value)} disabled={!companyId || roles.isPending || assign.isPending} aria-label="Role">
              <option value="">No role (sees no module pages)</option>
              {(roles.data ?? [])
                .filter((r) => r.is_active || r.id === user.role?.id)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.role_name}
                  </option>
                ))}
            </select>
          </label>
        </div>
        {user.status !== "approved" && <p className="text-xs text-muted-foreground">This user can only use the company app once approved.</p>}
        {assign.error && (
          <p role="alert" className="text-destructive">
            {assign.error.message}
          </p>
        )}
        <div>
          <Button onClick={save} disabled={unchanged || assign.isPending} data-testid="save-company-assignment">
            {assign.isPending && <Loader2Icon className="animate-spin" />}
            Save company &amp; role
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
