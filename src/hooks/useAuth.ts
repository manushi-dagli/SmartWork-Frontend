import { useAuthContext } from "@/contexts/AuthContext";

export function useAuth() {
  const { user, isPending, error, isAuthenticated, login, logout, clearError } = useAuthContext();
  return {
    user,
    isPending,
    error,
    isAuthenticated,
    login,
    logout,
    clearError,
  };
}
