"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { RoleEditor } from "@/components/company/role-editor"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { useCreateCompanyRole } from "@/hooks/use-company-admin"
import { cn } from "@/lib/utils"

/** Company Admin: create a custom role from the purchased modules' permissions. */
export default function NewCompanyRolePage() {
  const router = useRouter()
  const mutation = useCreateCompanyRole()
  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6">
      <Link href="/company/roles" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-self-start")}>
        <ArrowLeftIcon />
        All roles
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create role</CardTitle>
          <CardDescription>Pick any combination of permissions from your company&apos;s modules. You give the role to users afterwards.</CardDescription>
        </CardHeader>
        <CardContent>
          <RoleEditor
            mode="create"
            mutation={mutation}
            onCancel={() => router.push("/company/roles")}
            onSaved={(response) => {
              toast.add({ type: "success", title: response.message, description: response.data.name })
              router.push(`/company/roles/${response.data.id}`)
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
