"use client"

import { useState } from "react"
import { Loader2Icon } from "lucide-react"

import { FormAlert } from "@/components/forms/form-field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast"
import { useOrganizationAction } from "@/hooks/use-organizations"
import { ORGANIZATION_ACTIONS } from "@/lib/organizations"
import { cn } from "@/lib/utils"

const REASON_MIN = 5
const REASON_MAX = 1000

/**
 * Confirmation dialog for approve / reject / suspend / reactivate / deactivate.
 * `action`: key of ORGANIZATION_ACTIONS, or null when closed. Calls `onClose` when done or cancelled.
 */
export function OrganizationActionDialog({ organization, action, onClose }) {
  const config = action ? ORGANIZATION_ACTIONS[action] : null
  const mutation = useOrganizationAction()
  const [reason, setReason] = useState("")
  const [reasonError, setReasonError] = useState(null)

  const close = () => {
    if (mutation.isPending) return
    setReason("")
    setReasonError(null)
    mutation.reset()
    onClose()
  }

  const submit = (event) => {
    event.preventDefault()
    const trimmed = reason.trim()
    if (config.reason === "required" && trimmed.length < REASON_MIN) {
      setReasonError(`Please give a reason of at least ${REASON_MIN} characters.`)
      return
    }
    mutation.mutate(
      { id: organization.id, action, reason: trimmed || undefined },
      {
        onSuccess: (response) => {
          toast.add({ type: "success", title: response.message, description: organization.legal_name })
          setReason("")
          onClose()
        },
        onError: (error) => {
          const fieldMessage = error.errors?.find?.((e) => e.field === "reason")?.message
          if (fieldMessage) setReasonError(fieldMessage)
        },
      }
    )
  }

  const bannerError = mutation.error && !mutation.error.errors ? mutation.error.message : null

  return (
    <Dialog open={Boolean(config)} onOpenChange={(open) => !open && close()}>
      {config && (
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submit} className="grid gap-4" noValidate>
            <DialogHeader>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogDescription>
                <span className="font-medium text-foreground">{organization.legal_name}</span>
                <br />
                {config.description}
              </DialogDescription>
            </DialogHeader>

            <FormAlert>{bannerError}</FormAlert>

            {config.reason && (
              <div className="grid gap-1.5">
                <label htmlFor="action-reason" className="text-sm font-medium">
                  {config.reasonLabel}
                </label>
                <textarea
                  id="action-reason"
                  rows={3}
                  maxLength={REASON_MAX}
                  value={reason}
                  placeholder={config.reasonPlaceholder}
                  onChange={(event) => {
                    setReason(event.target.value)
                    setReasonError(null)
                  }}
                  aria-invalid={Boolean(reasonError)}
                  aria-describedby={reasonError ? "action-reason-error" : undefined}
                  className={cn(
                    "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
                    reasonError && "border-destructive ring-3 ring-destructive/20"
                  )}
                />
                {reasonError && (
                  <p id="action-reason-error" role="alert" className="text-xs text-destructive">
                    {reasonError}
                  </p>
                )}
              </div>
            )}

            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" disabled={mutation.isPending} />}>
                Cancel
              </DialogClose>
              <Button type="submit" variant={config.variant} disabled={mutation.isPending}>
                {mutation.isPending && <Loader2Icon className="animate-spin" />}
                {config.confirm}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  )
}
