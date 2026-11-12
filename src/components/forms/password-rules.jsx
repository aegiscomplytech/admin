import { CheckIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { PASSWORD_RULES } from "@/lib/validations"

/** Live checklist of the password rules, shown under a "New password" field. */
export function PasswordRules({ value }) {
  return (
    <ul className="grid gap-1 text-xs" aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(value)
        return (
          <li
            key={rule.label}
            className={cn("flex items-center gap-1.5", passed ? "text-foreground" : "text-muted-foreground")}
          >
            {passed ? <CheckIcon className="size-3.5" /> : <CircleIcon className="size-3" />}
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}
