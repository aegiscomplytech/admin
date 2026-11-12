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

// ---------- Company registration (same rules as backend organizations.validation.ts) ----------

const requiredText = (label, min, max) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`)

const emailField = (label) =>
  z.string().trim().min(1, `${label} is required`).max(255, `${label} is too long`).pipe(z.email("Enter a valid email address"))

// No password: the system creates the Admin ID + temporary password and emails them.
export const companyRegistrationSchema = z.object({
  legal_name: requiredText("Company legal name", 2, 255),
  business_email: emailField("Business email"),
  contact_name: requiredText("Contact person name", 2, 150),
  contact_email: emailField("Contact email"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .max(30, "Phone number is too long")
    .regex(/^\+?[\d\s\-()]+$/, "Enter a valid phone number")
    .refine((value) => {
      const digits = value.replace(/\D/g, "").length
      return digits >= 7 && digits <= 15
    }, "Enter a valid phone number"),
  website: z.string().trim().max(255, "Website is too long").optional(),
  address: z.string().trim().max(1000, "Address is too long").optional(),
})

/** @typedef {z.infer<typeof companyRegistrationSchema>} CompanyRegistrationInput */

/** Same format as the backend (security/credentials.service.ts), e.g. AEG-482913. */
export const ADMIN_ID_PATTERN = /^AEG-[1-9]\d{5}$/i

/** Company sign in: Admin ID (from the welcome email) or email address, plus password. */
export const companyLoginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Admin ID or email is required")
    .refine(
      (value) => ADMIN_ID_PATTERN.test(value) || z.email().safeParse(value).success,
      "Enter your Admin ID (e.g. AEG-123456) or your email address"
    ),
  password: z.string().min(1, "Password is required"),
})

// ---------- Plans (same rules as backend plans.validation.ts) ----------

export const planFormSchema = z.object({
  name: z.string().trim().min(2, "Plan name must be at least 2 characters").max(150, "Plan name must be at most 150 characters"),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9][A-Z0-9_-]{1,99}$/, "2–100 characters: letters, numbers, _ or - (e.g. PROFESSIONAL)"),
  description: z.string().trim().max(2000, "Description must be at most 2000 characters").optional(),
  price: z
    .string()
    .trim()
    .min(1, "Price is required")
    .regex(/^\d{1,10}(\.\d{1,2})?$/, "Enter a price such as 9999 or 9999.50 (0 or more, max 2 decimals)"),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, "3-letter currency code, e.g. INR"),
  billingInterval: z.enum(["monthly", "quarterly", "yearly", "one_time"], { error: "Choose a billing interval" }),
  durationDays: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 3650), "Whole number of days between 1 and 3650, or empty"),
  isActive: z.boolean(),
})
