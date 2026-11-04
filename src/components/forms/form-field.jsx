import { cn } from "@/lib/utils"

/** Label + input + error message, used by every form. */
export function FormField({ id, label, error, className, children }) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

/** Error banner for a failed request (shown above the form). */
export function FormAlert({ children }) {
  if (!children) return null

  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {children}
    </div>
  )
}
