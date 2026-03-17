/**
 * Employee / super admin auth (Smart Work backend: POST /api/auth/login, GET /api/auth/session, POST /api/auth/logout).
 */

import type { AuthUser } from "@/types/auth";

const getBaseUrl = () => import.meta.env.VITE_API_URL ?? "";

export interface LoginResponse {
  data: { token: string; employee: AuthUser };
  success: true;
}

export interface SessionResponse {
  data: AuthUser;
  success: true;
}

export const authApi = {
  async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    const url = `${getBaseUrl()}/api/auth/login`;
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = json?.error ?? res.statusText ?? "Login failed";
      throw new AuthError(res.status, message, json?.code);
    }
    return json as LoginResponse;
  },

  /** Returns current user or null if not authenticated (401). Used for session restore when no user in store. */
  async getSession(): Promise<AuthUser | null> {
    const url = `${getBaseUrl()}/api/auth/session`;
    const res = await fetch(url, { credentials: "include" });
    if (res.status === 401) return null;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new AuthError(res.status, json?.error ?? "Request failed", json?.code);
    return (json as SessionResponse).data;
  },

  async logout(): Promise<void> {
    const url = `${getBaseUrl()}/api/auth/logout`;
    await fetch(url, { method: "POST", credentials: "include" });
  },
};

export class AuthError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}
