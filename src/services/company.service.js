import { ApiError, apiClient } from "@/lib/api-client"

// Company-facing API (separate from the Super Admin API in auth.service.js).

export async function registerCompany(input) {
  return apiClient("/v1/organizations/register", { method: "POST", body: input })
}

export async function verifyEmail(token) {
  return apiClient("/v1/organizations/verify-email", { method: "POST", body: { token } })
}

export async function resendVerification(email) {
  return apiClient("/v1/organizations/resend-verification", { method: "POST", body: { email } })
}

export async function companyLogin(credentials) {
  return apiClient("/v1/auth/login", { method: "POST", body: credentials })
}

export async function companyLogout() {
  return apiClient("/v1/auth/logout", { method: "POST" })
}

/** The logged-in company user, or null if there is no valid company session. */
export async function getCompanyMe() {
  try {
    return (await apiClient("/v1/auth/me")).data
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}

export async function getRegistrationStatus() {
  return (await apiClient("/v1/organizations/registration-status")).data
}
