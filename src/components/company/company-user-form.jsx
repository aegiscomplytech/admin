"use client"

import { useId, useState } from "react"
import { Loader2Icon } from "lucide-react"

import { FormAlert, FormField } from "@/components/forms/form-field"
import { PasswordInput } from "@/components/forms/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCompanyRoles } from "@/hooks/use-company-admin"

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 dark:bg-input/30"

const FIELDS = ["full_name", "email", "mobile", "department", "designation", "roleId", "isActive", "onboarding", "password", "confirm_password"]

function initialValues(user) {
  return {
    full_name: user?.full_name ?? "",
    email: user?.email ?? "",
    mobile: user?.mobile ?? "",
    department: user?.department ?? "",
    designation: user?.designation ?? "",
    roleId: user?.role?.id ?? "",
    isActive: user ? (user.is_active ? "active" : "inactive") : "active",
    onboarding: "invitation",
    password: "",
    confirm_password: "",
  }
}

/**
 * Create / edit a company user. The roles offered are this company's roles (built-in + custom) from the server,
 * which checks the role again on save. Create: invitation email or a password set by the admin.
 * Edit: only the fields that changed are sent (the email cannot change).
 */
export function CompanyUserForm({ mode, user, mutation, onSaved, onCancel }) {
  const prefix = useId()
  const roles = useCompanyRoles()
  const [initial] = useState(() => initialValues(user))
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const fid = (name) => `${prefix}-${name}`
  const set = (key) => (event) => {
    setValues((v) => ({ ...v, [key]: event.target.value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const changed = Object.keys(values).filter((key) => values[key] !== initial[key])
  const submit = (event) => {
    event.preventDefault()
    const v = { ...values, full_name: values.full_name.trim(), email: values.email.trim(), mobile: values.mobile.trim() }
    let body
    if (mode === "create") {
      body = {
        full_name: v.full_name,
        email: v.email,
        mobile: v.mobile,
        department: v.department.trim() || null,
        designation: v.designation.trim() || null,
        roleId: v.roleId || null,
        isActive: v.isActive === "active",
        onboarding: v.onboarding,
        ...(v.onboarding === "password" && { password: v.password, confirm_password: v.confirm_password }),
      }
    } else {
      const map = { full_name: v.full_name, mobile: v.mobile, department: v.department.trim() || null, designation: v.designation.trim() || null, roleId: v.roleId || null, isActive: v.isActive === "active" }
      body = Object.fromEntries(Object.entries(map).filter(([key]) => changed.includes(key)))
    }
    mutation.mutate(body, {
      onSuccess: onSaved,
      onError: (error) => setErrors(Object.fromEntries((error.errors ?? []).filter((e) => FIELDS.includes(e.field)).map((e) => [e.field, e.message]))),
    })
  }

  const bannerError = mutation.error && !Object.values(errors).some(Boolean) ? mutation.error.message : null
  const roleOptions = roles.data?.filter((role) => role.is_active) ?? []
  const builtIn = roleOptions.filter((role) => role.is_builtin)
  const custom = roleOptions.filter((role) => !role.is_builtin)
  const text = (name, label, props = {}) => (
    <FormField id={fid(name)} label={label} error={errors[name]}>
      <Input id={fid(name)} value={values[name]} onChange={set(name)} aria-invalid={!!errors[name]} {...props} />
    </FormField>
  )

  return (
    <form onSubmit={submit} noValidate className="grid gap-4" data-testid="company-user-form">
      <FormAlert>{bannerError}</FormAlert>
      <div className="grid gap-4 sm:grid-cols-2">
        {text("full_name", "Full name", { autoComplete: "off" })}
        {text("email", "Email", { type: "email", autoComplete: "off", disabled: mode === "edit", title: mode === "edit" ? "The email cannot be changed" : undefined })}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {text("mobile", "Phone number", { type: "tel", placeholder: "+91 98765 43210", autoComplete: "off" })}
        {text("department", "Department (optional)", { placeholder: "Human Resources" })}
        {text("designation", "Designation (optional)", { placeholder: "HR Executive" })}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id={fid("roleId")} label="Assigned role" error={errors.roleId}>
          <select id={fid("roleId")} className={selectClass} value={values.roleId} onChange={set("roleId")} aria-invalid={!!errors.roleId} disabled={roles.isPending}>
            <option value="">No role (no module access)</option>
            {custom.length > 0 && (
              <optgroup label="Your roles">
                {custom.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label="Built-in roles">
              {builtIn.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </optgroup>
          </select>
        </FormField>
        <FormField id={fid("isActive")} label="Account status" error={errors.isActive}>
          <select id={fid("isActive")} className={selectClass} value={values.isActive} onChange={set("isActive")}>
            <option value="active">Active: can sign in</option>
            <option value="inactive">Inactive: cannot sign in</option>
          </select>
        </FormField>
      </div>

      {mode === "create" && (
        <fieldset className="grid gap-3 rounded-lg border p-3">
          <legend className="px-1 text-sm font-medium">How does the user get their password?</legend>
          <label className="flex items-start gap-2 text-sm">
            <input type="radio" name={fid("onboarding")} value="invitation" checked={values.onboarding === "invitation"} onChange={set("onboarding")} className="mt-0.5 size-4 accent-primary" />
            <span>
              <span className="font-medium">Send an invitation email</span>
              <span className="block text-xs text-muted-foreground">They get a one-time link to choose their own password.</span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="radio" name={fid("onboarding")} value="password" checked={values.onboarding === "password"} onChange={set("onboarding")} className="mt-0.5 size-4 accent-primary" />
            <span>
              <span className="font-medium">Set a password now</span>
              <span className="block text-xs text-muted-foreground">You share it with them; they can change it later with &quot;Forgot password&quot;.</span>
            </span>
          </label>
          {values.onboarding === "password" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id={fid("password")} label="Password" error={errors.password}>
                <PasswordInput id={fid("password")} value={values.password} onChange={set("password")} autoComplete="new-password" aria-invalid={!!errors.password} />
              </FormField>
              <FormField id={fid("confirm_password")} label="Confirm password" error={errors.confirm_password}>
                <PasswordInput id={fid("confirm_password")} value={values.confirm_password} onChange={set("confirm_password")} autoComplete="new-password" aria-invalid={!!errors.confirm_password} />
              </FormField>
            </div>
          )}
        </fieldset>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={mutation.isPending || (mode === "edit" && changed.length === 0)}>
          {mutation.isPending && <Loader2Icon className="animate-spin" />}
          {mode === "create" ? (values.onboarding === "invitation" ? "Create and send invitation" : "Create user") : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
