import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").pipe(z.email("Enter a valid email address")),
  password: z.string().min(1, "Password is required"),
});

/** @typedef {z.infer<typeof loginSchema>} LoginInput */

/** Same rules as the backend (backend/src/security/password.service.ts). */
export const PASSWORD_RULES = [
  { label: "At least 12 characters", test: (value) => value.length >= 12 },
  { label: "One lowercase letter", test: (value) => /[a-z]/.test(value) },
  { label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { label: "One number", test: (value) => /[0-9]/.test(value) },
  { label: "One special character", test: (value) => /[^A-Za-z0-9]/.test(value) },
];

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .max(128, "Password must be at most 128 characters")
      .refine((value) => PASSWORD_RULES.every((rule) => rule.test(value)), {
        message: "Password does not meet all the requirements",
      }),
    confirm_password: z.string().min(1, "Please confirm the new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  })
  .refine((data) => data.new_password !== data.current_password, {
    path: ["new_password"],
    message: "New password must be different from the current password",
  });

/** @typedef {z.infer<typeof changePasswordSchema>} ChangePasswordInput */
