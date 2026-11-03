const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function apiClient(path, { body, headers, ...init } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  return res.status === 204 ? undefined : res.json();
}
