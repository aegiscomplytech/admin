"use client"

import Link from "next/link"
import { CalendarClockIcon, KeyRoundIcon, LogOutIcon, MailIcon, ShieldCheckIcon, UserIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentAdmin, useLogout } from "@/hooks/use-auth"
import { formatRole } from "@/lib/auth"
import { formatDateTime } from "@/lib/utils"

function InfoCard({ icon: Icon, label, children }) {
  return (
    <Card size="sm">
      <CardContent className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="truncate font-medium">{children}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  // The layout's auth guard only renders this page once the admin is loaded
  const { data: admin } = useCurrentAdmin()
  const logout = useLogout()

  if (!admin) return null

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Welcome back, {admin.full_name}</CardTitle>
          <CardDescription>You are signed in to the platform admin panel.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/profile" className={buttonVariants({ variant: "outline" })}>
            <UserIcon />
            View profile
          </Link>
          <Link href="/change-password" className={buttonVariants({ variant: "outline" })}>
            <KeyRoundIcon />
            Change password
          </Link>
          <Button variant="destructive" onClick={() => logout.mutate()} disabled={logout.isPending}>
            <LogOutIcon />
            {logout.isPending ? "Logging out…" : "Log out"}
          </Button>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Account information">
        <InfoCard icon={MailIcon} label="Email">
          {admin.email}
        </InfoCard>
        <InfoCard icon={ShieldCheckIcon} label="Role">
          {formatRole(admin.role)}
        </InfoCard>
        <InfoCard icon={UserIcon} label="Account status">
          <Badge variant={admin.is_active ? "secondary" : "destructive"}>
            {admin.is_active ? "Active" : "Inactive"}
          </Badge>
        </InfoCard>
        <InfoCard icon={CalendarClockIcon} label="Last login">
          {formatDateTime(admin.last_login_at, "First login")}
        </InfoCard>
      </section>
    </div>
  )
}
