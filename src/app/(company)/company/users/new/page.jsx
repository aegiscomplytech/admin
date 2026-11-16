"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { CompanyUserForm } from "@/components/company/company-user-form"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { useCreateCompanyUser } from "@/hooks/use-company-admin"
import { cn } from "@/lib/utils"

/** Company Admin: add a user to the company (the company is the admin's own, set by the server). */
export default function NewCompanyUserPage() {
  const router = useRouter()
  const mutation = useCreateCompanyUser()
  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-6">
      <Link href="/company/users" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-self-start")}>
        <ArrowLeftIcon />
        All users
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add user</CardTitle>
          <CardDescription>The user joins your company. Their role decides which of your modules and actions they get in the Aegis user app.</CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyUserForm
            mode="create"
            mutation={mutation}
            onCancel={() => router.push("/company/users")}
            onSaved={(response) => {
              toast.add({ type: "success", title: "User created", description: response.message })
              router.push(`/company/users/${response.data.id}`)
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
