"use client"

import Link from "next/link"
import { KeyRoundIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCurrentAdmin } from "@/hooks/use-auth"
import { formatRole } from "@/lib/auth"
import { formatDateTime } from "@/lib/utils"

function ProfileRow({ label, children }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium break-all sm:col-span-2">{children}</dd>
    </div>
  )
}

export default function ProfilePage() {
  const { data: admin } = useCurrentAdmin()

  if (!admin) return null

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Profile</CardTitle>
          <CardDescription>Your Super Admin account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl>
            <ProfileRow label="Full name">{admin.full_name}</ProfileRow>
            <Separator />
            <ProfileRow label="Email">{admin.email}</ProfileRow>
            <Separator />
            <ProfileRow label="Role">{formatRole(admin.role)}</ProfileRow>
            <Separator />
            <ProfileRow label="Account status">
              <Badge variant={admin.is_active ? "secondary" : "destructive"}>
                {admin.is_active ? "Active" : "Inactive"}
              </Badge>
            </ProfileRow>
            <Separator />
            <ProfileRow label="Account created">{formatDateTime(admin.created_at)}</ProfileRow>
            <Separator />
            <ProfileRow label="Last login">{formatDateTime(admin.last_login_at)}</ProfileRow>
          </dl>
        </CardContent>
        <CardFooter>
          <Link href="/change-password" className={buttonVariants({ variant: "outline" })}>
            <KeyRoundIcon />
            Change password
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
