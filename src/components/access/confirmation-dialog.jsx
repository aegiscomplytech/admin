"use client"

import { Loader2Icon } from "lucide-react"

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

/**
 * Asks before doing something (removing access, disabling a page, deleting). Stays open while
 * `pending`, and shows `error` from the server.
 */
export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "default",
  pending = false,
  error,
  onConfirm,
  onClose,
  children,
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && !pending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription render={<div />}>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={pending} />}>Cancel</DialogClose>
          <Button variant={variant} disabled={pending} onClick={onConfirm} data-testid="confirm-button">
            {pending && <Loader2Icon className="animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
