const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('gradient365_token')
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  get:    <T>(path: string)                      => apiRequest<T>(path),
  post:   <T>(path: string, body: unknown)       => apiRequest<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)       => apiRequest<T>(path, { method: 'PUT',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)       => apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string)                      => apiRequest<T>(path, { method: 'DELETE' }),
}
