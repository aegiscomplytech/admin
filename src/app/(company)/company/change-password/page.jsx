"use client"

import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRoundIcon, Loader2Icon } from "lucide-react"

import { FormAlert, FormField } from "@/components/forms/form-field"
import { PasswordInput } from "@/components/forms/password-input"
import { PasswordRules } from "@/components/forms/password-rules"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { useCompanyChangePassword, useCompanyMe } from "@/hooks/use-company"
import { COMPANY_HOME_PATH } from "@/lib/auth"
import { changePasswordSchema } from "@/lib/validations"

const EMPTY_FORM = { current_password: "", new_password: "", confirm_password: "" }

/**
 * Company admin password change. Required after signing in with a temporary password
 * (the company layout sends the user here, and the backend blocks everything else until it is done).
 */
export default function CompanyChangePasswordPage() {
  const router = useRouter()
  const { data: me } = useCompanyMe()
  const changePassword = useCompanyChangePassword()
  const temporary = Boolean(me?.user.must_change_password)

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(changePasswordSchema), defaultValues: EMPTY_FORM })
  const newPassword = useWatch({ control, name: "new_password" })

  const onSubmit = (values) =>
    changePassword.mutate(values, {
      onSuccess: () => {
        toast.add({
          type: "success",
          title: "Password changed",
          description: temporary ? "Your own password is set. Welcome to Aegis!" : "Other sessions were signed out.",
        })
        router.replace(COMPANY_HOME_PATH)
      },
      onError: (error) => {
        // Field errors from the backend (e.g. "Current password is incorrect") go next to the field
        error.errors?.forEach?.(({ field, message }) => {
          if (field in EMPTY_FORM) setError(field, { message }, { shouldFocus: true })
        })
      },
    })

  const bannerError = changePassword.error && !changePassword.error.errors ? changePassword.error.message : null

  return (
    <div className="mx-auto w-full max-w-lg">
      <Card>
        <CardHeader>
          <span className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <KeyRoundIcon className="size-5" />
          </span>
          <CardTitle className="text-lg">{temporary ? "Set your password" : "Change password"}</CardTitle>
          <CardDescription data-testid="password-change-reason">
            {temporary
              ? "You signed in with a temporary password. Choose your own password to continue."
              : "After changing your password, all your other sessions will be signed out."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
            <FormAlert>{bannerError}</FormAlert>

            <FormField
              id="current_password"
              label={temporary ? "Temporary password (from the email)" : "Current password"}
              error={errors.current_password?.message}
            >
              <PasswordInput
                id="current_password"
                autoComplete="current-password"
                aria-invalid={!!errors.current_password}
                aria-describedby={errors.current_password ? "current_password-error" : undefined}
                {...register("current_password")}
              />
            </FormField>

            <FormField id="new_password" label="New password" error={errors.new_password?.message}>
              <PasswordInput
                id="new_password"
                autoComplete="new-password"
                aria-invalid={!!errors.new_password}
                aria-describedby={errors.new_password ? "new_password-error" : undefined}
                {...register("new_password")}
              />
              <PasswordRules value={newPassword ?? ""} />
            </FormField>

            <FormField id="confirm_password" label="Confirm new password" error={errors.confirm_password?.message}>
              <PasswordInput
                id="confirm_password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirm_password}
                aria-describedby={errors.confirm_password ? "confirm_password-error" : undefined}
                {...register("confirm_password")}
              />
            </FormField>

            <Button type="submit" size="lg" className="w-full" disabled={changePassword.isPending}>
              {changePassword.isPending && <Loader2Icon className="animate-spin" />}
              {changePassword.isPending ? "Saving…" : temporary ? "Set password and continue" : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
