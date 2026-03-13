/**
 * Base API client: credentials, JSON, and typed error handling.
 * Sends stored access token in Authorization header when available.
 * On 401, clears auth state so expired token is reflected in the UI.
 */

import { store } from "@/store";
import { clearUser } from "@/store/authSlice";

const getBaseUrl = () => import.meta.env.VITE_API_URL ?? "";

function getAccessToken(): string | null {
  return store.getState().auth.accessToken;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${getBaseUrl()}${path}`;
  const token = getAccessToken();
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) store.dispatch(clearUser());
    const message = json?.error ?? res.statusText ?? "Request failed";
    throw new ApiRequestError(res.status, message, json?.code);
  }

  return json as T;
}

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}
