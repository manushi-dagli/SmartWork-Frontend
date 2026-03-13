import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authApi } from "@/api/auth.api";
import type { AuthUser } from "@/types/auth";
import { setUser, setPending, clearUser } from "@/store/authSlice";
import type { AppDispatch, RootState } from "@/store";

interface AuthContextValue {
  user: AuthUser | null;
  isPending: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const isPending = useSelector((state: RootState) => state.auth.isPending);

  useEffect(() => {
    let cancelled = false;
    if (user) {
      dispatch(setPending(false));
      authApi
        .getMe()
        .then((me) => {
          if (!cancelled && me) dispatch(setUser({ user: me }));
        })
        .catch(() => {});
    } else {
      dispatch(setPending(true));
      authApi
        .getMe()
        .then((me) => {
          if (!cancelled) dispatch(setUser({ user: me ?? null }));
        })
        .catch(() => {
          if (!cancelled) dispatch(clearUser());
        })
        .finally(() => {
          if (!cancelled) dispatch(setPending(false));
        });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (usernameOrEmail: string, password: string) => {
      const res = await authApi.login(usernameOrEmail, password);
      const employee = res.data?.employee as AuthUser | undefined;
      const token = res.data?.token;
      if (employee && token) dispatch(setUser({ user: employee, accessToken: token }));
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    dispatch(clearUser());
  }, [dispatch]);

  const clearError = useCallback(() => {}, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isPending,
      error: null,
      isAuthenticated: !!user,
      login,
      logout,
      clearError,
    }),
    [user, isPending, login, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
