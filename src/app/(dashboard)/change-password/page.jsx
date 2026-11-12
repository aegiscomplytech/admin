"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"

import { FormAlert, FormField } from "@/components/forms/form-field"
import { PasswordInput } from "@/components/forms/password-input"
import { PasswordRules } from "@/components/forms/password-rules"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { useChangePassword } from "@/hooks/use-auth"
import { changePasswordSchema } from "@/lib/validations"

const EMPTY_FORM = { current_password: "", new_password: "", confirm_password: "" }

export default function ChangePasswordPage() {
  const changePassword = useChangePassword()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY_FORM,
  })
  const newPassword = useWatch({ control, name: "new_password" })

  const onSubmit = (values) =>
    changePassword.mutate(values, {
      onSuccess: (response) => {
        reset(EMPTY_FORM)
        toast.add({ type: "success", title: "Password changed", description: response.message })
      },
      onError: (error) => {
        // Show field errors from the backend (e.g. "Current password is incorrect") next to the field
        error.errors?.forEach(({ field, message }) => {
          if (field in EMPTY_FORM) setError(field, { message })
        })
      },
    })

  // Field errors are shown on the fields; other errors (rate limit, server) in the banner
  const bannerError = changePassword.error && !changePassword.error.errors ? changePassword.error.message : null

  return (
    <div className="mx-auto w-full max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Change Password</CardTitle>
          <CardDescription>
            After changing your password, all your other sessions will be logged out.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
            <FormAlert>{bannerError}</FormAlert>

            <FormField id="current_password" label="Current password" error={errors.current_password?.message}>
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

            <Button type="submit" size="lg" className="w-full sm:w-auto sm:justify-self-end" disabled={changePassword.isPending}>
              {changePassword.isPending && <Loader2Icon className="animate-spin" />}
              {changePassword.isPending ? "Updating…" : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
