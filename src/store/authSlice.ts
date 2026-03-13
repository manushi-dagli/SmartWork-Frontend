import { createSlice } from "@reduxjs/toolkit";
import type { AuthUser } from "@/types/auth";

const AUTH_STORAGE_KEY = "smartwork_auth";
const ACCESS_TOKEN_KEY = "smartwork_access_token";

function loadUserFromStorage(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function loadAccessTokenFromStorage(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

function saveToStorage(user: AuthUser | null, accessToken: string | null): void {
  if (user) {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  if (accessToken) {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } catch {
      // ignore
    }
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

const storedUser = loadUserFromStorage();
const storedAccessToken = loadAccessTokenFromStorage();

export type SetUserPayload =
  | { user: AuthUser; accessToken?: string }
  | { user: null; accessToken?: null };

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser,
    accessToken: storedAccessToken,
    isPending: !storedUser,
  },
  reducers: {
    setUser(state, action: { payload: SetUserPayload }) {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = user != null ? (accessToken ?? state.accessToken) : null;
      state.isPending = false;
      saveToStorage(state.user, state.accessToken);
    },
    setPending(state, action: { payload: boolean }) {
      state.isPending = action.payload;
    },
    clearUser(state) {
      state.user = null;
      state.accessToken = null;
      state.isPending = false;
      saveToStorage(null, null);
    },
  },
});

export const { setUser, setPending, clearUser } = authSlice.actions;
