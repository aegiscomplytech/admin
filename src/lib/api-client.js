const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

/** Error thrown for any failed API call. `errors` holds field errors from validation. */
export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export async function apiClient(path, { body, headers, ...init } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      // Sends the HTTP-only session cookie with every request
      credentials: "same-origin",
      ...init,
      headers: { "Content-Type": "application/json", ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Unable to reach the server. Please check your connection and try again.", 0);
  }

  const payload = res.status === 204 ? undefined : await res.json().catch(() => undefined);

  if (!res.ok) {
    throw new ApiError(
      payload?.message ?? `Request failed: ${res.status} ${res.statusText}`,
      res.status,
      payload?.errors
    );
  }

  return payload;
}
