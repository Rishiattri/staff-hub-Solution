export async function api<T>(path: string, options: RequestInit = {}) {
  const auth = typeof window !== "undefined" ? localStorage.getItem("staffhub_auth") : null;
  const parsedAuth = auth ? JSON.parse(auth) : null;
  const token = parsedAuth?.token;

  const res = await fetch(`http://localhost:3001/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}

export function getStoredAuth() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem("staffhub_auth");
  return raw ? JSON.parse(raw) : null;
}
