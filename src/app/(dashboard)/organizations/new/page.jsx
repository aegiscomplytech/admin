"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { CompanyForm } from "@/components/organizations/company-form"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { useCreateCompany } from "@/hooks/use-organizations"
import { cn } from "@/lib/utils"

/** Super Admin: create a company (active at once). Next steps happen on the company's page. */
export default function NewCompanyPage() {
  const router = useRouter()
  const mutation = useCreateCompany()

  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-6">
      <Link href="/organizations" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-self-start")}>
        <ArrowLeftIcon />
        All companies
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create company</CardTitle>
          <CardDescription>
            The company is active at once. Next, on its page: choose its modules, assign a subscription and create its Company Admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyForm
            mode="create"
            mutation={mutation}
            onCancel={() => router.push("/organizations")}
            onSaved={(response) => {
              toast.add({ type: "success", title: response.message, description: response.data.legal_name })
              router.push(`/organizations/${response.data.id}`)
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
